import api from './api';
import { UserLoginRequest, TokenResponse, User } from '../types/api';

export const authService = {
  async login(credentials: UserLoginRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth', credentials);
    return response.data;
  },

  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  logout() {
    console.log('[AuthService] Logging out, clearing localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  saveToken(token: string) {
    console.log('[AuthService] Saving token to localStorage:', token.substring(0, 20) + '...');
    localStorage.setItem('token', token);
    // Verify it was saved
    const saved = localStorage.getItem('token');
    console.log('[AuthService] Token saved successfully:', saved === token);
  },

  saveUser(user: User) {
    console.log('[AuthService] Saving user to localStorage:', user.username);
    localStorage.setItem('user', JSON.stringify(user));
    // Verify it was saved
    const saved = localStorage.getItem('user');
    console.log('[AuthService] User saved successfully:', !!saved);
  },

  getToken(): string | null {
    const token = localStorage.getItem('token');
    console.log('[AuthService] Getting token from localStorage:', token ? token.substring(0, 20) + '...' : 'null');
    return token;
  },
};
