// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getTokenFromStore = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshTokenFromStore = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Refresh access token using refresh token
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshTokenFromStore();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Import here to avoid circular dependency
  const { refresh } = await import('../services/authApiService');
  const response = await refresh(refreshToken);

  // Update tokens in localStorage
  setTokens(response.accessToken, response.refreshToken);

  return response.accessToken;
};
