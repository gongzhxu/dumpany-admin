import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';

import AdminLayout from './components/Layout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import LicensePage from './pages/License';
import OrderPage from './pages/Order';
import AdminPage from './pages/Admin';
import SwaggerPage from './pages/Swagger';
import AlipayPage from './pages/Payment/Alipay';
import WeChatPage from './pages/Payment/WeChat';
import PlanPage from './pages/Plan';
import AppPage from './pages/App';
import SystemConfigPage from './pages/SystemConfig';
import SmtpConfigPage from './pages/SystemConfig/SmtpConfig';
import TencentConfigPage from './pages/SystemConfig/TencentConfig';
import AliyunConfigPage from './pages/SystemConfig/AliyunConfig';
import JwtConfigPage from './pages/SystemConfig/JwtConfig';
import FeedbackPage from './pages/Feedback';
import DownloadConfigPage from './pages/DownloadConfig';
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
            <Route path="app" element={<AppPage />} />
            <Route path="license" element={<LicensePage />} />
            <Route path="order" element={<OrderPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="swagger" element={<SwaggerPage />} />
            <Route path="payment/alipay" element={<AlipayPage />} />
            <Route path="payment/wechat" element={<WeChatPage />} />
            <Route path="plan" element={<PlanPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="download-config" element={<DownloadConfigPage />} />
            <Route path="system-config" element={<SystemConfigPage />} />
            <Route path="system-config/smtp" element={<SmtpConfigPage />} />
            <Route path="system-config/tencent" element={<TencentConfigPage />} />
            <Route path="system-config/aliyun" element={<AliyunConfigPage />} />
            <Route path="system-config/jwt" element={<JwtConfigPage />} />
          </Route>
        </Routes>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
