import request from './request';

export interface License {
  licenseId: string;
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
    request.get('/license/list', { params }),

  get: (key: string) => request.get('/license/get', { params: { key } }),

  create: (data: CreateLicenseParams) => request.post('/license/create', data),

  renew: (key: string, days: number) => request.put('/license/renew', { licenseKey: key, days }),

  revoke: (key: string) => request.put('/license/revoke', { licenseKey: key }),
};

export default licenseApi;
