import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - inject auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string; college?: string; batch?: string; preferredLanguage?: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  refresh: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
};

// Problems API
export const problemsApi = {
  getAll: (params?: Record<string, string>) => apiClient.get('/problems', { params }),
  getById: (id: string) => apiClient.get(`/problems/${id}`),
  create: (data: unknown) => apiClient.post('/problems', data),
  update: (id: string, data: unknown) => apiClient.put(`/problems/${id}`, data),
  delete: (id: string) => apiClient.delete(`/problems/${id}`),
};

// Assessment API
export const assessmentApi = {
  start: (problemId?: string) => apiClient.post('/assessments/start', { problemId }),
  getById: (id: string) => apiClient.get(`/assessments/${id}`),
  update: (id: string, data: unknown) => apiClient.patch(`/assessments/${id}`, data),
  runCode: (id: string, code: string, input: string) => apiClient.post(`/assessments/${id}/run`, { code, input }),
  submit: (id: string, data: { code: string; timeComplexity: string; spaceComplexity: string }) =>
    apiClient.post(`/assessments/${id}/submit`, data),
};

// Submissions API
export const submissionsApi = {
  getAll: (params?: Record<string, string>) => apiClient.get('/submissions', { params }),
  getById: (id: string) => apiClient.get(`/submissions/${id}`),
};

// Dashboard API
export const dashboardApi = {
  get: () => apiClient.get('/dashboard'),
};

// AI API
export const aiApi = {
  chat: (assessmentId: string, message: string) => apiClient.post('/ai/chat', { assessmentId, message }),
  explain: (assessmentId: string) => apiClient.post('/ai/explain', { assessmentId }),
  reviewApproach: (assessmentId: string, approach: string) => apiClient.post('/ai/review-approach', { assessmentId, approach }),
  hint: (assessmentId: string) => apiClient.post('/ai/hint', { assessmentId }),
  debug: (assessmentId: string, code: string, error?: string) => apiClient.post('/ai/debug', { assessmentId, code, error }),
  dryRun: (assessmentId: string, code: string) => apiClient.post('/ai/dry-run', { assessmentId, code }),
  optimize: (assessmentId: string, code: string) => apiClient.post('/ai/optimize', { assessmentId, code }),
  getHistory: (assessmentId: string) => apiClient.get(`/ai/history/${assessmentId}`),
};

// Admin API
export const adminApi = {
  getStats: () => apiClient.get('/admin/stats'),
  getUsers: (params?: Record<string, string>) => apiClient.get('/admin/users', { params }),
  getProblems: (params?: Record<string, string>) => apiClient.get('/admin/problems', { params }),
  getProblem: (id: string) => apiClient.get(`/admin/problems/${id}`),
  createProblem: (data: unknown) => apiClient.post('/admin/problems', data),
  updateProblem: (id: string, data: unknown) => apiClient.put(`/admin/problems/${id}`, data),
  deleteProblem: (id: string) => apiClient.delete(`/admin/problems/${id}`),
  getSubmissions: (params?: Record<string, string>) => apiClient.get('/admin/submissions', { params }),
};
