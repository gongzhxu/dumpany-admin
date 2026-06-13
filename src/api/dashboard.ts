export interface DashboardStats {
  totalLicenses: number;
  activeLicenses: number;
  totalOrders: number;
  totalRevenue: number;
  todayActivations: number;
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
  dailyActivations: DailyStats[];
  dailyRevenue: DailyRevenue[];
}
