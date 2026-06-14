import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Typography, Card, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

const CONFIG_KEY = 'service_sms_tencent';

function isConfigured(cfg: any) {
  return cfg?.secretId && cfg?.sdkAppId && cfg?.sign && cfg?.templateId;
}

const SmsConfig: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [init, setInit] = useState<Record<string, string>>({});
  const [curr, setCurr] = useState<Record<string, string>>({});

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
      let vals: Record<string, string> = {};
      if (editing) {
        vals = {
          secretId: editing.secretId || '',
          secretKey: editing.secretKey || '',
          sdkAppId: editing.sdkAppId || '',
          sign: editing.sign || 'DumpAny',
          templateId: editing.templateId || '',
        };
      } else {
        vals = { sign: 'DumpAny' };
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
    { title: t('sms.secretId'), dataIndex: 'secretId', key: 'secretId', ellipsis: true },
    { title: t('sms.sdkAppId'), dataIndex: 'sdkAppId', key: 'sdkAppId', width: 140 },
    { title: t('sms.sign'), dataIndex: 'sign', key: 'sign', width: 100 },
    { title: t('sms.templateId'), dataIndex: 'templateId', key: 'templateId', width: 120 },
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
        <Title level={4}>{t('sms.title')}</Title>
      </div>
      <Card>
        <Table dataSource={data} columns={columns} rowKey="secretId" loading={loading} pagination={false} size="small" />
      </Card>
      <Modal title={t('sms.editTitle')} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={520} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}
          onValuesChange={() => setCurr({ ...form.getFieldsValue() })}>
          <Form.Item name="secretId" label={t('sms.secretId')} rules={[{ required: true }]}>
            <Input style={{ color: fieldColor('secretId') }} />
          </Form.Item>
          <Form.Item name="secretKey" label={t('sms.secretKey')}>
            <Input.Password style={{ color: fieldColor('secretKey') }} />
          </Form.Item>
          <Form.Item name="sdkAppId" label={t('sms.sdkAppId')} rules={[{ required: true }]}>
            <Input style={{ color: fieldColor('sdkAppId') }} />
          </Form.Item>
          <Form.Item name="sign" label={t('sms.sign')} rules={[{ required: true }]}>
            <Input style={{ color: fieldColor('sign') }} />
          </Form.Item>
          <Form.Item name="templateId" label={t('sms.templateId')} rules={[{ required: true }]}>
            <Input style={{ color: fieldColor('templateId') }} />
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

export default SmsConfig;
