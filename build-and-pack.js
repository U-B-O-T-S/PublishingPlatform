const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

let rootDir = path.resolve(__dirname, 'dist', 'publishing-platform');
if (fs.existsSync(path.join(rootDir, 'browser', 'index.html'))) {
  rootDir = path.join(rootDir, 'browser');
}

console.log('Packaging directory:', rootDir);

// Ensure _redirects is present for SPA routing
fs.writeFileSync(path.join(rootDir, '_redirects'), '/*    /index.html   200\n');

// Clean up previous zip
const zipPath = path.resolve(__dirname, 'deploy.zip');
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

// Create zip using PowerShell Compress-Archive for reliable Windows packaging
console.log('Compressing build artifacts...');
execSync(`powershell -Command "Compress-Archive -Path '${rootDir}\\*' -DestinationPath '${zipPath}' -Force"`, { stdio: 'inherit' });

console.log('Archive created. Size:', (fs.statSync(zipPath).size / 1024).toFixed(1), 'KB');

const TOKEN = 'nfp_u9wSXEYLR3HvChniXssW5mUnzhrjPUUfddc7';
const siteId = '461d2b26-dcc8-4094-8ceb-1a9353fcfb59';

console.log(`Deploying to Netlify (Site ID: ${siteId})...`);
const zipBuffer = fs.readFileSync(zipPath);

const req = https.request({
  hostname: 'api.netlify.com',
  port: 443,
  path: `/api/v1/sites/${siteId}/deploys`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/zip',
    'Content-Length': zipBuffer.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      console.log('Deploy Status Code:', res.statusCode);
      console.log('Deploy State:', data.state);
      console.log('Live URL:', data.ssl_url || data.url);
      console.log('\nDeployment finished successfully!');
    } catch {
      console.log('Response:', body);
    }
  });
});

req.on('error', (e) => console.error('Upload failed:', e));
req.write(zipBuffer);
req.end();
