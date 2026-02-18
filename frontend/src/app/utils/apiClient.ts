import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || '';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, logout } = useAuthStore.getState();
    const { params, headers, ...customConfig } = options;

    const config: RequestInit = {
        ...customConfig,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...headers,
        },
    };

    let url = `${API_URL}${endpoint}`;
    if (params) {
        const queryParams = new URLSearchParams(params).toString();
        url += `?${queryParams}`;
    }

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
            logout();
            throw new Error('Session expired. Please login again.');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Something went wrong');
        }

        return data as T;
    } catch (error: any) {
        console.error(`API Error (${endpoint}):`, error.message);
        throw error;
    }
}

export const apiClient = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

    put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'DELETE' }),
};
