import api from './api';

export const paymentService = {
  simulatePayment: async (paymentData) => {
    const response = await api.post('/payments/simulate', paymentData);
    return response.data;
  },

  getPaymentByPnr: async (pnr) => {
    const response = await api.get(`/payments/pnr/${pnr}`);
    return response.data;
  },

  getPaymentByBookingId: async (bookingId) => {
    const response = await api.get(`/payments/booking/${bookingId}`);
    return response.data;
  },
};

export default paymentService;
