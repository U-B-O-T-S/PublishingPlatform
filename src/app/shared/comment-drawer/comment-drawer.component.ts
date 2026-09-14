import { Component, Input, Output, EventEmitter, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentItem } from '../../core/models/article.model';
import { ArticleService } from '../../core/services/article.service';

@Component({
  selector: 'app-comment-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-drawer.component.html',
  styleUrls: ['./comment-drawer.component.scss']
})
export class CommentDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() articleId: number | null = null;
  @Output() closeDrawer = new EventEmitter<void>();

  private articleService = inject(ArticleService);

  comments = signal<CommentItem[]>([]);
  newCommentText = '';
  replyTextMap: { [key: string]: string } = {};
  replyingToId = signal<string | null>(null);
  sortOrder = signal<'newest' | 'oldest'>('newest');

  // Track liked comments locally to prevent infinite likes
  likedCommentIds = new Set<string>();

  ngOnChanges(changes: SimpleChanges) {
    if (this.isOpen && this.articleId) {
      this.loadLikedState();
      this.fetchComments();
    }
  }

  private loadLikedState() {
    const raw = localStorage.getItem('hub_liked_comments');
    if (raw) {
      try {
        this.likedCommentIds = new Set(JSON.parse(raw));
      } catch (e) {
        this.likedCommentIds = new Set();
      }
    }
  }

  private saveLikedState() {
    localStorage.setItem('hub_liked_comments', JSON.stringify(Array.from(this.likedCommentIds)));
  }

  isCommentLiked(id_code: string): boolean {
    return this.likedCommentIds.has(id_code);
  }

  fetchComments() {
    if (!this.articleId) return;

    const storageKey = `hub_comments_${this.articleId}`;
    const localRaw = localStorage.getItem(storageKey);
    const localComments: CommentItem[] = localRaw ? JSON.parse(localRaw) : [];

    this.articleService.getComments(this.articleId).subscribe((apiComments) => {
      const merged = [...localComments, ...(apiComments || [])];
      this.comments.set(merged);
      this.sortComments();
    });
  }

  setSortOrder(order: 'newest' | 'oldest') {
    this.sortOrder.set(order);
    this.sortComments();
  }

  sortComments() {
    const list = [...this.comments()];
    list.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return this.sortOrder() === 'newest' ? timeB - timeA : timeA - timeB;
    });
    this.comments.set(list);
  }

  postComment() {
    if (!this.newCommentText.trim() || !this.articleId) return;

    const newComment: CommentItem = {
      id_code: 'loc_' + Date.now(),
      created_at: new Date().toISOString(),
      body_html: `<p>${this.newCommentText.trim()}</p>`,
      likes: 0,
      user: {
        name: 'You (Author)',
        username: 'you',
        profile_image_90: 'https://i.pravatar.cc/100?img=33'
      },
      children: []
    };

    const updated = [newComment, ...this.comments()];
    this.comments.set(updated);

    const storageKey = `hub_comments_${this.articleId}`;
    const localRaw = localStorage.getItem(storageKey);
    const existing: CommentItem[] = localRaw ? JSON.parse(localRaw) : [];
    localStorage.setItem(storageKey, JSON.stringify([newComment, ...existing]));

    this.newCommentText = '';
  }

  postReply(parentComment: CommentItem) {
    const replyContent = this.replyTextMap[parentComment.id_code];
    if (!replyContent || !replyContent.trim() || !this.articleId) return;

    const reply: CommentItem = {
      id_code: 'reply_' + Date.now(),
      created_at: new Date().toISOString(),
      body_html: `<p>${replyContent.trim()}</p>`,
      likes: 0,
      user: {
        name: 'You (Author)',
        username: 'you',
        profile_image_90: 'https://i.pravatar.cc/100?img=33'
      },
      children: []
    };

    parentComment.children = [...(parentComment.children || []), reply];
    this.replyTextMap[parentComment.id_code] = '';
    this.replyingToId.set(null);

    const storageKey = `hub_comments_${this.articleId}`;
    localStorage.setItem(storageKey, JSON.stringify(this.comments()));
  }

  toggleLike(item: CommentItem) {
    if (this.likedCommentIds.has(item.id_code)) {
      this.likedCommentIds.delete(item.id_code);
      item.likes = Math.max(0, (item.likes || 1) - 1);
    } else {
      this.likedCommentIds.add(item.id_code);
      item.likes = (item.likes || 0) + 1;
    }
    this.saveLikedState();

    if (this.articleId) {
      const storageKey = `hub_comments_${this.articleId}`;
      localStorage.setItem(storageKey, JSON.stringify(this.comments()));
    }
  }
}
