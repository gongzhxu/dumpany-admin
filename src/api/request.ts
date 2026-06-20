import axios from 'axios';

const request = axios.create({
  baseURL: '/api/v1/admin',
  timeout: 15000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // 解码 JWT payload 检查 exp，过期则主动退出
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        window.location.href = '#/login';
        return Promise.reject(new Error('Token expired'));
      }
    } catch (_) {}
    config.headers.Authorization = `Bearer ${token}`;
  }
  const selectedAppId = localStorage.getItem('selectedAppId') || '';
  config.headers['X-APP-ID'] = selectedAppId;
  const lang = localStorage.getItem('lang') || 'zh';
  config.headers['X-LANGUAGE'] = lang;
  return config;
});

request.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data.code !== 0) {
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
