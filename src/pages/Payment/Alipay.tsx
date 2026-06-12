import React, { useEffect, useState, useCallback } from 'react';
import { Card, Form, Input, Button, message, Typography, Modal, Descriptions, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;
const { TextArea } = Input;

const AlipayConfig: React.FC = () => {
  const { t } = useTranslation();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/settings/payment/alipay');
      setConfig(res.data);
    } catch {
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const openEdit = () => setModalOpen(true);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await request.put('/settings/payment/alipay', values);
      message.success(t('payment.save_success'));
      setModalOpen(false);
      fetchConfig();
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message || t('payment.save_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const configured = config?.app_id;

  // 没记录时自动弹出配置 Modal
  useEffect(() => {
    if (!loading && !config?.app_id && !modalOpen) {
      setModalOpen(true);
    }
  }, [loading, config?.app_id, modalOpen]);

  // Modal 打开时初始化表单值
  useEffect(() => {
    if (modalOpen) {
      form.setFieldsValue({
        app_id: config?.app_id || '',
        private_key: '',
        gateway_url: config?.gateway_url || 'https://openapi.alipay.com/gateway.do',
        public_key: config?.public_key || '',
      });
    }
  }, [modalOpen]);

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>
          <img src="/alipay-icon.svg" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: -3 }} alt="" />
          {t('payment.alipay_title')}
        </Title>
      </div>

      <Card loading={loading} style={{ maxWidth: 600 }}>
        {configured ? (
          <>
            <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label={t('payment.app_id')}>
                <Tag color="blue">{config.app_id}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('payment.gateway_url')}>
                {config.gateway_url || 'https://openapi.alipay.com/gateway.do'}
              </Descriptions.Item>
              <Descriptions.Item label={t('payment.public_key')}>
                {config.public_key ? `${config.public_key.substring(0, 40)}...` : '-'}
              </Descriptions.Item>
            </Descriptions>
            <Button type="primary" icon={<EditOutlined />} onClick={() => openEdit()}>
              {t('app.edit')}
            </Button>
          </>
        ) : null}
      </Card>

      <Modal
        title={t('payment.alipay_title')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="app_id" label={t('payment.app_id')}
            rules={[{ required: true, message: t('payment.app_id_required') }]}>
            <Input placeholder={t('payment.app_id_placeholder')} />
          </Form.Item>

          <Form.Item name="private_key" label={t('payment.private_key')}
            rules={[{ required: true, message: t('payment.private_key_required') }]}>
            <TextArea rows={6} placeholder={t('payment.private_key_placeholder')} />
          </Form.Item>

          <Form.Item name="gateway_url" label={t('payment.gateway_url')}>
            <Input placeholder={t('payment.gateway_url_placeholder')} />
          </Form.Item>

          <Form.Item name="public_key" label={t('payment.public_key')}>
            <TextArea rows={4} placeholder={t('payment.public_key_placeholder')} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              {t('payment.save')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AlipayConfig;
