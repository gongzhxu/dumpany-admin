import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, message, Typography, Card, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;
const { TextArea } = Input;

interface Plan {
  id: string;
  tier: string;
  name_zh: string;
  name_en: string;
  description_zh: string;
  description_en: string;
  price_cny: number;
  price_usd: number;
  validity_days: number;
  max_devices: number;
  features_zh: string[];
  features_en: string[];
  active: boolean;
  sort_order: number;
}

const PlansPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/plans');
      setData(res.data);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ active: true, validity_days: 365, max_devices: 1, price_cny: 0, price_usd: 0, sort_order: 0 });
    setModalOpen(true);
  };

  const openEdit = (record: Plan) => {
    setEditing(record);
    form.setFieldsValue({
      id: record.id,
      tier: record.tier,
      name_zh: record.name_zh,
      name_en: record.name_en,
      description_zh: record.description_zh,
      description_en: record.description_en,
      price_cny: record.price_cny,
      price_usd: record.price_usd,
      validity_days: record.validity_days,
      max_devices: record.maxDevices,
      features_zh: record.features_zh?.join('\n') || '',
      features_en: record.features_en?.join('\n') || '',
      active: record.active,
      sort_order: record.sort_order,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const body = {
        ...values,
        features_zh: values.features_zh ? values.features_zh.split('\n').filter((s: string) => s.trim()) : [],
        features_en: values.features_en ? values.features_en.split('\n').filter((s: string) => s.trim()) : [],
      };
      if (editing && editing.id !== values.id) {
        await request.delete(`/plans/${editing.id}`);
      }
      await request.post('/plans', body);
      message.success('Plan saved');
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await request.delete(`/plans/${id}`);
      message.success('Plan deleted');
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: t('license.tier'), dataIndex: 'tier', key: 'tier', width: 100 },
    { title: '名称(中)', dataIndex: 'name_zh', key: 'name_zh' },
    { title: '名称(英)', dataIndex: 'name_en', key: 'name_en' },
    { title: '价格(CNY)', dataIndex: 'price_cny', key: 'price_cny', width: 100, render: (v: number) => `¥${(v / 100).toFixed(2)}` },
    { title: '价格(USD)', dataIndex: 'price_usd', key: 'price_usd', width: 100, render: (v: number) => `$${(v / 100).toFixed(2)}` },
    { title: '天数', dataIndex: 'validity_days', key: 'validity_days', width: 60, render: (v: number) => v === 0 ? '永久' : v },
    { title: '设备', dataIndex: 'maxDevices', key: 'maxDevices', width: 60 },
    {
      title: '状态', dataIndex: 'active', key: 'active', width: 70,
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag>,
    },
    { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 60 },
    {
      title: t('app.action'), key: 'action', width: 160,
      render: (_: any, record: Plan) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>{t('app.edit')}</Button>
          <Popconfirm title="确认删除此套餐？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" color="danger" variant="outlined">{t('app.delete')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>套餐管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增套餐</Button>
      </div>

      <Card>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={false} size="small" scroll={{ x: 1100 }} />
      </Card>

      <Modal title={editing ? '编辑套餐' : '新增套餐'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={640}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="id" label="ID" rules={[{ required: true }]}>
            <Input placeholder="standard / pro / lifetime" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="tier" label="层级" rules={[{ required: true }]}>
            <Input placeholder="standard / pro" />
          </Form.Item>
          <Form.Item name="name_zh" label="名称(中文)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name_en" label="名称(英文)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description_zh" label="描述(中文)">
            <Input />
          </Form.Item>
          <Form.Item name="description_en" label="描述(英文)">
            <Input />
          </Form.Item>
          <Space size={16}>
            <Form.Item name="price_cny" label="价格(CNY/分)" rules={[{ required: true }]}>
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="price_usd" label="价格(USD/分)" rules={[{ required: true }]}>
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="validity_days" label="天数" rules={[{ required: true }]}>
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="maxDevices" label="设备数" rules={[{ required: true }]}>
              <InputNumber min={1} max={99} />
            </Form.Item>
          </Space>
          <Form.Item name="features_zh" label="功能列表(中文，每行一个)">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="features_en" label="功能列表(英文，每行一个)">
            <TextArea rows={4} />
          </Form.Item>
          <Space size={16}>
            <Form.Item name="active" label="启用" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="sort_order" label="排序">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>{t('app.submit')}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PlansPage;
