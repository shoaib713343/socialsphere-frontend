import axios from "axios";
import { store } from "@/store/store";
import { setCredentials, logOut } from "@/store/authSlice";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        store.dispatch(setCredentials({ 
            user: store.getState().auth.user!,
            token: data.data.accessToken 
        }));

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
        } catch (refreshError) {
        store.dispatch(logOut());
        return Promise.reject(refreshError);
      }
      }

    return Promise.reject(error);
  }
);

export default api;
