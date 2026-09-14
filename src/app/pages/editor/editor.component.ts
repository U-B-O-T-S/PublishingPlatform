import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { Article } from '../../core/models/article.model';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  private router = inject(Router);
  private articleService = inject(ArticleService);

  title = signal<string>('');
  contentHtml = signal<string>('');
  coverImage = signal<string>('');
  selectedCategory = signal<string>('Technology');
  scheduledDate = signal<string>('');
  saveStatus = signal<'Saved' | 'Saving...' | 'Unsaved changes'>('Saved');
  showScheduleModal = signal<boolean>(false);

  categories = ['Technology', 'Design', 'Programming', 'Career', 'Productivity'];

  private autoSaveTimeout: any;

  ngOnInit() {
    this.loadDraft();
  }

  onContentChange() {
    this.saveStatus.set('Unsaved changes');
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveDraft();
    }, 1200);
  }

  saveDraft() {
    this.saveStatus.set('Saving...');
    const draft = {
      title: this.title(),
      content: this.contentHtml(),
      coverImage: this.coverImage(),
      category: this.selectedCategory(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('hub_article_draft', JSON.stringify(draft));
    setTimeout(() => {
      this.saveStatus.set('Saved');
    }, 400);
  }

  loadDraft() {
    const raw = localStorage.getItem('hub_article_draft');
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        this.title.set(draft.title || '');
        this.contentHtml.set(draft.content || '');
        this.coverImage.set(draft.coverImage || '');
        this.selectedCategory.set(draft.category || 'Technology');
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }

  onThumbnailPrompt() {
    const url = prompt('Enter Image URL for Cover Thumbnail:', this.coverImage() || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800');
    if (url) {
      this.coverImage.set(url);
      this.onContentChange();
    }
  }

  publishArticle() {
    if (!this.title().trim()) {
      alert('Please enter a title for your article.');
      return;
    }

    const newArticle: Article = {
      id: Date.now(),
      title: this.title(),
      description: this.contentHtml().replace(/<[^>]*>/g, '').slice(0, 140) + '...',
      body_html: `<p>${this.contentHtml().replace(/\n/g, '</p><p>')}</p>`,
      readable_publish_date: this.scheduledDate() ? `Scheduled: ${this.scheduledDate()}` : 'Just now',
      created_at: new Date().toISOString(),
      published_at: this.scheduledDate() || new Date().toISOString(),
      cover_image: this.coverImage() || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      tag_list: [this.selectedCategory().toLowerCase(), 'article'],
      reading_time_minutes: Math.max(1, Math.ceil(this.contentHtml().split(' ').length / 180)),
      positive_reactions_count: 1,
      comments_count: 0,
      user: {
        name: 'You (Author)',
        username: 'you',
        profile_image: 'https://i.pravatar.cc/100?img=33'
      }
    };

    this.articleService.saveNewArticle(newArticle);
    localStorage.removeItem('hub_article_draft');

    alert(this.scheduledDate() ? 'Post scheduled successfully!' : 'Article published successfully!');
    this.router.navigate(['/']);
  }
}
