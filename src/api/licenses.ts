import request from './request';

export interface License {
  id: number;
  license_key: string;
  type: string;
  subscriber: string;
  tier: string;
  max_devices: number;
  issued_at: number;
  expires_at: number;
  machine_id: string;
  status: string;
  signature: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLicenseParams {
  type: string;
  subscriber: string;
  tier: string;
  max_devices: number;
  duration_days: number;
}

export const licenseApi = {
  list: (params: { page?: number; pageSize?: number; keyword?: string; type?: string; status?: string }) =>
    request.get('/licenses', { params }),

  get: (id: number) =>
    request.get(`/licenses/${id}`),

  create: (data: CreateLicenseParams) =>
    request.post('/licenses', data),

  renew: (id: number, extra_days: number) =>
    request.put(`/licenses/${id}/renew`, { extra_days }),

  revoke: (id: number) =>
    request.put(`/licenses/${id}/revoke`),
};
