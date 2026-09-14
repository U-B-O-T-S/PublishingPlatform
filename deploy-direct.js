const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const TOKEN = 'nfp_u9wSXEYLR3HvChniXssW5mUnzhrjPUUfddc7';
const DIST_DIR = path.resolve(__dirname, 'dist', 'publishing-platform', 'browser');

function apiRequest(method, endpoint, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.netlify.com',
      port: 443,
      path: '/api/v1' + endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        ...headers
      }
    };

    if (data && !headers['Content-Type']) {
      options.headers['Content-Type'] = 'application/json';
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
          else reject(new Error(`[${res.statusCode}] ` + (parsed.message || body)));
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(body);
          else reject(new Error(`[${res.statusCode}] ` + body));
        }
      });
    });

    req.on('error', reject);
    if (data) {
      if (Buffer.isBuffer(data)) req.write(data);
      else req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

function getAllFiles(dir, base = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const relPath = '/' + path.relative(DIST_DIR, fullPath).replace(/\\/g, '/');
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, relPath));
    } else {
      const buffer = fs.readFileSync(fullPath);
      const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');
      results.push({ fullPath, relPath, sha1, buffer });
    }
  });
  return results;
}

async function run() {
  console.log('1. Scanning build files...');
  const files = getAllFiles(DIST_DIR);
  console.log(`Found ${files.length} production files.`);

  const filesMap = {};
  files.forEach(f => { filesMap[f.relPath] = f.sha1; });

  console.log('2. Creating or finding Netlify site...');
  let site;
  try {
    site = await apiRequest('POST', '/sites', { name: 'publishhub-' + Math.floor(Math.random() * 10000) });
  } catch (err) {
    const sites = await apiRequest('GET', '/sites');
    site = sites[0];
  }
  console.log(`Target Site: ${site.name} (${site.id})`);

  console.log('3. Initializing production deploy...');
  const deploy = await apiRequest('POST', `/sites/${site.id}/deploys`, { files: filesMap });
  const required = deploy.required || [];
  console.log(`Deploy ID: ${deploy.id}. Files to upload: ${required.length}`);

  for (let i = 0; i < required.length; i++) {
    const sha = required[i];
    const item = files.find(f => f.sha1 === sha);
    if (item) {
      process.stdout.write(`Uploading [${i + 1}/${required.length}]: ${item.relPath}... \r`);
      await apiRequest('PUT', `/deploys/${deploy.id}/files${item.relPath}`, item.buffer, {
        'Content-Type': 'application/octet-stream'
      });
    }
  }

  console.log('\n\n=============================================');
  console.log('?? DEPLOYMENT SUCCESSFUL!');
  console.log('Live URL: ' + (deploy.ssl_url || deploy.url || site.ssl_url || site.url));
  console.log('=============================================\n');
}

run().catch(err => {
  console.error('\nDeploy failed:', err.message);
});
