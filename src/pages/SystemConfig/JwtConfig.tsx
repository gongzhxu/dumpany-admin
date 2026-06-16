import React, { useEffect, useState } from 'react';
import { Descriptions, Button, Modal, Form, Input, InputNumber, message, Typography, Card, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import request from '../../api/request';

const { Title } = Typography;

const CONFIG_KEY = 'jwt_config';

const JwtConfig: React.FC = () => {
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
      message.success('JWT config saved');
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    } finally { setSubmitting(false); }
  };

  if (loading) return <Card loading><Title level={4}>JWT 配置</Title></Card>;

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>JWT 配置</Title>
        {data && <Button icon={<EditOutlined />} onClick={() => setModalOpen(true)}>编辑</Button>}
      </div>
      <Card>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="Secret">
            {data?.secret ? <Tag color="blue">{data.secret.substring(0, 20)}...</Tag> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="过期时间(秒)">
            {data?.expireSeconds ?? 86400} 小时
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {data?.secret ? <Tag color="green">已配置</Tag> : <Tag color="red">未配置</Tag>}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Modal title="编辑 JWT 配置" open={modalOpen}
        onCancel={() => { setModalOpen(false); setDismissed(true); }}
        footer={null} width={520} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="secret" label="Secret" rules={[{ required: true, message: '请输入 JWT Secret' }]}>
            <Input.Password placeholder="JWT 签名密钥" />
          </Form.Item>
          <Form.Item name="expireSeconds" label="过期时间(秒)" initialValue={86400}>
            <InputNumber min={1} max={8760} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>保存</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default JwtConfig;
