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
          app_id: editing.app_id || '',
          private_key: editing.private_key || '',
          gateway_url: editing.gateway_url || 'https://openapi.alipay.com/gateway.do',
          public_key: editing.public_key || '',
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
    { title: t('payment.app_id'), dataIndex: 'app_id', key: 'app_id', render: (text: string) => <Tag color="blue">{text}</Tag> },
    {
      title: t('payment.private_key'),
      dataIndex: 'private_key',
      key: 'private_key',
      width: 160,
      render: (text: string) => text ? <Typography.Text copyable style={{ width: 140, display: 'inline-block' }} ellipsis>{text.substring(0, 60)}</Typography.Text> : '-',
    },
    { title: t('payment.gateway_url'), dataIndex: 'gateway_url', key: 'gateway_url', ellipsis: true },
    {
      title: t('payment.public_key'),
      dataIndex: 'public_key',
      key: 'public_key',
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
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}
          onValuesChange={(changed) => {
            const next = { ...form.getFieldsValue() };
            console.log('init:', init, 'curr:', next);
            setCurr(next);
          }}>
          <Form.Item name="app_id" label={t('payment.app_id')}
            rules={[{ required: true, message: t('payment.app_id_required') }]}>
            <Input placeholder={t('payment.app_id_placeholder')}
              style={{ color: init.app_id !== curr.app_id ? undefined : '#bbb' }} />
          </Form.Item>

          <Form.Item name="private_key" label={t('payment.private_key')}
            rules={editing ? [] : [{ required: true, message: t('payment.private_key_required') }]}>
            <TextArea rows={6} placeholder={editing ? t('payment.private_key_edit_placeholder') : t('payment.private_key_placeholder')}
              style={{ color: init.private_key !== curr.private_key ? undefined : '#bbb' }} />
          </Form.Item>

          <Form.Item name="gateway_url" label={t('payment.gateway_url')}>
            <Input placeholder={t('payment.gateway_url_placeholder')}
              style={{ color: init.gateway_url !== curr.gateway_url ? undefined : '#bbb' }} />
          </Form.Item>

          <Form.Item name="public_key" label={t('payment.public_key')}>
            <TextArea rows={4} placeholder={t('payment.public_key_placeholder')}
              style={{ color: init.public_key !== curr.public_key ? undefined : '#bbb' }} />
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
