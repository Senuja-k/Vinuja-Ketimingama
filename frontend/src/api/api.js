import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
    },
});

// Interceptor to add tokens based on role endpoints
api.interceptors.request.use((config) => {
    let token = null;

    if (config.url.startsWith('/admin')) {
        token = localStorage.getItem('admin_token');
    } else if (config.url.startsWith('/seller')) {
        token = localStorage.getItem('seller_token');
    } else if (config.url.startsWith('/customer')) {
        token = localStorage.getItem('customer_token');
    } else if (config.url.startsWith('/products') && config.method !== 'get') {
        // Seller CRUD on products
        token = localStorage.getItem('seller_token');
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
