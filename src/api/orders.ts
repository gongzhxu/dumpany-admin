import request from './request';

export interface Order {
  id: number;
  order_no: string;
  subscriber: string;
  product: string;
  amount: number;
  currency: string;
  status: string;
  license_key: string;
  paid_at: string | null;
  created_at: string;
}

export const orderApi = {
  list: (params: { page?: number; pageSize?: number; keyword?: string; status?: string }) =>
    request.get('/orders', { params }),

  get: (id: number) =>
    request.get(`/orders/${id}`),

  refund: (id: number) =>
    request.put(`/orders/${id}/refund`),
};
