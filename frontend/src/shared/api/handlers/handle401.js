// libs imports
import axios from "axios";

// let variables to manage token refresh state
let isRefreshing = false;
let queue = [];

// function to process the queue of requests waiting for token refresh
const processQueue = (error) => {
  queue.forEach((promise) => {
    error ? promise.reject(error) : promise.resolve();
  });
  queue = [];
};

// function to refresh the access token
const refreshToken = () => {
  return axios.post(
    `${import.meta.env.VITE_BACKEND_URL}${
      import.meta.env.VITE_API_VERSION
    }/auth/refresh-token`,
    {},
    { withCredentials: true }
  );
};

// main function to handle 401 errors
export async function handle401(error, apiClient) {
  const originalRequest = error.config;

  if (originalRequest._retry) {
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      queue.push({ resolve, reject });
    }).then(() => apiClient(originalRequest));
  }

  isRefreshing = true;

  try {
    await refreshToken();
    processQueue(null);
    return apiClient(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError);
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
}
