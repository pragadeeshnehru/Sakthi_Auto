import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set your backend IP address and port here
// Example: 'http://192.168.1.10:6000'
export const API_BASE_URL = 'http://192.168.253.142:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
