import axios from 'axios';

const request = axios.create({
  baseURL: '/api/v1/admin',
  timeout: 15000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const selectedAppId = localStorage.getItem('selectedAppId') || '';
  config.headers['X-APP-ID'] = selectedAppId;
  return config;
});

request.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data.code !== 0) {
      if (data.code === -1 && response.config.url !== '/auth/login') {
        localStorage.removeItem('token');
        window.location.href = '#/login';
      }
      return Promise.reject(new Error(data.msg || 'Request failed'));
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '#/login';
    }
    return Promise.reject(error);
  }
);

export default request;
