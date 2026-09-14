import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { Article, Author } from '../../core/models/article.model';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss']
})
export class DiscoverComponent implements OnInit {
  private articleService = inject(ArticleService);
  private route = inject(ActivatedRoute);

  searchQuery = signal<string>('');
  selectedTag = signal<string>('');
  filterType = signal<'articles' | 'author'>('articles');

  readersChoice = signal<Article[]>([]);
  allArticles = signal<Article[]>([]);
  filteredArticles = signal<Article[]>([]);
  authors = signal<Author[]>([]);
  filteredAuthors = signal<Author[]>([]);

  trendingTags = ['javascript', 'webdev', 'angular', 'beginners', 'react', 'python'];
  private searchWorker!: Worker;

  ngOnInit() {
    this.initWebWorker();
    this.loadDiscoverData();

    this.route.queryParams.subscribe((params) => {
      if (params['q']) {
        this.searchQuery.set(params['q']);
        this.runSearch();
      }
    });
  }

  initWebWorker() {
    if (typeof Worker !== 'undefined') {
      this.searchWorker = new Worker(new URL('../../workers/search.worker', import.meta.url));
      this.searchWorker.onmessage = ({ data }) => {
        if (this.filterType() === 'author') {
          const matchedAuthorNames = new Set(data.map((a: Article) => a.user.username));
          this.filteredAuthors.set(this.authors().filter(author => matchedAuthorNames.has(author.username)));
        } else {
          this.filteredArticles.set(data);
        }
      };
    }
  }

  loadDiscoverData() {
    this.articleService.getArticles(1, 24, 'popular').subscribe((data) => {
      this.allArticles.set(data);
      this.readersChoice.set(data.slice(0, 4));
      this.filteredArticles.set(data.slice(4));

      // Extract unique authors
      const authorMap = new Map<string, Author>();
      data.forEach((item) => {
        if (item.user && !authorMap.has(item.user.username)) {
          authorMap.set(item.user.username, item.user);
        }
      });
      const uniqueAuthors = Array.from(authorMap.values());
      this.authors.set(uniqueAuthors);
      this.filteredAuthors.set(uniqueAuthors);

      if (this.searchQuery()) {
        this.runSearch();
      }
    });
  }

  onFilterTag(tag: string) {
    if (this.selectedTag() === tag) {
      this.selectedTag.set('');
      this.searchQuery.set('');
    } else {
      this.selectedTag.set(tag);
      this.searchQuery.set(tag);
    }
    this.runSearch();
  }

  runSearch() {
    const query = this.searchQuery();
    if (this.searchWorker) {
      this.searchWorker.postMessage({
        articles: this.allArticles(),
        query,
        filterType: this.filterType()
      });
    } else {
      // Fallback if workers are disabled
      const q = query.toLowerCase();
      this.filteredArticles.set(
        this.allArticles().filter(a => a.title.toLowerCase().includes(q) || a.user.name.toLowerCase().includes(q))
      );
    }
  }
}
