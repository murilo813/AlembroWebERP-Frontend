import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    // baseURL: 'http://186.209.29.170:5002',
    timeout: 10000,
    withCredentials: true,
});

export default api;