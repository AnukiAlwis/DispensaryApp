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

  // Update auth credentials in Redux
  const { store } = await import('../store');
  const { setCredentials } = await import('../store/authSlice');
  store.dispatch(setCredentials({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  }));

  // Update user details in Redux if user data is returned
  if (response.user) {
    const { setUserDetails } = await import('../store/userSlice');
    store.dispatch(setUserDetails({
      id: response.user.id,
      username: response.user.username,
      fullName: response.user.fullName,
      email: response.user.email ?? '',
      phone: response.user.phone ?? '',
      role: response.user.role as any,
      doctorCharge: response.user.doctorCharge,
      tenantId: response.user.tenantId,
      createdAt: response.user.createdAt,
      updatedAt: response.user.updatedAt,
    }));
  }

  return response.accessToken;
};

// Decode the access token payload without verifying the signature.
// Safe for UI-only use; backend still validates the real token.
export const getUserIdFromToken = (): string | null => {
  const token = getTokenFromStore();
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.sub || null;
  } catch {
    return null;
  }
};
