// src/api/axios.ts
import axios from 'axios';
import { store } from '../store';
import { logOut, setCredentials } from '../store/authSlice';
import type { User } from '../store/authSlice';

// 1. Create a new Axios instance with a base URL and cookie support
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// 2. Request Interceptor: This runs BEFORE each request is sent.
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      // If a token exists, automatically add it to the Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor: This runs AFTER a response is received.
api.interceptors.response.use(
  // If the response is successful, just return it
  (response) => response,
  // If the response has an error (like 401 Unauthorized)
  async (error) => {
    const originalRequest = error.config;
    // Check if the error is a 401 and if it's the first time trying this request
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark it so we don't get stuck in a loop

      try {
        // Attempt to get a new access token from the backend
        const { data } = await api.post('/auth/refresh-token');
        const { accessToken } = data.data;

        // Get the current user from the Redux store
        const user = store.getState().auth.user;
        
        // Update the Redux store with the new access token
        store.dispatch(setCredentials({ user: user as User, token: accessToken }));

        // Update the header of the original failed request
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        // If the refresh token also fails, the user's session is truly expired.
        console.error('Session has expired. Please log in again.');
        store.dispatch(logOut());
        // Force a redirect to the login page
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    // For any other errors, just return them
    return Promise.reject(error);
  }
);

export default api;