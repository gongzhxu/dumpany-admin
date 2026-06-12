import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';

import AdminLayout from './components/Layout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import LicensesPage from './pages/Licenses';
import OrdersPage from './pages/Orders';
import AdminsPage from './pages/Admins';
import SettingsPage from './pages/Settings';
import AlipayPage from './pages/Payment/Alipay';
import PlansPage from './pages/Plans';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <ConfigProvider locale={i18n.language === 'zh' ? zhCN : enUS}>
      <AntApp>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="licenses" element={<LicensesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="admins" element={<AdminsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="payment/alipay" element={<AlipayPage />} />
            <Route path="plans" element={<PlansPage />} />
          </Route>
        </Routes>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
