import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Button, Space, Select } from 'antd';
import {
  DashboardOutlined,
  KeyOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import request from '../../api/request';

const { Header, Sider, Content } = Layout;

interface AppOption {
  appId: string;
  name: string;
}

const AdminLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [apps, setApps] = useState<AppOption[]>([]);
  const [selectedApp, setSelectedApp] = useState<string>(() => localStorage.getItem('selectedAppId') || '');

  // 根据当前路径自动展开子菜单
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const path = location.pathname;
    if (path.startsWith('/payment')) return ['payment'];
    return [];
  });

  // 加载应用列表
  useEffect(() => {
    request.get('/app/list').then((res) => {
      setApps(res.data || []);
    }).catch(() => {});
  }, []);

  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const handleAppChange = (value: string) => {
    setSelectedApp(value);
    localStorage.setItem('selectedAppId', value);
    window.location.reload();
  };

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: t('app.dashboard') },
    { key: '/license', icon: <KeyOutlined />, label: t('app.license') },
    { key: '/order', icon: <ShoppingCartOutlined />, label: t('app.order') },
    { key: '/plan', icon: <DollarOutlined />, label: t('app.plan') },
    { key: '/admin', icon: <UserOutlined />, label: t('app.admin') },
    { key: '/app', icon: <AppstoreOutlined />, label: t('app.app') },
    {
      key: 'payment',
      icon: <DollarOutlined />,
      label: t('app.payment'),
      children: [
        { key: '/payment/alipay', icon: <img src="/alipay-icon.svg" style={{ width: 14, height: 14 }} alt="" />, label: t('app.alipay') },
      ],
    },
    { key: '/swagger', icon: <img src="/swagger-icon.svg" style={{ width: 14, height: 14 }} alt="" />, label: t('app.swagger') },
    {
      key: 'system-config',
      icon: <SettingOutlined />,
      label: t('app.system_config'),
      children: [
        { key: '/system-config', label: t('app.system_config_general') },
        { key: '/system-config/smtp', label: t('app.system_config_smtp') },
        { key: '/system-config/tencent', label: t('app.system_config_tencent') },
      ],
    },
  ];

  const toggleLang = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  const userMenuItems = [
    {
      key: 'admin-info',
      label: admin?.nickname || admin?.username,
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('app.logout'),
      danger: true,
    },
  ];

  return (
    <Layout className="admin-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{ borderRight: '1px solid #f0f0f0' }}
      >
        <div style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          fontWeight: 700,
          fontSize: collapsed ? 14 : 16,
          color: '#1890ff',
        }}>
          {collapsed ? 'DA' : 'DumpAny Admin'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname === '/' ? '/' : location.pathname]}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={onOpenChange}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="admin-layout-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>
          <div className="header-right">
            <Select
              value={selectedApp}
              onChange={handleAppChange}
              style={{ width: 160, marginRight: 12 }}
              placeholder={t('app.select_app')}
              options={[
                { value: '', label: t('app.all_apps') },
                ...apps.map((app) => ({ value: app.appId, label: `${app.name} (${app.appId})` })),
              ]}
            />
            <Button type="text" onClick={toggleLang}>
              {i18n.language === 'zh' ? 'EN' : '中文'}
            </Button>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: ({ key }) => {
                  if (key === 'logout') {
                    logout();
                    navigate('/login');
                  }
                },
              }}
            >
              <Space style={{ cursor: 'pointer' }}>
                <UserOutlined />
                {admin?.nickname || admin?.username}
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content className="admin-layout-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
