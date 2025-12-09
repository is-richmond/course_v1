import axios from "axios";

// src/config/axiosConfig.ts
export const timeout = 10000;
export const headers = {
    "Content-Type": "application/json",
};
const baseURL = process.env.NEXT_PUBLIC_API_URL;
const instance = axios.create({
    baseURL,
    timeout,
    headers,
});

// Add token to axios requests
instance.interceptors.request.use((config) => {

    if (!config.headers.Authorization) {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add response interceptor for error handling
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Очищаем токен и перенаправляем на страницу входа
            localStorage.removeItem('access_token');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

export default instance;