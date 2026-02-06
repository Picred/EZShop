import { create } from 'zustand';
import { User } from '../types/api';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  initialize: () => void;
}

// Initialize from localStorage immediately
const initializeAuth = () => {
  const token = authService.getToken();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  console.log('[AuthStore] Initial load - token found:', !!token, 'user found:', !!user);
  
  if (token && user) {
    return { token, user, isAuthenticated: true, isInitialized: true };
  }
  return { token: null, user: null, isAuthenticated: false, isInitialized: true };
};

const initialState = initializeAuth();

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  login: (token: string, user: User) => {
    console.log('[AuthStore] Logging in, saving token:', token.substring(0, 20) + '...');
    authService.saveToken(token);
    authService.saveUser(user);
    console.log('[AuthStore] Token saved to localStorage');
    set({ token, user, isAuthenticated: true, isInitialized: true });
  },

  logout: () => {
    authService.logout();
    set({ token: null, user: null, isAuthenticated: false });
  },

  initialize: () => {
    const token = authService.getToken();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    console.log('[AuthStore] Re-initializing, token found:', !!token, 'user found:', !!user);
    
    if (token && user) {
      set({ token, user, isAuthenticated: true, isInitialized: true });
    } else {
      set({ isInitialized: true });
    }
  },
}));
