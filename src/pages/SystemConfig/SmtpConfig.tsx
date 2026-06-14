import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Typography, Card, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

const CONFIG_KEY = 'service_smtp';

function isConfigured(cfg: any) {
  return cfg?.host && cfg?.user && cfg?.pass;
}

const SmtpConfig: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [init, setInit] = useState<Record<string, any>>({});
  const [curr, setCurr] = useState<Record<string, any>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/system-config/list');
      const cfg = (res.data || []).find((c: any) => c.configKey === CONFIG_KEY);
      if (cfg) {
        const parsed = JSON.parse(cfg.configValue || '{}');
        setData([parsed]);
      } else {
        setData([]);
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (modalOpen) {
      let vals: any = {};
      if (editing) {
        vals = {
          host: editing.host || 'smtp.163.com',
          port: editing.port || 465,
          user: editing.user || '',
          pass: editing.pass || '',
        };
      } else {
        vals = { host: 'smtp.163.com', port: 465 };
      }
      setInit(vals);
      setCurr(vals);
      form.setFieldsValue(vals);
    }
  }, [modalOpen, editing, form]);

  const openEdit = (record?: any) => {
    setEditing(record || null);
    setModalOpen(true);
  };

  const handleSubmit = async (vals: any) => {
    setSubmitting(true);
    try {
      await request.put('/system-config/update', {
        configKey: CONFIG_KEY,
        configValue: JSON.stringify(vals),
      });
      message.success(t('common.saved'));
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldColor = (key: string) => {
    if (init[key] !== curr[key]) return undefined;
    return '#bbb';
  };

  const columns = [
    { title: t('smtp.host'), dataIndex: 'host', key: 'host' },
    { title: t('smtp.port'), dataIndex: 'port', key: 'port', width: 80 },
    { title: t('smtp.user'), dataIndex: 'user', key: 'user' },
    {
      title: t('app.status'), key: 'status', width: 120,
      render: (_: any, record: any) =>
        isConfigured(record)
          ? <Typography.Text type="success">{t('common.configured')}</Typography.Text>
          : <Typography.Text type="danger">{t('common.notConfigured')}</Typography.Text>,
    },
    {
      title: t('app.action'), key: 'action', width: 80,
      render: (_: any, record: any) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>{t('app.edit')}</Button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('smtp.title')}</Title>
      </div>
      <Card>
        <Table dataSource={data} columns={columns} rowKey="host" loading={loading} pagination={false} size="small" />
      </Card>
      <Modal title={t('smtp.editTitle')} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={520} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}
          onValuesChange={() => setCurr({ ...form.getFieldsValue() })}>
          <Form.Item name="host" label={t('smtp.host')} rules={[{ required: true }]}>
            <Input style={{ color: fieldColor('host') }} />
          </Form.Item>
          <Form.Item name="port" label={t('smtp.port')} rules={[{ required: true }]}>
            <InputNumber min={1} max={65535} style={{ width: '100%', color: fieldColor('port') }} />
          </Form.Item>
          <Form.Item name="user" label={t('smtp.user')} rules={[{ required: true }]}>
            <Input style={{ color: fieldColor('user') }} />
          </Form.Item>
          <Form.Item name="pass" label={t('smtp.pass')} rules={[{ required: true }]}>
            <Input.Password style={{ color: fieldColor('pass') }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              {t('common.save')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SmtpConfig;
