import React from 'react';
import { Layout, Menu, Dropdown, Button, Space } from 'antd';
import {
  DashboardOutlined,
  KeyOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  // 根据当前路径自动展开子菜单
  const [openKeys, setOpenKeys] = React.useState<string[]>(() => {
    const path = location.pathname;
    if (path.startsWith('/payment')) return ['payment'];
    return [];
  });

  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: t('app.dashboard') },
    { key: '/licenses', icon: <KeyOutlined />, label: t('app.licenses') },
    { key: '/orders', icon: <ShoppingCartOutlined />, label: t('app.orders') },
    { key: '/plans', icon: <DollarOutlined />, label: '套餐管理' },
    { key: '/admins', icon: <UserOutlined />, label: t('app.admins') },
    {
      key: 'payment',
      icon: <DollarOutlined />,
      label: t('app.payment'),
      children: [
        { key: '/payment/alipay', icon: <img src="/alipay-icon.svg" style={{ width: 14, height: 14 }} alt="" />, label: t('app.alipay') },
      ],
    },
    { key: '/settings', icon: <img src="/swagger-icon.svg" style={{ width: 14, height: 14 }} alt="" />, label: t('app.settings') },
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
