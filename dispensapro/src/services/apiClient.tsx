// src/services/apiClient.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { showSnackbar } from "../utils/showSnackbar";
import { getTokenFromStore, clearTokens, getRefreshTokenFromStore, setTokens } from "../utils/auth";
import { refresh } from "./authApiService";
import { store } from "../store";
import { clearCredentials, setCredentials } from "../store/authSlice";
import { clearUserDetails, setUserDetails } from "../store/userSlice";

const apiClient = axios.create({
  //baseURL: import.meta.env.VITE_API_URL, // set in .env
  baseURL: "http://localhost:8080",

  timeout: 15000, // 15s timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers ?? {};

    // Keep X-Tenant-ID for developer visibility (informational only)
    config.headers["X-Tenant-ID"] = "1f50d50d-f586-40ba-bba4-ca8e54624d37";

    // Add Authorization header with Bearer token
    const token = getTokenFromStore();
    if (token) config.headers["Authorization"] = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors with automatic token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshTokenFromStore();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const authResponse = await refresh(refreshToken);
        
        // Update tokens in localStorage
        setTokens(authResponse.accessToken, authResponse.refreshToken);
        
        // Update auth credentials in Redux
        store.dispatch(setCredentials({
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
        }));

        // Update user details in Redux if user data is returned
        if (authResponse.user) {
          store.dispatch(setUserDetails({
            id: authResponse.user.id,
            username: authResponse.user.username,
            fullName: authResponse.user.fullName,
            email: authResponse.user.email ?? '',
            phone: authResponse.user.phone ?? '',
            role: authResponse.user.role as any,
            doctorCharge: authResponse.user.doctorCharge,
            tenantId: authResponse.user.tenantId,
            createdAt: authResponse.user.createdAt,
            updatedAt: authResponse.user.updatedAt,
          }));
        }

        // Update Authorization header for retry
        originalRequest.headers.Authorization = `Bearer ${authResponse.accessToken}`;
        // Retry original request with new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        clearTokens();
        store.dispatch(clearCredentials());
        store.dispatch(clearUserDetails());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Default behavior: show snackbar unless disabled
    if (error.config?.headers?.["x-suppress-snackbar"] !== true) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An error occurred";
      showSnackbar(message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
