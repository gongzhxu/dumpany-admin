import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success(t('login.login_success'));
      navigate('/');
    } catch (err: any) {
      message.error(err.message || t('login.login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card
        style={{
          width: 400,
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        }}
      >
        <h2 style={{
          textAlign: 'center',
          marginBottom: 32,
          fontSize: 24,
          fontWeight: 600,
          color: '#1890ff',
        }}>
          {t('login.title')}
        </h2>
        <Form
          name="login"
          onFinish={onFinish}
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: t('login.username_placeholder') }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('login.username_placeholder')}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: t('login.password_placeholder') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('login.password_placeholder')}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {t('login.login_btn')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
