import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api` || 'http://localhost:3000/api',
  timeout: 10000,
}); 