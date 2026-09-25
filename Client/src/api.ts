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
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const message = error.response.data?.message || '';
      
      const isAuthError =
        message.includes('kadaluwarsa') ||
        message.includes('token') ||
        error.response.status === 401;
      if (isAuthError) {
        // Hapus token dan data user dari localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('carwash_auth_user');
        
        alert('Sesi login Anda telah berakhir. Silakan login kembali.');
        
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);


