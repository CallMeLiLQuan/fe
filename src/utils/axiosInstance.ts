import axios from 'axios';

// Tạo một instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3004/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Thêm các request interceptor (nếu cần)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    console.log('Request config:', config);
    console.log('Token:', token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Thêm các response interceptor (nếu cần)
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
