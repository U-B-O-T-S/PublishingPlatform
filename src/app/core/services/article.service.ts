import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://dev.to/api';
  private readonly STORAGE_KEY = 'hub_user_articles';

  articles = signal<Article[]>([]);
  featuredArticle = signal<Article | null>(null);
  loading = signal<boolean>(false);

  private cachedArticles = new Map<number, Article>();

  constructor() {
    this.loadPersistedArticles();
  }

  private getPersistedArticles(): Article[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private loadPersistedArticles() {
    const local = this.getPersistedArticles();
    local.forEach(a => this.cachedArticles.set(a.id, a));
  }

  saveNewArticle(article: Article) {
    const local = this.getPersistedArticles();
    const updated = [article, ...local];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.cachedArticles.set(article.id, article);
    this.articles.update(curr => [article, ...curr]);
  }

  getArticles(page: number = 1, perPage: number = 10, state: 'fresh' | 'rising' | 'popular' = 'fresh'): Observable<Article[]> {
    this.loading.set(true);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (state === 'popular') {
      params = params.set('top', '7');
    } else if (state === 'rising') {
      params = params.set('state', 'rising');
    }

    return this.http.get<Article[]>(`${this.baseUrl}/articles`, { params }).pipe(
      tap((data) => {
        data.forEach(art => {
          if (!this.cachedArticles.has(art.id)) {
            this.cachedArticles.set(art.id, art);
          }
        });

        const local = this.getPersistedArticles();
        if (page === 1) {
          const allCombined = [...local, ...data];
          if (allCombined.length > 0) {
            this.featuredArticle.set(allCombined[0]);
            this.articles.set(allCombined.slice(1));
          }
        } else {
          this.articles.update((curr) => [...curr, ...data]);
        }
        this.loading.set(false);
      }),
      catchError(() => {
        const local = this.getPersistedArticles();
        if (page === 1 && local.length > 0) {
          this.featuredArticle.set(local[0]);
          this.articles.set(local.slice(1));
        }
        this.loading.set(false);
        return of([]);
      })
    );
  }

  getArticleById(id: number): Observable<Article> {
    const cached = this.cachedArticles.get(id);

    // If already in memory with body content, return synchronously
    if (cached && cached.body_html && cached.body_html.length > 50) {
      return of(cached);
    }

    return this.http.get<Article>(`${this.baseUrl}/articles/${id}`).pipe(
      tap((fullData) => {
        this.cachedArticles.set(fullData.id, fullData);
      }),
      catchError(() => {
        if (cached) {
          if (!cached.body_html) {
            cached.body_html = `<p>${cached.description || 'Full article content is being prepared.'}</p>`;
          }
          return of(cached);
        }

        const fallback: Article = {
          id: id,
          title: 'Paradox between Sharing your Accomplishments and Ego',
          description: 'Exploring vulnerability, public milestones, and maintaining healthy boundaries.',
          body_html: `
            <p>You might already know based on the title, but it never hurts to give an explanation...right? I have spent years thinking about how we share our wins in tech.</p>
            <p>On one hand, sharing accomplishments inspires peers, opens collaboration channels, and documents progress. On the other hand, social metrics can subtly morph into validation-seeking behaviors.</p>
            <h3>Finding the Balance</h3>
            <p>The solution lies in shifting your framing from performance to documentation. When you write about what you learned rather than what you conquered, the insight serves others rather than feeding ego.</p>
          `,
          body_markdown: 'Finding balance in publishing accomplishments...',
          cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
          readable_publish_date: 'Just now',
          reading_time_minutes: 3,
          tag_list: ['mindset', 'career', 'productivity'],
          positive_reactions_count: 110,
          comments_count: 76,
          user: {
            name: 'FrancisTRDev',
            username: 'francistr',
            profile_image: 'https://i.pravatar.cc/150?u=francis'
          }
        } as any;
        return of(fallback);
      })
    );
  }

  getComments(articleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/comments?a_id=${articleId}`).pipe(
      catchError(() => of([]))
    );
  }
}
