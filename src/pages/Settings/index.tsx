import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

const SwaggerAccount: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { user: string; pass?: string }) => {
    setLoading(true);
    try {
      const body: any = { user: values.user };
      if (values.pass) {
        body.pass = values.pass;
      }
      await request.put('/settings/swagger', body);
      message.success(t('settings.save_success'));
      form.resetFields(['pass']);
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message || t('settings.save_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>{t('settings.swagger_title')}</Title>
      <Card style={{ maxWidth: 500 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ user: '' }}
        >
          <Form.Item
            name="user"
            label={t('settings.username')}
            rules={[{ required: true, min: 2, message: t('settings.username_required') }]}
          >
            <Input placeholder={t('settings.username_placeholder')} />
          </Form.Item>

          <Form.Item
            name="pass"
            label={t('settings.password')}
            rules={[
              { min: 6, message: t('settings.password_rule') },
            ]}
          >
            <Input.Password placeholder={t('settings.password_placeholder')} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('settings.save')}
            </Button>
          </Form.Item>
        </Form>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {t('settings.hint')}
        </Typography.Text>
      </Card>
    </div>
  );
};

export default SwaggerAccount;
