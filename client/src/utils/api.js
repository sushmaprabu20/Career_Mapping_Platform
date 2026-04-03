import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';
console.log('[API] Initializing with baseURL:', rawBaseURL);

if (rawBaseURL !== '/api' && !rawBaseURL.endsWith('/api') && !rawBaseURL.endsWith('/api/')) {
    console.warn('[API WARNING] baseURL might be missing "/api" suffix. Incoming requests might 404 on the backend.');
}

const api = axios.create({
    baseURL: rawBaseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
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
        console.log(`[API SUCCESS] ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
