import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fleetpulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const tripService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  getActiveTrips: async (driverId: number = 1) => {
    const res = await api.get(`/trips/driver/${driverId}/active`);
    return res.data;
  },
  getCompletedTrips: async () => {
    const res = await api.get('/trips/history');
    return res.data;
  },
  createTrip: async (tripData: any) => {
    const res = await api.post('/trips', tripData);
    return res.data;
  },
  updateTrip: async (id: number, tripData: any) => {
    const res = await api.put(`/trips/${id}`, tripData);
    return res.data;
  },
  deleteTrip: async (id: number) => {
    const res = await api.delete(`/trips/${id}`);
    return res.data;
  },
  startTrip: async (tripId: number) => {
    const res = await api.patch(`/trips/${tripId}/start`);
    return res.data;
  },
  completeTrip: async (tripId: number) => {
    const res = await api.patch(`/trips/${tripId}/complete`);
    return res.data;
  },
  getSummary: async (tripId: number) => {
    const res = await api.get(`/trips/${tripId}/summary`);
    return res.data;
  }
};

export default api;