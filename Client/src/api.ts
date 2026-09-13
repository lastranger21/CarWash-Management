import axios from 'axios'
import type { AxiosInstance } from "axios";

export const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 5000,
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


