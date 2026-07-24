// src/services/apiClient.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { showSnackbar } from "../utils/showSnackbar";

const apiClient = axios.create({
  //baseURL: import.meta.env.VITE_API_URL, // set in .env
  baseURL: "http://localhost:8080",

  timeout: 15000, // 15s timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (future Keycloak auth integration)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers ?? {};

    config.headers["X-Tenant-ID"] = "1f50d50d-f586-40ba-bba4-ca8e54624d37";
    config.headers["X-User-ID"] = "1fc9e3c0-7c95-40f6-bdf6-9251c0fefba9";
    // Example: attach auth token when Keycloak is integrated
    // const token = getTokenFromStoreOrContext();
    // if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
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
