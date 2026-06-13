import request from './request';

export interface License {
  id: string;
  licenseKey: string;
  type: string;
  subscriber: string;
  tier: string;
  maxDevices: number;
  issuedAt: number;
  expiresAt: number;
  machineId: string;
  status: string;
  signature: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLicenseParams {
  type: string;
  subscriber: string;
  tier: string;
  maxDevices: number;
  durationDays: number;
}

const licenseApi = {
  list: (params: { page: number; pageSize: number; keyword?: string; type?: string; status?: string }) =>
    request.get('/licenses', { params }),

  get: (key: string) => request.get(`/licenses/${key}`),

  create: (data: CreateLicenseParams) => request.post('/licenses', data),

  renew: (key: string, days: number) => request.put(`/licenses/${key}/renew?days=${days}`),

  revoke: (key: string) => request.put(`/licenses/${key}/revoke`),
};

export default licenseApi;
