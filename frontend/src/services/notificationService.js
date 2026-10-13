import api from './api';

export const notificationService = {
  getUserNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  updateFlightSchedule: async (flightId, scheduleData) => {
    const response = await api.put(`/admin/flights/${flightId}/schedule`, scheduleData);
    return response.data;
  },

  broadcastNotification: async (broadcastData) => {
    const response = await api.post('/admin/notifications/broadcast', broadcastData);
    return response.data;
  },

  getAllNotifications: async () => {
    const response = await api.get('/admin/notifications');
    return response.data;
  },
};

export default notificationService;
