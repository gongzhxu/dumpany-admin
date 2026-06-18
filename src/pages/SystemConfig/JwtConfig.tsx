import React, { useEffect, useState } from 'react';
import { Descriptions, Button, Modal, Form, Input, InputNumber, message, Typography, Card, Tag } from 'antd';
import { EditOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

const CONFIG_KEY = 'jwt_config';

const JwtConfig: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [form] = Form.useForm();

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
      const vals = data || { secret: '', expireSeconds: 24 };
      form.setFieldsValue({ secret: vals.secret || '', expireSeconds: vals.expireSeconds || 24 });
    }
  }, [modalOpen, data, form]);

  const handleSubmit = async (vals: any) => {
    setSubmitting(true);
    try {
      await request.put('/settings/jwt', vals);
      message.success(t('jwtConfig.saved'));
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    } finally { setSubmitting(false); }
  };

  if (loading) return <Card loading><Title level={4}>{t('jwtConfig.title')}</Title></Card>;

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('jwtConfig.title')}</Title>
        {data && <Button icon={<EditOutlined />} onClick={() => setModalOpen(true)}>{t('jwtConfig.edit')}</Button>}
      </div>
      <Card>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label={t('jwtConfig.secret')}>
            {data?.secret ? <Tag color="blue">{data.secret.substring(0, 20)}...</Tag> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('jwtConfig.expireSeconds')}>
            {data?.expireSeconds ?? 86400}{t('jwtConfig.hour')}
          </Descriptions.Item>
          <Descriptions.Item label={t('jwtConfig.status')}>
            {data?.secret
              ? <Tag icon={<CheckCircleOutlined />} color="success">{t('jwtConfig.configured')}</Tag>
              : <Tag icon={<CloseCircleOutlined />} color="error">{t('jwtConfig.notConfigured')}</Tag>}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Modal title={t('jwtConfig.editModal')} open={modalOpen}
        onCancel={() => { setModalOpen(false); setDismissed(true); }}
        footer={null} width={520} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="secret" label={t('jwtConfig.secret')} rules={[{ required: true, message: t('jwtConfig.secretRequired') }]}>
            <Input.Password placeholder={t('jwtConfig.secretRequired')} />
          </Form.Item>
          <Form.Item name="expireSeconds" label={t('jwtConfig.expireSeconds')} initialValue={86400}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>{t('jwtConfig.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default JwtConfig;
