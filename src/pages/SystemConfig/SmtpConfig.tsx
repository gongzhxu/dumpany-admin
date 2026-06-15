import React, { useEffect, useState } from 'react';
import { Descriptions, Button, Modal, Form, Input, InputNumber, message, Typography, Card, Tag } from 'antd';
import { EditOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

const CONFIG_KEY = 'service_smtp';

function isConfigured(cfg: any) {
  return cfg?.host && cfg?.user && cfg?.pass;
}

const MaskedValue: React.FC<{ value: string }> = ({ value }) => {
  const [visible, setVisible] = useState(false);
  if (!value) return <>{'-'}</>;
  return (
    <span style={{ cursor: 'pointer' }} onClick={() => setVisible(!visible)}>
      {visible ? value : '••••••••••'}
      <span style={{ marginLeft: 6, color: '#999' }}>
        {visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
      </span>
    </span>
  );
};

const defaultVals = { host: 'smtp.163.com', port: 465, user: '', pass: '' };

const SmtpConfig: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [form] = Form.useForm();
  const [init, setInit] = useState<Record<string, any>>({});
  const [curr, setCurr] = useState<Record<string, any>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/system-config/list');
      const cfg = (res.data || []).find((c: any) => c.configKey === CONFIG_KEY);
      if (cfg) setData(JSON.parse(cfg.configValue || '{}'));
      else setData(null);
    } catch { setData(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  
  const handleToggleStatus = async () => {
    const newStatus = data?.status === 0 ? 1 : 0;
    try {
      await request.put('/system-config/update', {
        configKey: CONFIG_KEY,
        configValue: JSON.stringify(data),
        status: newStatus,
      });
      fetchData();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  useEffect(() => {
    if (!loading && !data && !modalOpen && !dismissed) {
      setModalOpen(true);
    }
  }, [loading, data, modalOpen, dismissed]);

  useEffect(() => {
    if (modalOpen) {
      const vals = data ? {
        host: data.host || 'smtp.163.com',
        port: data.port || 465,
        user: data.user || '',
        pass: data.pass || '',
      } : { ...defaultVals };
      setInit(vals);
      setCurr(vals);
      form.setFieldsValue(vals);
    }
  }, [modalOpen, data, form]);

  const handleSubmit = async (vals: any) => {
    setSubmitting(true);
    try {
      const body = {
        configKey: CONFIG_KEY,
        configValue: JSON.stringify(vals),
        status: data?.status === 0 ? 0 : 1,
      };
      if (data) {
        await request.put('/system-config/update', body);
      } else {
        await request.post('/system-config/create', {
          ...body,
          configType: 'json',
          description: '',
          cacheTTL: 0,
        });
      }
      message.success(t('common.saved'));
      setModalOpen(false);
      setDismissed(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    } finally { setSubmitting(false); }
  };

  const fieldColor = (key: string) => {
    if (init[key] !== curr[key]) return undefined;
    return '#bbb';
  };

  if (loading) return <Card loading><Title level={4}>{t('smtp.title')}</Title></Card>;

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('smtp.title')}</Title>
        {data && <Button icon={<EditOutlined />} onClick={() => setModalOpen(true)}>{t('app.edit')}</Button>}
      </div>
      <Card>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label={t('smtp.host')}>{data?.host || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('smtp.port')}>{data?.port ?? '-'}</Descriptions.Item>
          <Descriptions.Item label={t('smtp.user')}>{data?.user || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('smtp.pass')}><MaskedValue value={data?.pass || ''} /></Descriptions.Item>
          <Descriptions.Item label={t('app.status')}>
            <Tag color={data?.status !== 0 ? 'green' : 'red'} style={{ cursor: 'pointer' }}
              onClick={handleToggleStatus}>
              {data?.status === 0 ? t('app.disabled') : (isConfigured(data) ? t('common.configured') : t('common.notConfigured'))}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Modal title={t('smtp.editTitle')} open={modalOpen} onCancel={() => { setModalOpen(false); setDismissed(true); }} footer={null} width={520} destroyOnClose>
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
            <Button type="primary" htmlType="submit" loading={submitting} block>{t('common.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SmtpConfig;
