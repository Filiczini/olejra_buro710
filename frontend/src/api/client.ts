import axios from 'axios';

// Auth is cookie-based (httpOnly access_token + refresh_token set by the backend).
// withCredentials makes axios send them on every request.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

function subscribeTokenRefresh(cb: () => void) {
  refreshSubscribers.push(cb);
}

api.interceptors.request.use(
  (config) => {
    // Дозволити Axios автоматично встановлювати Content-Type для FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 on protected endpoints, skip login/refresh/me themselves.
    // /admin/me is the auth probe — a 401 there just means "not logged in".
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/admin/login') &&
      !originalRequest.url?.includes('/admin/refresh') &&
      !originalRequest.url?.includes('/admin/me')
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // Refresh token travels as an httpOnly cookie; no body needed.
        await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/admin/refresh`,
          {},
          { withCredentials: true }
        );

        onRefreshed();
        return api(originalRequest);
      } catch {
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
