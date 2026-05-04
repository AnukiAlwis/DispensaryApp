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

    config.headers["X-Tenant-ID"] = "f9a84146-cd5d-44da-b689-d6fd1c4ec896";
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
        error.response?.data?.message || error.message || "An error occurred";
      showSnackbar(message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
