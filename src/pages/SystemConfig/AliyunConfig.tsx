import React, { useEffect, useState } from 'react';
import { Descriptions, Button, Modal, Form, Input, Switch, message, Typography, Card, Tag } from 'antd';
import { EditOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

const CONFIG_KEY = 'aliyun';

const defaultData = {
  credentials: { accessKeyId: '', accessKeySecret: '' },
  sms: { enabled: false, signName: 'DumpAny', templateCode: '' },
};

type SectionKey = 'credentials' | 'sms';

function isConfiguredSection(cfg: any, section: SectionKey) {
  if (!cfg) return false;
  const s = cfg[section];
  if (!s) return false;
  if (section === 'sms') return !!s.signName;
  return !!(s.accessKeyId || s.accessKeySecret);
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

const AliyunConfig: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [modalSection, setModalSection] = useState<SectionKey>('credentials');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/system-config/list');
      const cfg = (res.data || []).find((c: any) => c.configKey === CONFIG_KEY);
      if (cfg) {
        setData(JSON.parse(cfg.configValue || '{}'));
      } else {
        setData(null);
      }
    } catch { setData(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (loading || modalOpen || dismissed) return;
    if (!data) openModal('credentials');
  }, [loading, data, modalOpen, dismissed]);

  const openModal = (section: SectionKey) => {
    setModalSection(section);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!modalOpen) return;
    const s = data?.[modalSection] || defaultData[modalSection];
    const vals: any = {};
    if (modalSection === 'credentials') {
      vals.accessKeyId = s.accessKeyId || '';
      vals.accessKeySecret = s.accessKeySecret || '';
    } else if (modalSection === 'sms') {
      vals.enabled = s.enabled || false;
      vals.signName = s.signName || 'DumpAny';
      vals.templateCode = s.templateCode || '';
    }
    form.setFieldsValue(vals);
  }, [modalOpen, modalSection, data, form]);

  const handleSubmit = async (vals: any) => {
    setSubmitting(true);
    try {
      const merged = { ...defaultData, ...(data || {}) };
      merged[modalSection] = { ...merged[modalSection], ...vals };

      await request.put('/system-config/update', {
        configKey: CONFIG_KEY,
        configValue: JSON.stringify(merged),
      });
      message.success(t('common.saved'));
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    } finally { setSubmitting(false); }
  };

  const renderCard = (title: string, section: SectionKey, fields: { label: string; value: any }[], onEdit: () => void) => (
    <div style={{ marginBottom: 20, padding: 20, borderRadius: 12, border: '1px solid var(--border-color)', maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', marginRight: 8, backgroundColor: isConfiguredSection(data, section) ? '#52c41a' : '#ff4d4f' }} />
          {title}
        </Title>
        <Button size="small" icon={<EditOutlined />} onClick={onEdit}>{t('app.edit')}</Button>
      </div>
      <Descriptions column={1} size="small">
        {fields.map(f => (
          <Descriptions.Item key={f.label} label={f.label}>
            {f.value ?? '-'}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </div>
  );

  if (loading) return <Card loading><Title level={4}>{t('aliyunConfig.title')}</Title></Card>;

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('aliyunConfig.title')}</Title>
      </div>

      {renderCard(t('aliyunConfig.credentials'), 'credentials', [
        { label: t('aliyunConfig.accessKeyId'), value: data?.credentials?.accessKeyId },
        { label: t('aliyunConfig.accessKeySecret'), value: <MaskedValue value={data?.credentials?.accessKeySecret} /> },
      ], () => openModal('credentials'))}

      {renderCard(t('aliyunConfig.sms'), 'sms', [
        { label: t('aliyunConfig.smsEnabled'), value: data?.sms?.enabled ? <Tag color="green">{t('common.enabled')}</Tag> : <Tag color="red">{t('common.disabled')}</Tag> },
        { label: t('aliyunConfig.signName'), value: data?.sms?.signName },
        { label: t('aliyunConfig.templateCode'), value: data?.sms?.templateCode },
      ], () => openModal('sms'))}

      <Modal title={t('aliyunConfig.credentials')} open={modalOpen && modalSection === 'credentials'}
        onCancel={() => { setModalOpen(false); setDismissed(true); }}
        footer={null} width={480} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="accessKeyId" label={t('aliyunConfig.accessKeyId')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="accessKeySecret" label={t('aliyunConfig.accessKeySecret')} rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={submitting} block>{t('common.save')}</Button></Form.Item>
        </Form>
      </Modal>

      <Modal title={t('aliyunConfig.sms')} open={modalOpen && modalSection === 'sms'}
        onCancel={() => { setModalOpen(false); setDismissed(true); }}
        footer={null} width={480} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="enabled" label={t('aliyunConfig.smsEnabled')} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="signName" label={t('aliyunConfig.signName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="templateCode" label={t('aliyunConfig.templateCode')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={submitting} block>{t('common.save')}</Button></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AliyunConfig;
