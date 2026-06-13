import request from './request';

export interface Order {
  id: string;
  orderNo: string;
  subscriber: string;
  product: string;
  amount: number;
  currency: string;
  status: string;
  licenseKey: string;
  paidAt: string;
  createdAt: string;
}

const orderApi = {
  list: (params: { page: number; pageSize: number; keyword?: string; status?: string }) =>
    request.get('/order/list', { params }),

  get: (id: string) => request.get('/order/get', { params: { id } }),

  refund: (id: string) => request.put('/order/refund', { id }),
};

export default orderApi;
