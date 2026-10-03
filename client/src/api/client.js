import axios from "axios";

export const BACKEND_URL =
  import.meta.env.VITE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL_PROD || "http://localhost:3000/api/v1"
    : import.meta.env.VITE_BACKEND_URL_DEV || "http://localhost:3000/api/v1";

// Server root for static uploads (strip /api/v1)
export const SERVER_ROOT = BACKEND_URL.replace(/\/api(\/v1)?\/?$/, "");

export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor to attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Returns full URL for locally hosted uploaded images
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // Handle image objects (e.g. { imageUrl: "/uploads/...", imageType: "BEFORE" })
  if (typeof imagePath === "object" && imagePath.imageUrl) {
    return getImageUrl(imagePath.imageUrl);
  }
  if (typeof imagePath !== "string") return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `${SERVER_ROOT}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

// API Services
export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout")
};

export const complaintApi = {
  createComplaint: (formData) =>
    api.post("/complaints", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  getMyComplaints: (params) => api.get("/complaints/my", { params }),
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  getCitizenDashboard: () => api.get("/complaints/dashboard"),
  confirmResolution: (id) => api.post(`/complaints/${id}/confirm`),
  reopenComplaint: (id, data) => api.post(`/complaints/${id}/reopen`, data)
};

export const staffApi = {
  getDashboard: () => api.get("/staff/dashboard"),
  getTasks: (params) => api.get("/staff/tasks", { params }),
  startWork: (id, formData) =>
    api.patch(`/staff/tasks/${id}/start`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  resolveTask: (id, formData) =>
    api.patch(`/staff/tasks/${id}/resolve`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
  uploadProgress: (id, formData) =>
    api.post(`/staff/tasks/${id}/progress`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
};

export const adminApi = {
  getDashboard: () => api.get("/admin/dashboard"),
  getAllComplaints: (params) => api.get("/admin/complaints", { params }),
  updateComplaint: (id, data) => api.patch(`/admin/complaints/${id}`, data),
  assignStaff: (id, data) => api.post(`/admin/complaints/${id}/assign`, data),
  rejectComplaint: (id, data) => api.post(`/admin/complaints/${id}/reject`, data),
  getStaffList: () => api.get("/admin/staff"),
  createStaff: (data) => api.post("/admin/staff", data),
  toggleStaffStatus: (id) => api.patch(`/admin/staff/${id}/status`)
};

export const notificationApi = {
  getMyNotifications: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  getVapidPublicKey: () => api.get("/notifications/vapid-public-key"),
  pushSubscribe: (subscription, deviceName) =>
    api.post("/notifications/push/subscribe", { subscription, deviceName }),
  pushUnsubscribe: (endpoint) =>
    api.delete("/notifications/push/unsubscribe", { data: { endpoint } })
};

export const chatApi = {
  sendMessage: (message) => api.post("/chat", { message })
};

export const aiApi = {
  analyzeImage: (formData) =>
    api.post("/ai/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
};

export default api;
