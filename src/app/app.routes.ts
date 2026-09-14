import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DiscoverComponent } from './pages/discover/discover.component';
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';
import { EditorComponent } from './pages/editor/editor.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'discover', component: DiscoverComponent },
  { path: 'article/:id', component: ArticleDetailComponent },
  { path: 'editor', component: EditorComponent },
  { path: '**', redirectTo: '' }
];
