import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3004/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        // Clear local storage
        localStorage.clear();
        // Redirect to login page or handle as needed
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 