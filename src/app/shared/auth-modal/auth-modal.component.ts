import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (authService.isModalOpen()) {
      <div class="modal-backdrop" (click)="close()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Sign in to PublishHub</h3>
            <button class="close-btn" (click)="close()">&times;</button>
          </div>

          <!-- Local Email & Password Form -->
          <form (ngSubmit)="onLocalLogin()" class="login-form">
            <div class="input-group">
              <label>Email Address</label>
              <input type="email" [(ngModel)]="email" name="email" placeholder="you@domain.com" required />
            </div>

            <div class="input-group">
              <label>Password</label>
              <input type="password" [(ngModel)]="password" name="password" placeholder="��������" required />
            </div>

            <button type="submit" class="submit-btn" [disabled]="!email">Continue with Email</button>
          </form>

          <div class="divider"><span>OR CONTINUE WITH</span></div>

          <!-- Social Buttons -->
          <div class="social-actions">
            <button class="social-btn google-btn" (click)="loginWith('google')">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/><path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 15.9C3.5 19.7 7.4 23 12 23z"/></svg>
              Google
            </button>
            <button class="social-btn github-btn" (click)="loginWith('github')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6);
      display: flex; align-items: center; justify-content: center; z-index: 9999;
      backdrop-filter: blur(4px);
    }
    .modal-card {
      background: #ffffff; border-radius: 12px; width: 100%; max-width: 400px;
      padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
      .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
    }
    .login-form {
      display: flex; flex-direction: column; gap: 14px;
      .input-group {
        display: flex; flex-direction: column; gap: 6px;
        label { font-size: 0.82rem; font-weight: 600; color: #475569; }
        input {
          padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem;
          &:focus { outline: none; border-color: #2563eb; }
        }
      }
      .submit-btn {
        background: #2563eb; color: #fff; padding: 11px; border: none; border-radius: 6px;
        font-weight: 600; cursor: pointer; margin-top: 4px;
        &:hover { background: #1d4ed8; }
        &:disabled { opacity: 0.6; cursor: not-allowed; }
      }
    }
    .divider {
      position: relative; text-align: center; margin: 20px 0;
      &::before { content: ''; position: absolute; left: 0; top: 50%; width: 100%; height: 1px; background: #e2e8f0; }
      span { position: relative; background: #ffffff; padding: 0 10px; font-size: 0.72rem; color: #94a3b8; font-weight: 700; }
    }
    .social-actions {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
      .social-btn {
        display: flex; align-items: center; justify-content: center; gap: 8px;
        padding: 9px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff;
        font-size: 0.88rem; font-weight: 600; cursor: pointer; color: #334155;
        &:hover { background: #f8fafc; border-color: #94a3b8; }
      }
    }
  `]
})
export class AuthModalComponent {
  authService = inject(AuthService);
  email = '';
  password = '';

  close() {
    this.authService.closeModal();
  }

  onLocalLogin() {
    if (this.email) {
      this.authService.loginWithCredentials(this.email);
    }
  }

  loginWith(provider: 'google' | 'github') {
    this.authService.loginSocial(provider);
  }
}
