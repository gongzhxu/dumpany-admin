import React, { useEffect, useState } from 'react';
import { Descriptions, Button, Modal, Form, Input, message, Typography, Card, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

const CONFIG_KEY = 'service_sms_tencent';

function isConfigured(cfg: any) {
  return cfg?.secretId && cfg?.sdkAppId && cfg?.sign && cfg?.templateId;
}

const defaultVals = { secretId: '', secretKey: '', sdkAppId: '', sign: 'DumpAny', templateId: '' };

const SmsConfig: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [form] = Form.useForm();
  const [init, setInit] = useState<Record<string, string>>({});
  const [curr, setCurr] = useState<Record<string, string>>({});

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

  useEffect(() => {
    if (!loading && !data && !modalOpen && !dismissed) {
      setModalOpen(true);
    }
  }, [loading, data, modalOpen, dismissed]);

  useEffect(() => {
    if (modalOpen) {
      const vals = data ? {
        secretId: data.secretId || '',
        secretKey: data.secretKey || '',
        sdkAppId: data.sdkAppId || '',
        sign: data.sign || 'DumpAny',
        templateId: data.templateId || '',
      } : { ...defaultVals };
      setInit(vals);
      setCurr(vals);
      form.setFieldsValue(vals);
    }
  }, [modalOpen, data, form]);

  const handleSubmit = async (vals: any) => {
    setSubmitting(true);
    try {
      if (data) {
        await request.put('/system-config/update', {
          configKey: CONFIG_KEY,
          configValue: JSON.stringify(vals),
        });
      } else {
        await request.post('/system-config/create', {
          configKey: CONFIG_KEY,
          configValue: JSON.stringify(vals),
          configType: 'json',
          description: '',
          cacheTTL: 0,
          status: 1,
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

  if (loading) return <Card loading><Title level={4}>{t('sms.title')}</Title></Card>;

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('sms.title')}</Title>
        {data && <Button icon={<EditOutlined />} onClick={() => setModalOpen(true)}>{t('app.edit')}</Button>}
      </div>
      <Card>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label={t('sms.secretId')}>{data?.secretId || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('sms.sdkAppId')}>{data?.sdkAppId || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('sms.sign')}>{data?.sign || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('sms.templateId')}>{data?.templateId || '-'}</Descriptions.Item>
          <Descriptions.Item label={t('app.status')}>
            {isConfigured(data)
              ? <Tag color="green">{t('common.configured')}</Tag>
              : <Tag color="red">{t('common.notConfigured')}</Tag>}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Modal title={t('sms.editTitle')} open={modalOpen} onCancel={() => { setModalOpen(false); setDismissed(true); }} footer={null} width={520} destroyOnClose>
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
            <Button type="primary" htmlType="submit" loading={submitting} block>{t('common.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SmsConfig;
