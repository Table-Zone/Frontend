import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getImageUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
}

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
  validateDiscountCode: (code: string) => api.get(`/workspaces/subscription/validate-discount?code=${encodeURIComponent(code)}`),
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

// QR Menu API
export const qrMenuAPI = {
  getTemplates: () => api.get(`/workspaces/qr-menu/templates`),
  getMenu: (workspaceId: string) => api.get(`/workspaces/qr-menu/${workspaceId}/menu`),
  createMenu: (workspaceId: string, data?: { templateId?: string }) =>
    api.post(`/workspaces/qr-menu/${workspaceId}/menu`, data),
  updateMenu: (workspaceId: string, data: any) =>
    api.patch(`/workspaces/qr-menu/${workspaceId}/menu`, data),
  deleteMenu: (workspaceId: string) =>
    api.delete(`/workspaces/qr-menu/${workspaceId}/menu`),
  createCategory: (workspaceId: string, data: any) =>
    api.post(`/workspaces/qr-menu/${workspaceId}/categories`, data),
  updateCategory: (workspaceId: string, categoryId: string, data: any) =>
    api.patch(`/workspaces/qr-menu/${workspaceId}/categories/${categoryId}`, data),
  deleteCategory: (workspaceId: string, categoryId: string) =>
    api.delete(`/workspaces/qr-menu/${workspaceId}/categories/${categoryId}`),
  createItem: (workspaceId: string, categoryId: string, data: any) =>
    api.post(`/workspaces/qr-menu/${workspaceId}/categories/${categoryId}/items`, data),
  updateItem: (workspaceId: string, itemId: string, data: any) =>
    api.patch(`/workspaces/qr-menu/${workspaceId}/items/${itemId}`, data),
  deleteItem: (workspaceId: string, itemId: string) =>
    api.delete(`/workspaces/qr-menu/${workspaceId}/items/${itemId}`),
  uploadLogo: (workspaceId: string, formData: FormData) =>
    api.post(`/workspaces/qr-menu/${workspaceId}/logo`, formData, {
      headers: { 'Content-Type': undefined } as any,
    }),
  uploadBanner: (workspaceId: string, formData: FormData) =>
    api.post(`/workspaces/qr-menu/${workspaceId}/banner`, formData, {
      headers: { 'Content-Type': undefined } as any,
    }),
  uploadBackground: (workspaceId: string, formData: FormData) =>
    api.post(`/workspaces/qr-menu/${workspaceId}/background`, formData, {
      headers: { 'Content-Type': undefined } as any,
    }),
  uploadItemImage: (itemId: string, formData: FormData) =>
    api.post(`/workspaces/qr-menu/items/${itemId}/image`, formData, {
      headers: { 'Content-Type': undefined } as any,
    }),
  uploadCategoryImage: (categoryId: string, formData: FormData) =>
    api.post(`/workspaces/qr-menu/categories/${categoryId}/image`, formData, {
      headers: { 'Content-Type': undefined } as any,
    }),
};

// Public Menu API (no auth)
export const publicMenuAPI = {
  getMenu: (workspaceSlug: string) => api.get(`/workspaces/public/menus/${workspaceSlug}`),
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
  getDiscountCodes: () => api.get('/admin/discount-codes'),
  createDiscountCode: (data: { code: string; percentOff: number; usageLimit?: number; expiresAt?: string }) =>
    api.post('/admin/discount-codes', data),
  deactivateDiscountCode: (id: string) => api.patch(`/admin/discount-codes/${id}/deactivate`, {}),

  // Marketers
  getMarketers: () => api.get('/admin/marketers'),
  getMarketerDetail: (id: string) => api.get(`/admin/marketers/${id}`),
  createMarketer: (data: { name: string; email: string; password: string; commissionPercent?: number }) =>
    api.post('/admin/marketers', data),
  setMarketerActive: (id: string, isActive: boolean) =>
    api.patch(`/admin/marketers/${id}/active`, { isActive }),
  issueMarketerCode: (
    id: string,
    data: { kind?: 'discount' | 'trial'; code?: string; percentOff?: number; usageLimit?: number }
  ) => api.post(`/admin/marketers/${id}/codes`, data),
  markMarketerCommissionsPaid: (id: string, commissionIds?: string[]) =>
    api.post(`/admin/marketers/${id}/commissions/pay`, { commissionIds }),

  // Trial codes
  getTrialCodes: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get('/admin/trial-codes', { params }),
  generateTrialCodes: (count: number, notes?: string) =>
    api.post('/admin/trial-codes/generate', { count, notes }),
  updateTrialCodeNote: (id: string, notes: string) =>
    api.patch(`/admin/trial-codes/${id}/notes`, { notes }),
  deleteTrialCode: (id: string) => api.delete(`/admin/trial-codes/${id}`),

  // Subscriptions
  getSubscriptions: (params?: { page?: number; limit?: number; search?: string; filter?: string; sortBy?: string }) =>
    api.get('/admin/subscriptions', { params }),
  getSubscriptionStats: () => api.get('/admin/subscriptions/stats'),

  // Users
  getUsers: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get('/admin/users', { params }),
  getUserDetail: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
  suspendUser: (id: string) => api.patch(`/admin/users/${id}/suspend`),
  activateUser: (id: string) => api.patch(`/admin/users/${id}/activate`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  // Services
  getServices: () => api.get('/admin/services'),
  getService: (id: string) => api.get(`/admin/services/${id}`),
  createService: (data: any) => api.post('/admin/services', data),
  updateService: (id: string, data: any) => api.patch(`/admin/services/${id}`, data),
  deleteService: (id: string) => api.delete(`/admin/services/${id}`),
  reorderServices: (order: Array<{ id: string; sortOrder: number }>) =>
    api.patch('/admin/services/reorder', { order }),
  uploadServiceImage: (id: string, formData: FormData) =>
    api.post(`/admin/services/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadServiceIcon: (id: string, formData: FormData) =>
    api.post(`/admin/services/${id}/icon`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Finance
  getFinanceDashboard: () => api.get('/admin/finance/dashboard'),
  getFinanceTransactions: (params?: { page?: number; limit?: number; type?: string }) =>
    api.get('/admin/finance/transactions', { params }),
  getExpenses: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/finance/expenses', { params }),
  createExpense: (data: any) => api.post('/admin/finance/expenses', data),
  deleteExpense: (id: string) => api.delete(`/admin/finance/expenses/${id}`),
  getFinanceReports: (period?: string) =>
    api.get('/admin/finance/reports', { params: { period } }),
};

export default api;
