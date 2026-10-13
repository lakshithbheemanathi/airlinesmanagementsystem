import api from './api';

export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getBookingByPnr: async (pnr) => {
    const response = await api.get(`/bookings/${pnr}`);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  cancelBooking: async (id, reason = 'Passenger requested cancellation') => {
    const response = await api.put(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  cancelBookingByPnr: async (pnr, reason = 'Passenger requested cancellation') => {
    const response = await api.put(`/bookings/cancel/${pnr}`, { reason });
    return response.data;
  },
};

export default bookingService;
