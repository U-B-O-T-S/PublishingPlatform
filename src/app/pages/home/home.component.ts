import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { Article } from '../../core/models/article.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  articleService = inject(ArticleService);

  currentPage = signal<number>(1);
  currentSort = signal<'fresh' | 'rising' | 'popular'>('popular');
  isLoadingMore = signal<boolean>(false);

  ngOnInit() {
    this.loadFeed(1, this.currentSort(), true);
  }

  changeSort(sort: 'fresh' | 'rising' | 'popular') {
    if (this.currentSort() === sort) return;
    this.currentSort.set(sort);
    this.currentPage.set(1);
    this.loadFeed(1, sort, true);
  }

  loadMore() {
    const nextPage = this.currentPage() + 1;
    this.isLoadingMore.set(true);
    this.articleService.getArticles(nextPage, 8, this.currentSort()).subscribe({
      next: () => {
        this.currentPage.set(nextPage);
        this.isLoadingMore.set(false);
      },
      error: () => this.isLoadingMore.set(false)
    });
  }

  private loadFeed(page: number, sort: 'fresh' | 'rising' | 'popular', reset: boolean = false) {
    this.articleService.getArticles(page, 8, sort).subscribe();
  }
}
