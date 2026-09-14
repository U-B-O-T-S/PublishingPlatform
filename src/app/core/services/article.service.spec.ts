import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ArticleService } from './article.service';

describe('ArticleService', () => {
  let service: ArticleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ArticleService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ArticleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch articles and populate signals', () => {
    const dummyArticles: any[] = [
      { id: 1, title: 'Hero Post', description: 'Hero desc', user: { name: 'Author A' } },
      { id: 2, title: 'Feed Post 1', description: 'Feed desc 1', user: { name: 'Author B' } }
    ];

    service.getArticles(1, 10, 'fresh').subscribe((articles) => {
      expect(articles.length).toBe(2);
      expect(service.featuredArticle()?.id).toBe(1);
      expect(service.articles().length).toBe(1);
    });

    const req = httpMock.expectOne((request) => request.url.includes('/api/articles'));
    expect(req.request.method).toBe('GET');
    req.flush(dummyArticles);
  });
});
