import { Component, OnInit, inject, signal, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, switchMap, tap, shareReplay } from 'rxjs';
import { ArticleService } from '../../core/services/article.service';
import { Article } from '../../core/models/article.model';
import { CommentDrawerComponent } from '../../shared/comment-drawer/comment-drawer.component';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CommentDrawerComponent],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss']
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private cdr = inject(ChangeDetectorRef);
  private appRef = inject(ApplicationRef);

  article$!: Observable<Article>;
  currentArticle = signal<Article | null>(null);
  isCommentsOpen = signal<boolean>(false);
  liked = signal<boolean>(false);

  ngOnInit() {
    this.article$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = Number(params.get('id'));
        return this.articleService.getArticleById(id);
      }),
      tap((art) => {
        this.currentArticle.set(art);
        this.cdr.markForCheck();
        setTimeout(() => this.appRef.tick(), 0);
      }),
      shareReplay(1)
    );
  }

  toggleLike(art: Article) {
    this.liked.set(!this.liked());
    art.positive_reactions_count = (art.positive_reactions_count || 0) + (this.liked() ? 1 : -1);
    this.cdr.markForCheck();
  }

  openComments() {
    this.isCommentsOpen.set(true);
  }

  closeComments() {
    this.isCommentsOpen.set(false);
  }
}
