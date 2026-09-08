import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const ACCESS_TOKEN_KEY = "cda_access_token";
const REFRESH_TOKEN_KEY = "cda_refresh_token";
const USERNAME_KEY = "cda_username";

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUsername: () => localStorage.getItem(USERNAME_KEY),
  set: (access, refresh, username) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    if (username) localStorage.setItem(USERNAME_KEY, username);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  },
};

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthEndpoint = config?.url?.includes("/auth/token");

    if (response?.status !== 401 || isAuthEndpoint || config._retried) {
      return Promise.reject(error);
    }

    const refresh = tokenStore.getRefresh();
    if (!refresh) {
      tokenStore.clear();
      return Promise.reject(error);
    }

    config._retried = true;
    try {
      refreshPromise ??= axios
        .post(`${BASE_URL}/auth/token/refresh/`, { refresh })
        .finally(() => {
          refreshPromise = null;
        });
      const { data } = await refreshPromise;
      tokenStore.set(data.access, data.refresh);
      config.headers.Authorization = `Bearer ${data.access}`;
      return client(config);
    } catch (refreshError) {
      tokenStore.clear();
      return Promise.reject(refreshError);
    }
  }
);

export default client;
