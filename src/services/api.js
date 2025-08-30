import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const userAPI = {
  getUsers: (params) => api.get('/superadmin/users', { params }),
  getUser: (id) => api.get(`/superadmin/users/${id}`),
  createUser: (userData) => api.post('/superadmin/users', userData),
  updateUser: (id, userData) => api.put(`/superadmin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/superadmin/users/${id}`),
};

export const roleAPI = {
  getRoles: () => api.get('/superadmin/roles'),
  createRole: (roleData) => api.post('/superadmin/roles', roleData),
  updateRole: (id, roleData) => api.put(`/superadmin/roles/${id}`, roleData),
  assignRole: (data) => api.post('/superadmin/assign-role', data),
};

export const auditAPI = {
  getAuditLogs: (params) => api.get('/superadmin/audit-logs', { params }),
};

export const analyticsAPI = {
  getSummary: () => api.get('/superadmin/analytics/summary'),
};

export default api;