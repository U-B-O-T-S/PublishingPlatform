import { Injectable, signal } from '@angular/core';

export interface User {
  id: string;
  name: string;
  displayName: string;
  email: string;
  avatar: string;
  photoURL: string;
  provider: 'local' | 'google' | 'github';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'publishhub_user';
  currentUser = signal<User | null>(this.loadUser());
  isModalOpen = signal<boolean>(false);

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  loginWithCredentials(email: string, name?: string) {
    const displayName = name || email.split('@')[0];
    const avatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(email);
    const user: User = {
      id: 'usr_' + Date.now(),
      name: displayName,
      displayName: displayName,
      email: email,
      avatar: avatar,
      photoURL: avatar,
      provider: 'local'
    };
    this.setUser(user);
  }

  async loginWithGoogle() {
    this.loginSocial('google');
  }

  async loginWithGithub() {
    this.loginSocial('github');
  }

  loginSocial(provider: 'google' | 'github') {
    const displayName = provider === 'google' ? 'Google Contributor' : 'Octocat Coder';
    const avatar = provider === 'google'
      ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser'
      : 'https://api.dicebear.com/7.x/avataaars/svg?seed=GithubUser';

    const user: User = {
      id: provider + '_' + Date.now(),
      name: displayName,
      displayName: displayName,
      email: provider + '.user@publishhub.io',
      avatar: avatar,
      photoURL: avatar,
      provider: provider
    };
    this.setUser(user);
  }

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser.set(null);
  }

  private setUser(user: User) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.closeModal();
  }
}
