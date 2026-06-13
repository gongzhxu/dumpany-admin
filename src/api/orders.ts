import request from './request';

export interface Order {
  orderId: string;
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

  get: (id: string) => request.get('/order/get', { params: { orderId: id } }),

  refund: (id: string) => request.put('/order/refund', { orderId: id }),
};

export default orderApi;
