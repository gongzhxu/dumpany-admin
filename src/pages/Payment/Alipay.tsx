import React, { useEffect, useState, useCallback } from 'react';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;
const { TextArea } = Input;

const AlipayConfig: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchConfig = useCallback(async () => {
    setFetching(true);
    try {
      const res: any = await request.get('/settings/payment/alipay');
      form.setFieldsValue({
        app_id: res.data.app_id,
        public_key: res.data.public_key,
      });
    } catch {
      // 首次配置，显示空表单
    } finally {
      setFetching(false);
    }
  }, [form]);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleSubmit = async (values: { app_id: string; private_key: string; public_key?: string }) => {
    setLoading(true);
    try {
      await request.put('/settings/payment/alipay', values);
      message.success(t('payment.save_success'));
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message || t('payment.save_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}><img src="/alipay-icon.svg" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: -3 }} alt="" />{t('payment.alipay_title')}</Title>
      </div>
      <Card loading={fetching} style={{ maxWidth: 600 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="app_id"
            label={t('payment.app_id')}
            rules={[{ required: true, message: t('payment.app_id_required') }]}
          >
            <Input placeholder={t('payment.app_id_placeholder')} />
          </Form.Item>

          <Form.Item
            name="private_key"
            label={t('payment.private_key')}
            rules={[{ required: true, message: t('payment.private_key_required') }]}
          >
            <TextArea rows={6} placeholder={t('payment.private_key_placeholder')} />
          </Form.Item>

          <Form.Item
            name="public_key"
            label={t('payment.public_key')}
          >
            <TextArea rows={4} placeholder={t('payment.public_key_placeholder')} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {t('payment.save')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AlipayConfig;
