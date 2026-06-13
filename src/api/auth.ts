import request from './request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface AdminInfo {
  id: number;
  username: string;
  nickname: string;
  role: number;
  status: number;
  appId: string;
  createdAt: string;
  updatedAt: string;
}

export const authApi = {
  login: (data: LoginParams) =>
    request.post('/auth/login', data),

  me: () =>
    request.get('/auth/me'),

  logout: () =>
    request.post('/auth/logout'),

  changePassword: (data: { old_password: string; new_password: string }) =>
    request.put('/auth/password', data),
};
