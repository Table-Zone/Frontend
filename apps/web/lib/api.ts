import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const requestUrl = error.config?.url;

        // Don't auto-redirect on invite page — let it handle 401 gracefully
        if (currentPath.startsWith('/invite/')) {
          return Promise.reject(error);
        }

        // Don't redirect if getMe fails — let AuthContext handle it gracefully
        if (requestUrl === '/users/me') {
          return Promise.reject(error);
        }

        // Don't redirect on public pages (landing, etc.)
        if (currentPath === '/') {
          return Promise.reject(error);
        }

        localStorage.removeItem('access_token');
        document.cookie = 'access_token=; path=/; max-age=0';
        if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  login: (data: any) => api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  updateProfile: (data: any) => api.patch('/users/me', data),
  changePassword: (data: any) => api.patch('/users/me/password', data),
};

// User API
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: any) => api.patch('/users/me', data),
  updatePassword: (data: any) => api.patch('/users/me/password', data),
};

// Workspace API
export const workspaceAPI = {
  checkSlug: (slug: string) => api.get(`/workspaces/check-slug?slug=${slug}`),
  create: (data: any) => api.post('/workspaces', data),
  getMyWorkspace: (slug?: string) => api.get(`/workspaces/me${slug ? `?slug=${encodeURIComponent(slug)}` : ''}`),
  update: (id: string, data: any) => api.patch(`/workspaces/${id}`, data),
  updateWorkspace: (data: any) => api.patch('/workspaces/me', data),
  updateMe: (data: any) => api.patch('/workspaces/me', data),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
};

// Tables API
export const tableAPI = {
  getTables: (workspaceId: string) => api.get(`/workspaces/${workspaceId}/tables`),
  createTable: (workspaceId: string, data: { name: string; position?: number }) =>
    api.post(`/workspaces/${workspaceId}/tables`, data),
  updateTable: (workspaceId: string, tableId: string, data: any) =>
    api.patch(`/workspaces/${workspaceId}/tables/${tableId}`, data),
  updateStatus: (workspaceId: string, tableId: string, status: string) =>
    api.patch(`/workspaces/${workspaceId}/tables/${tableId}/status`, { status }),
  updateName: (workspaceId: string, tableId: string, name: string) =>
    api.patch(`/workspaces/${workspaceId}/tables/${tableId}`, { name }),
  updateNote: (workspaceId: string, tableId: string, note: string) =>
    api.patch(`/workspaces/${workspaceId}/tables/${tableId}`, { note }),
  updateTimerDuration: (workspaceId: string, tableId: string, timerDurationMinutes: number) =>
    api.patch(`/workspaces/${workspaceId}/tables/${tableId}`, { timerDurationMinutes }),
  deleteTable: (workspaceId: string, tableId: string) =>
    api.delete(`/workspaces/${workspaceId}/tables/${tableId}`),
  startTimer: (workspaceId: string, tableId: string) =>
    api.post(`/workspaces/${workspaceId}/tables/${tableId}/timer/start`),
  stopTimer: (workspaceId: string, tableId: string) =>
    api.post(`/workspaces/${workspaceId}/tables/${tableId}/timer/stop`),
  transferTimer: (workspaceId: string, fromTableId: string, toTableId: string) =>
    api.post(`/workspaces/${workspaceId}/tables/${fromTableId}/timer/transfer`, { targetTableId: toTableId }),
};

// Team API
export const teamAPI = {
  getMembers: (workspaceId: string) => api.get(`/workspaces/${workspaceId}/members`),
  invite: (workspaceId: string, email: string) =>
    api.post(`/workspaces/${workspaceId}/invitations`, { email }),
  inviteMember: (workspaceId: string, data?: { email?: string }) =>
    api.post(`/workspaces/${workspaceId}/invitations`, data || {}),
  cancelInvite: (workspaceId: string, invitationId: string) =>
    api.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`),
  resendInvite: (workspaceId: string, invitationId: string) =>
    api.post(`/workspaces/${workspaceId}/invitations/${invitationId}/resend`),
  removeMember: (workspaceId: string, userId: string) =>
    api.delete(`/workspaces/${workspaceId}/members/${userId}`),
  leaveWorkspace: (workspaceId: string) =>
    api.delete(`/workspaces/${workspaceId}/members/me`),
  getInvitation: (token: string) => api.get(`/workspaces/invitations/${token}`),
  acceptInvitation: (token: string) => api.post(`/workspaces/invitations/${token}/accept`),
};

// Subscription API
export const subscriptionAPI = {
  getPlans: () => api.get('/workspaces/plans'),
  getBankDetails: () => api.get('/workspaces/subscription/bank-details'),
  getSubscription: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/subscription`),
  requestSubscription: (workspaceId: string, formData: FormData) =>
    api.post(`/workspaces/${workspaceId}/subscription/request`, formData, {
      headers: { 'Content-Type': undefined } as any,
    }),
  uploadReceipt: (requestId: string, formData: FormData) =>
    api.post(`/workspaces/subscription-requests/${requestId}/upload-receipt`, formData, {
      headers: { 'Content-Type': undefined } as any,
    }),
  requestExtraSeats: (workspaceId: string, formData: FormData) =>
    api.post(`/workspaces/${workspaceId}/subscription/request-extra-seats`, formData, {
      headers: { 'Content-Type': undefined } as any,
    }),
  getRequests: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/subscription/requests`),
};

// Session API
export const sessionAPI = {
  join: (workspaceId: string) => api.post(`/workspaces/${workspaceId}/session/join`),
  heartbeat: (workspaceId: string) => api.post(`/workspaces/${workspaceId}/session/heartbeat`),
  leave: (workspaceId: string) => api.post(`/workspaces/${workspaceId}/session/leave`),
};

// Push Notification API
export const pushAPI = {
  getVapidPublicKey: () => api.get('/push/vapid-public-key'),
  subscribe: (data: { workspaceId: string; subscription: PushSubscriptionJSON }) =>
    api.post('/push/subscribe', data),
  unsubscribe: (data: { workspaceId: string }) => api.post('/push/unsubscribe', data),
};

// Table Session History API
export const tableSessionAPI = {
  getSessions: (workspaceId: string) => api.get(`/workspaces/${workspaceId}/table-sessions`),
};

// Admin API
export const adminAPI = {
  login: (data: any) => api.post('/admin/auth/login', data),
  verifyTotp: (data: any) => api.post('/admin/auth/verify-totp', data),
  getWorkspaces: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/admin/workspaces', { params }),
  getWorkspaceDetail: (id: string) => api.get(`/admin/workspaces/${id}`),
  getPendingRequests: (status?: string) =>
    api.get('/admin/subscription-requests', { params: { status } }),
  getRequestDetail: (id: string) => api.get(`/admin/subscription-requests/${id}`),
  approveRequest: (id: string, data?: any) =>
    api.patch(`/admin/subscription-requests/${id}/approve`, data),
  rejectRequest: (id: string, data?: any) =>
    api.patch(`/admin/subscription-requests/${id}/reject`, data),
  getAuditLog: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/audit-log', { params }),
};

export default api;
