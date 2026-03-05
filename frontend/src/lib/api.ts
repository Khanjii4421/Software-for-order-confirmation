import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        let token = '';
        // Access token safely in both client & server components where possible
        if (typeof window !== 'undefined') {
            token = localStorage.getItem('token') || '';
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle unauth
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handling generic 401s if we want to logout
        if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
