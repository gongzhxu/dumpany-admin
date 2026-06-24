import request from './request';

export interface License {
  id: number;
  licenseKey: string;
  subscriber: string;
  tier: string;
  maxDevices: number;
  usedDevices: number;
  issuedAt: number;
  expiresAt: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quota {
  id: number;
  userId: number;
  orderNo: string;
  tier: string;
  totalQuota: number;
  usedQuota: number;
  expiresAt: number;
  status: number;
  createdAt: number;
  licenses?: License[];
}

const licenseApi = {
  list: (params: { page: number; pageSize: number; keyword?: string; status?: string }) =>
    request.get('/license/list', { params }),

  get: (key: string) => request.get('/license/get', { params: { key } }),

  revoke: (key: string) => request.put('/license/revoke', { licenseKey: key }),

  // Quota API
  quotaList: (params: { page?: number; pageSize?: number }) =>
    request.get('/quota/list', { params }),

  quotaDetail: (id: number) =>
    request.get('/quota/detail', { params: { id } }),

  adjustQuota: (data: { quotaId: number; delta: number }) =>
    request.post('/quota/adjust', data),
};

export default licenseApi;
