import axios from 'axios';
import { getToken, removeToken } from '../utils/token';
import { config } from '../config/env';

const axiosInstance = axios.create({
  baseURL: config.SERVER_ADDRESS,
});

// Request interceptor to add token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.data === 'token has expired') {
      console.log('Authentication error - logging out user');
      removeToken();
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);


export default axiosInstance; 