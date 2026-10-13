import api from './api';

export const flightService = {
  // Public Flight Search & Discovery
  searchFlights: async (params = {}) => {
    const response = await api.get('/flights/search', { params });
    return response.data;
  },

  getFlightDetails: async (id) => {
    const response = await api.get(`/flights/${id}`);
    return response.data;
  },

  getFlightSeats: async (id) => {
    const response = await api.get(`/flights/${id}/seats`);
    return response.data;
  },

  getAirports: async () => {
    const response = await api.get('/flights/airports');
    return response.data;
  },

  // Admin Flight Management
  getAdminFlights: async () => {
    const response = await api.get('/admin/flights');
    return response.data;
  },

  getAllFlights: async () => {
    const response = await api.get('/admin/flights');
    return response.data;
  },

  createFlight: async (flightData) => {
    const response = await api.post('/admin/flights', flightData);
    return response.data;
  },

  updateFlight: async (id, flightData) => {
    const response = await api.put(`/admin/flights/${id}`, flightData);
    return response.data;
  },

  deleteFlight: async (id, purge = false) => {
    const response = await api.delete(`/admin/flights/${id}`, {
      params: { purge },
    });
    return response.data;
  },

  getAircraftList: async () => {
    const response = await api.get('/admin/aircraft');
    return response.data;
  },
};

export default flightService;
