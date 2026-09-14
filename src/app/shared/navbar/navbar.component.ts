import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  private router = inject(Router);
  authService = inject(AuthService);

  searchQuery = '';
  showAuthModal = signal<boolean>(false);

  authEmail = '';
  authName = '';
  authPassword = '';

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/discover'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }

  handleDraftClick() {
    if (this.authService.currentUser()) {
      this.router.navigate(['/editor']);
    } else {
      this.showAuthModal.set(true);
    }
  }

  signInWithEmail() {
    if (!this.authEmail || !this.authEmail.includes('@')) return;
    this.authService.loginWithCredentials(this.authEmail.trim(), this.authName.trim());
    this.showAuthModal.set(false);
    this.authEmail = '';
    this.authName = '';
    this.authPassword = '';
  }

  async signInWithGoogle() {
    await this.authService.loginWithGoogle();
    this.showAuthModal.set(false);
  }

  async signInWithGithub() {
    await this.authService.loginWithGithub();
    this.showAuthModal.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
