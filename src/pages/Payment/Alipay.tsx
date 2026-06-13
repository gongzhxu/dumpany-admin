import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Typography, Card, Tag, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;
const { TextArea } = Input;

const AlipayConfig: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [form] = Form.useForm();

  // 收集每个字段的初始值和当前值，每次输入变化时更新
  const [init, setInit] = useState<Record<string, string>>({});
  const [curr, setCurr] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/settings/payment/alipay');
      setData(res.data ? [res.data] : []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!loading && data.length === 0 && !modalOpen && !dismissed) {
      setEditing(null);
      form.resetFields();
      setModalOpen(true);
    }
  }, [loading, data.length, modalOpen, dismissed]);

  // Modal 打开时设置初始值和表单
  useEffect(() => {
    if (modalOpen) {
      let vals: Record<string, string> = {};
      if (editing) {
        vals = {
          app_id: editing.appId || '',
          private_key: editing.privateKey || '',
          gateway_url: editing.gatewayUrl || 'https://openapi.alipay.com/gateway.do',
          public_key: editing.publicKey || '',
        };
      } else {
        vals = { gateway_url: 'https://openapi.alipay.com/gateway.do' };
      }
      setInit(vals);
      setCurr(vals);
      form.setFieldsValue(vals);
    }
  }, [modalOpen, editing]);

  const openEdit = (record?: any) => {
    setEditing(record || null);
    setModalOpen(true);
  };

  const handleSubmit = async (vals: any) => {
    setSubmitting(true);
    try {
      await request.put('/settings/payment/alipay', vals);
      message.success(t('payment.save_success'));
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message || t('payment.save_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: t('payment.appId'), dataIndex: 'appId', key: 'appId', render: (text: string) => <Tag color="blue">{text}</Tag> },
    {
      title: t('payment.privateKey'),
      dataIndex: 'privateKey',
      key: 'privateKey',
      width: 160,
      render: (text: string) => text ? <Typography.Text copyable style={{ width: 140, display: 'inline-block' }} ellipsis>{text.substring(0, 60)}</Typography.Text> : '-',
    },
    { title: t('payment.gatewayUrl'), dataIndex: 'gatewayUrl', key: 'gatewayUrl', ellipsis: true },
    {
      title: t('payment.publicKey'),
      dataIndex: 'publicKey',
      key: 'publicKey',
      width: 160,
      render: (text: string) => text ? <Typography.Text copyable style={{ width: 140, display: 'inline-block' }} ellipsis>{text.substring(0, 60)}</Typography.Text> : '-',
    },
    {
      title: t('app.action'),
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            {t('app.edit')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>
          <img src="/alipay-icon.svg" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: -3 }} alt="" />
          {t('payment.alipay_title')}
        </Title>
      </div>

      <Card>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="appId"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>

      <Modal
        title={t('payment.alipay_title')}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setDismissed(true); }}
        footer={null}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}
          onValuesChange={() => {
            setCurr({ ...form.getFieldsValue() });
          }}>
          <Form.Item name="appId" label={t('payment.appId')}
            rules={[{ required: true, message: t('payment.appId_required') }]}>
            <Input placeholder={t('payment.appId_placeholder')}
              style={{ color: init.appId !== curr.appId ? undefined : '#bbb' }} />
          </Form.Item>

          <Form.Item name="privateKey" label={t('payment.privateKey')}
            rules={editing ? [] : [{ required: true, message: t('payment.privateKey_required') }]}>
            <TextArea rows={6} placeholder={editing ? t('payment.privateKey_edit_placeholder') : t('payment.privateKey_placeholder')}
              style={{ color: init.privateKey !== curr.privateKey ? undefined : '#bbb' }} />
          </Form.Item>

          <Form.Item name="gatewayUrl" label={t('payment.gatewayUrl')}>
            <Input placeholder={t('payment.gatewayUrl_placeholder')}
              style={{ color: init.gatewayUrl !== curr.gatewayUrl ? undefined : '#bbb' }} />
          </Form.Item>

          <Form.Item name="publicKey" label={t('payment.publicKey')}>
            <TextArea rows={4} placeholder={t('payment.publicKey_placeholder')}
              style={{ color: init.publicKey !== curr.publicKey ? undefined : '#bbb' }} />
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
