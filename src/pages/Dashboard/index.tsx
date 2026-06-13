import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, Typography } from 'antd';
import {
  KeyOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dashboardApi from '../../api/dashboard';
import type { DashboardStats } from '../../api/dashboard';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.stats()
      .then((statsRes: any) => {
        setStats(statsRes.data);
      })
      .catch((err) => {
        console.error('Failed to load dashboard', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Title level={4}>{t('dashboard.title')}</Title>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={t('dashboard.total_licenses')}
              value={stats?.totalLicenses || 0}
              prefix={<KeyOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={t('dashboard.active_licenses')}
              value={stats?.activeLicenses || 0}
              prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={t('dashboard.total_orders')}
              value={stats?.totalOrders || 0}
              prefix={<ShoppingCartOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title={t('dashboard.total_revenue')}
              value={stats?.totalRevenue || 0}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
