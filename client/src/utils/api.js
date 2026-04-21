import axios from 'axios';

// Detect if we are running in production on Render or locally
const getBaseURL = () => {
    if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
    if (window.location.hostname === 'localhost') return '/api';
    return '/api'; // Use relative path for production on Render
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('[API CONFIG] Current Base URL:', api.defaults.baseURL);

// Add a request interceptor to include the token
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo') 
            ? JSON.parse(localStorage.getItem('userInfo')) 
            : null;

        const directToken = localStorage.getItem('token');

        const token = userInfo?.token || directToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Remove application/json if sending FormData
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log(
            `[API SUCCESS] ${response.config.method.toUpperCase()} ${response.config.url}`,
            response.data
        );
        return response;
    },
    (error) => {
        console.error(
            `[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
            error.response?.data || error.message
        );
        return Promise.reject(error);
    }
);

export default api;