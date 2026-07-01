import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8001'),
});

// Response interceptor to handle errors
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.status, error.response?.data);
        // Ensure we always return an error with predictable structure
        if (error.response?.data) {
            return Promise.reject(error);
        }
        // Return a structured error if response is not available
        return Promise.reject({
            response: {
                data: { detail: error.message || 'Unknown error' },
                status: error.response?.status || 500
            }
        });
    }
);

export default api;
