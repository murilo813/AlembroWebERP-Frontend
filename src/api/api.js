import axios from 'axios';
import router from '@/router'; 

const api = axios.create({
    // baseURL: 'http://localhost:5000',
    baseURL: 'http://186.209.29.170:5002',
    timeout: 10000,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response, 
    (error) => {
        if (error.response && error.response.status === 401) {
            if (router.currentRoute.value.path === '/login') {
                return Promise.reject(error);
            }

            localStorage.clear();
            
            router.push('/login'); 
        }
        return Promise.reject(error);
    }
);

export default api;