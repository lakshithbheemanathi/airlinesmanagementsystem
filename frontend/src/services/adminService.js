import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getAllBookings: async () => {
    const response = await api.get('/admin/dashboard/bookings');
    return response.data;
  },

  cancelBookingAsAdmin: async (id, reason = 'Administrative cancellation') => {
    const response = await api.put(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },
};

export default adminService;
