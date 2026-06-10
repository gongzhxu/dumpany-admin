import request from './request';

export interface DashboardStats {
  total_licenses: number;
  active_licenses: number;
  total_orders: number;
  total_revenue: number;
  today_activations: number;
}

export interface DailyStats {
  date: string;
  count: number;
}

export interface DailyRevenue {
  date: string;
  amount: number;
}

export interface TrendData {
  daily_activations: DailyStats[];
  daily_revenue: DailyRevenue[];
}

export const dashboardApi = {
  stats: () =>
    request.get('/dashboard/stats'),

  trends: (days = 30) =>
    request.get('/dashboard/trends', { params: { days } }),
};
