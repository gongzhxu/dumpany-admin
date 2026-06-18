import React, { useEffect, useState, useCallback } from 'react';
import { Button, Modal, Form, Input, message, Typography, Card, Descriptions, Tag, Divider } from 'antd';
import { EditOutlined, CheckCircleOutlined, CloseCircleOutlined, KeyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;
const { TextArea } = Input;

const WeChatConfig: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/settings/payment/wechat');
      setData(res.data || null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!loading && !data && !modalOpen && !dismissed) {
      setEditing(false);
      form.resetFields();
      setModalOpen(true);
    }
  }, [loading, data, modalOpen, dismissed]);

  useEffect(() => {
    if (modalOpen) {
      const vals: Record<string, string> = {};
      if (data) {
        vals.appId = data.appId || '';
        vals.mchId = data.mchId || '';
        vals.apiV3Key = data.apiV3Key || '';
        vals.serialNo = data.serialNo || '';
        vals.privateKey = data.privateKey || '';
        vals.notifyUrl = data.notifyUrl || 'https://api.dumpany.cn/api/v1/backend/payment/wechat/webhook';
        vals.returnUrl = data.returnUrl || 'https://dumpany.cn/account?tab=orders';
        vals.currency = data.currency || 'CNY';
        setEditing(true);
      } else {
        vals.notifyUrl = 'https://api.dumpany.cn/api/v1/backend/payment/wechat/webhook';
        vals.returnUrl = 'https://dumpany.cn/account?tab=orders';
        vals.currency = 'CNY';
        setEditing(false);
      }
      form.setFieldsValue(vals);
    }
  }, [modalOpen, data]);

  const hasConfig = !!data;

  const handleSubmit = async (vals: any) => {
    setSubmitting(true);
    try {
      await request.put('/settings/payment/wechat', vals);
      message.success(t('payment.save_success'));
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message || t('payment.save_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const configItems = data ? [
    { label: t('wechatConfig.appId'), content: <Tag color="blue">{data.appId}</Tag> },
    { label: t('wechatConfig.mchId'), content: <Tag color="blue">{data.mchId || '-'}</Tag> },
    { label: t('wechatConfig.apiV3Key'), content: data.apiV3Key ? (
      <Tag icon={<CheckCircleOutlined />} color="success" style={{ margin: 0 }}>{t('wechatConfig.configured')}</Tag>
    ) : (
      <Tag icon={<CloseCircleOutlined />} color="error" style={{ margin: 0 }}>{t('wechatConfig.notConfigured')}</Tag>
    )},
    { label: t('wechatConfig.serialNo'), content: <Tag color="blue">{data.serialNo || '-'}</Tag> },
    { label: t('payment.privateKey'), content: data.privateKey ? (
      <Tag icon={<CheckCircleOutlined />} color="success" style={{ margin: 0 }}>{t('wechatConfig.configured')}</Tag>
    ) : (
      <Tag icon={<CloseCircleOutlined />} color="error" style={{ margin: 0 }}>{t('wechatConfig.notConfigured')}</Tag>
    )},
    { label: t('payment.currency'), content: data.currency || 'CNY' },
    { label: t('payment.notifyUrl'), content: data.notifyUrl || '-' },
    { label: t('payment.returnUrl'), content: data.returnUrl || '-' },
  ] : [];

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          <img src="/wechat-icon.svg" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: -3 }} alt="" />
          {t('payment.wechat_title')}
        </Title>
        {hasConfig && (
          <Button type="primary" icon={<EditOutlined />} onClick={() => setModalOpen(true)}>
            {t('app.edit')}
          </Button>
        )}
      </div>

      <Card loading={loading} style={{ marginTop: 16 }}>
        {hasConfig ? (
          <Descriptions column={1} bordered size="small" labelStyle={{ width: 140, fontWeight: 600 }}>
            {configItems.map((item, i) => (
              <Descriptions.Item key={i} label={item.label}>
                {item.content}
              </Descriptions.Item>
            ))}
          </Descriptions>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: '#999', marginBottom: 16 }}>{t('payment.not_configured_wechat')}</p>
            <Button type="primary" size="large" onClick={() => { setEditing(false); form.resetFields(); setModalOpen(true); }}>
              {t('payment.configure')}
            </Button>
          </div>
        )}
      </Card>

      <Modal
        title={t('payment.wechat_title')}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setDismissed(true); }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="appId" label={t('wechatConfig.appId')}
            extra={t('wechatConfig.appId_extra')}
            rules={[{ required: true, message: t('wechatConfig.appId_required') }]}>
            <Input placeholder={t('wechatConfig.appId_placeholder')} />
          </Form.Item>

          <Form.Item name="mchId" label={t('wechatConfig.mchId')}
            extra={t('wechatConfig.mchId_extra')}
            rules={[{ required: true, message: t('wechatConfig.mchId_required') }]}>
            <Input placeholder={t('wechatConfig.mchId_placeholder')} />
          </Form.Item>

          <Form.Item name="apiV3Key" label={t('wechatConfig.apiV3Key')}
            extra={t('wechatConfig.apiV3Key_extra')}
            rules={[{ required: true, message: t('wechatConfig.apiV3Key_required') }]}>
            <Input.Password
              prefix={<KeyOutlined />}
              placeholder={t('wechatConfig.apiV3Key_placeholder')} />
          </Form.Item>

          <Form.Item name="serialNo" label={t('wechatConfig.serialNo')}
            extra={t('wechatConfig.serialNo_extra')}
            rules={[{ required: true, message: t('wechatConfig.serialNo_required') }]}>
            <Input placeholder={t('wechatConfig.serialNo_placeholder')} />
          </Form.Item>

          <Divider plain>{t('wechatConfig.certTitle')}</Divider>

          <Form.Item name="privateKey" label={t('payment.privateKey')}
            extra={t('wechatConfig.privateKey_extra')}
            rules={editing ? [] : [{ required: true, message: t('payment.privateKey_required') }]}>
            <TextArea rows={6}
              placeholder={editing ? t('payment.privateKey_edit_placeholder') : t('wechatConfig.privateKey_placeholder')} />
          </Form.Item>

          <Divider plain>{t('wechatConfig.callbackTitle')}</Divider>

          <Form.Item name="notifyUrl" label={t('payment.notifyUrl')}>
            <Input placeholder={t('payment.notifyUrl_placeholder')} />
          </Form.Item>

          <Form.Item name="returnUrl" label={t('payment.returnUrl')}>
            <Input placeholder={t('payment.returnUrl_placeholder')} />
          </Form.Item>

          <Form.Item name="currency" label={t('wechatConfig.currency')} initialValue="CNY">
            <Input placeholder="CNY" disabled />
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

export default WeChatConfig;
