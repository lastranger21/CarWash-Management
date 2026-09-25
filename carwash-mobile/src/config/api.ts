import axios from "axios";


const API_URL = 'http://192.168.18.199:3000/api'

export const api = axios.create({
    baseURL: API_URL,
    headers:{
        'Content-Type': 'application/json',

    }
})
export const setupAxiosInterceptor = (onLogout: () => void) => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const url = error.config?.url;
      
      if ((status === 401 || status === 403) && !url?.includes('/auth/login')) {
        console.log('Session telah berakhir, mengalihkan ke login...');
        onLogout();
      }
      return Promise.reject(error);
    }
  );
};