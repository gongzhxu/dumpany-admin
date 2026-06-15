import React, { useEffect, useState } from 'react';
import { Descriptions, Button, Modal, Form, Input, Space, message, Typography, Card, Tag } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

const CONFIG_KEY = 'tencent';

const defaultData = {
  credentials: { secretId: '', secretKey: '' },
  sms: { sdkAppId: '', appKey: '', signName: 'DumpAny', templateId: '' },
  cos: { bucket: '', region: '', prefixes: [] as any[] },
};

type SectionKey = 'credentials' | 'sms' | 'cos';

const SECTION_FIELDS: Record<SectionKey, string[]> = {
  credentials: ['credentials.secretId'],
  sms: ['sms.sdkAppId', 'sms.appKey', 'sms.signName', 'sms.templateId'],
  cos: ['cos.bucket', 'cos.region'],
};

function isConfiguredSection(cfg: any, section: SectionKey) {
  if (!cfg) return false;
  const s = cfg[section];
  if (!s) return false;
  const fields = SECTION_FIELDS[section];
  return fields.some(k => {
    const parts = k.split('.');
    let v = cfg;
    for (const p of parts) v = v?.[p];
    return v && v !== '';
  });
}

const CARD_WIDTH: React.CSSProperties = { maxWidth: 640 };

const TencentConfig: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalSection, setModalSection] = useState<SectionKey>('credentials');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [form] = Form.useForm();

  // COS prefixes editing (held separately because it's a dynamic array outside the form)
  const [prefixes, setPrefixes] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/system-config/list');
      const cfg = (res.data || []).find((c: any) => c.configKey === CONFIG_KEY);
      if (cfg) {
        const parsed = JSON.parse(cfg.configValue || '{}');
        setData(parsed);
        if (parsed.cos?.prefixes) setPrefixes(parsed.cos.prefixes);
      } else {
        setData(null);
      }
    } catch { setData(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-open credentials modal when nothing configured
  useEffect(() => {
    if (loading || modalOpen || dismissed) return;
    if (!data) {
      openModal('credentials');
    }
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
      vals.secretId = s.secretId || '';
      vals.secretKey = s.secretKey || '';
    } else if (modalSection === 'sms') {
      vals.sdkAppId = s.sdkAppId || '';
      vals.appKey = s.appKey || '';
      vals.signName = s.signName || 'DumpAny';
      vals.templateId = s.templateId || '';
    } else if (modalSection === 'cos') {
      vals.bucket = s.bucket || '';
      vals.region = s.region || '';
      setPrefixes(s.prefixes || []);
    }
    form.setFieldsValue(vals);
  }, [modalOpen, modalSection, data, form]);

  const handleSubmit = async (vals: any) => {
    setSubmitting(true);
    try {
      // Merge: start with defaults, overlay existing data, then overlay edited section
      const merged = { ...defaultData, ...(data || {}) };
      if (modalSection === 'cos') {
        merged.cos = { ...merged.cos, ...vals, prefixes };
      } else {
        merged[modalSection] = { ...merged[modalSection], ...vals };
      }

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

  const addPrefix = () => {
    setPrefixes([...prefixes, { key: '', name: '', path: '' }]);
  };

  const updatePrefix = (i: number, field: string, val: string) => {
    const copy = [...prefixes];
    copy[i] = { ...copy[i], [field]: val };
    setPrefixes(copy);
  };

  const removePrefix = (i: number) => {
    setPrefixes(prefixes.filter((_, idx) => idx !== i));
  };

  const renderCard = (title: string, section: SectionKey, fields: { label: string; value: any }[], onEdit: () => void) => (
    <div style={{ marginBottom: 20, padding: 20, borderRadius: 12, border: '1px solid var(--border-color)', ...CARD_WIDTH }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>{title}</Title>
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={onEdit}>{t('app.edit')}</Button>
        </Space>
      </div>
      <Descriptions column={1} size="small">
        {fields.map(f => (
          <Descriptions.Item key={f.label} label={f.label}>
            {f.value ?? '-'}
          </Descriptions.Item>
        ))}
        <Descriptions.Item label={t('app.status')}>
          {isConfiguredSection(data, section)
            ? <Tag color="green">{t('common.configured')}</Tag>
            : <Tag color="red">{t('common.notConfigured')}</Tag>}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );

  // ─── COS prefix table ───
  const renderCosPrefixTable = () => (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('tencent.prefixes')}</div>
      {prefixes.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', marginBottom: 8, fontSize: 13 }}>{t('tencent.noPrefixes')}</div>
      ) : (
        prefixes.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <Input size="small" placeholder="key" value={p.key}
              onChange={e => updatePrefix(i, 'key', e.target.value)}
              style={{ width: 100 }} />
            <Input size="small" placeholder={t('tencent.prefixName')} value={p.name}
              onChange={e => updatePrefix(i, 'name', e.target.value)}
              style={{ width: 120 }} />
            <Input size="small" placeholder={t('tencent.prefixPath')} value={p.path}
              onChange={e => updatePrefix(i, 'path', e.target.value)}
              style={{ flex: 1 }} />
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removePrefix(i)} />
          </div>
        ))
      )}
      <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addPrefix}>
        {t('tencent.addPrefix')}
      </Button>
    </div>
  );

  if (loading) return <Card loading><Title level={4}>{t('tencent.title')}</Title></Card>;

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('tencent.title')}</Title>
      </div>

      {/* Credentials Card */}
      {renderCard(t('tencent.credentials'), 'credentials', [
        { label: t('tencent.secretId'), value: data?.credentials?.secretId },
      ], () => openModal('credentials'))}

      {/* SMS Card */}
      {renderCard(t('tencent.sms'), 'sms', [
        { label: t('tencent.sdkAppId'), value: data?.sms?.sdkAppId },
        { label: t('tencent.appKey'), value: data?.sms?.appKey },
        { label: t('tencent.sign'), value: data?.sms?.signName },
        { label: t('tencent.templateId'), value: data?.sms?.templateId },
      ], () => openModal('sms'))}

      {/* COS Card */}
      {renderCard(t('tencent.cos'), 'cos', [
        { label: t('tencent.bucket'), value: data?.cos?.bucket },
        { label: t('tencent.region'), value: data?.cos?.region },
      ], () => openModal('cos'))}

      {/* ─── Credentials Modal ─── */}
      <Modal title={t('tencent.credentials')} open={modalOpen && modalSection === 'credentials'}
        onCancel={() => { setModalOpen(false); setDismissed(true); }}
        footer={null} width={480} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="secretId" label={t('tencent.secretId')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="secretKey" label={t('tencent.secretKey')} rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={submitting} block>{t('common.save')}</Button></Form.Item>
        </Form>
      </Modal>

      {/* ─── SMS Modal ─── */}
      <Modal title={t('tencent.sms')} open={modalOpen && modalSection === 'sms'}
        onCancel={() => { setModalOpen(false); setDismissed(true); }}
        footer={null} width={480} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="sdkAppId" label={t('tencent.sdkAppId')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="appKey" label={t('tencent.appKey')} rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="signName" label={t('tencent.sign')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="templateId" label={t('tencent.templateId')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" loading={submitting} block>{t('common.save')}</Button></Form.Item>
        </Form>
      </Modal>

      {/* ─── COS Modal ─── */}
      <Modal title={t('tencent.cos')} open={modalOpen && modalSection === 'cos'}
        onCancel={() => { setModalOpen(false); setDismissed(true); }}
        footer={null} width={580} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="bucket" label={t('tencent.bucket')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="region" label={t('tencent.region')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {renderCosPrefixTable()}
          <Form.Item style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" loading={submitting} block>{t('common.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TencentConfig;
