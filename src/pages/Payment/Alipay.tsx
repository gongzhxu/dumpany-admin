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

  // 没记录时自动弹出 Modal（用户主动关闭后不再弹出）
  useEffect(() => {
    if (!loading && data.length === 0 && !modalOpen && !dismissed) {
      setEditing(null);
      form.resetFields();
      setModalOpen(true);
    }
  }, [loading, data.length, modalOpen, dismissed]);

  // Modal 打开时填充表单
  useEffect(() => {
    if (modalOpen) {
      if (editing) {
        form.setFieldsValue({
          app_id: editing.app_id || '',
          private_key: '',
          gateway_url: editing.gateway_url || 'https://openapi.alipay.com/gateway.do',
          public_key: editing.public_key || '',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ gateway_url: 'https://openapi.alipay.com/gateway.do' });
      }
    }
  }, [modalOpen, editing]);

  const openEdit = (record?: any) => {
    setEditing(record || null);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await request.put('/settings/payment/alipay', values);
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
    { title: t('payment.app_id'), dataIndex: 'app_id', key: 'app_id', render: (text: string) => <Tag color="blue">{text}</Tag> },
    { title: t('payment.gateway_url'), dataIndex: 'gateway_url', key: 'gateway_url', ellipsis: true },
    {
      title: t('payment.public_key'),
      dataIndex: 'public_key',
      key: 'public_key',
      ellipsis: true,
      render: (text: string) => text ? `${text.substring(0, 40)}...` : '-',
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
          rowKey="app_id"
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
