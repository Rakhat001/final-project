'use client';

const ACCESS_TOKEN_KEY = 'accessToken';

export const tokenService = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  },

  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('refreshToken', token);
  },

  removeAccessToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem('refreshToken');
  }
};
