import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, message, Typography, Card, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;
const { TextArea } = Input;

interface Plan {
  planId: string;
  tier: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  priceCny: number;
  priceUsd: number;
  validityDays: number;
  maxDevices: number;
  featuresZh: string[];
  featuresEn: string[];
  active: boolean;
  popular: boolean;
  sortOrder: number;
}

const PlanPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [init, setInit] = useState<Record<string, any>>({});
  const [curr, setCurr] = useState<Record<string, any>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/plan/list');
      setData(res.data);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Modal 打开时设置初始值和表单
  useEffect(() => {
    if (modalOpen) {
      let vals: Record<string, any> = {};
      if (editing) {
        vals = {
          planId: editing.planId,
          tier: editing.tier,
          nameZh: editing.nameZh,
          nameEn: editing.nameEn,
          descriptionZh: editing.descriptionZh,
          descriptionEn: editing.descriptionEn,
          priceCny: editing.priceCny,
          priceUsd: editing.priceUsd,
          validityDays: editing.validityDays,
          maxDevices: editing.maxDevices,
          featuresZh: editing.featuresZh?.join('\n') || '',
          featuresEn: editing.featuresEn?.join('\n') || '',
          active: editing.active,
          popular: editing.popular,
          sortOrder: editing.sortOrder,
        };
      }
      setInit(vals);
      setCurr(vals);
      form.setFieldsValue(vals);
    }
  }, [modalOpen, editing, form]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    const defaults = { active: true, popular: false, validityDays: 365, maxDevices: 1, priceCny: 0, priceUsd: 0, sortOrder: 0 };
    setInit(defaults);
    setCurr(defaults);
    form.setFieldsValue(defaults);
    setModalOpen(true);
  };

  const openEdit = (record: Plan) => {
    setEditing(record);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const body = {
        ...values,
        featuresZh: values.featuresZh ? values.featuresZh.split('\n').filter((s: string) => s.trim()) : [],
        featuresEn: values.featuresEn ? values.featuresEn.split('\n').filter((s: string) => s.trim()) : [],
      };
      if (editing && editing.planId !== values.planId) {
        await request.delete('/plan/delete', { data: { planId: editing.planId } });
      }
      await request.post('/plan/save', body);
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
      await request.delete('/plan/delete', { data: { planId: id } });
      message.success('Plan deleted');
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    }
  };

  // 计算字段颜色：创建=黑色，编辑时未改=灰色，已改=红色
  const fieldColor = (key: string) => {
    if (!editing) return undefined; // 创建模式，黑色
    if (init[key] !== curr[key]) return '#ff4d4f'; // 已修改，红色
    return '#bbb'; // 未修改，灰色
  };

  const columns = [
    { title: 'ID', dataIndex: 'planId', key: 'planId', width: 100 },
    { title: t('license.tier'), dataIndex: 'tier', key: 'tier', width: 80 },
    { title: '名称(中)', dataIndex: 'nameZh', key: 'nameZh' },
    { title: '名称(英)', dataIndex: 'nameEn', key: 'nameEn' },
    { title: '价格(CNY)', dataIndex: 'priceCny', key: 'priceCny', width: 100, render: (v: number) => `¥${(v / 100).toFixed(2)}` },
    { title: '价格(USD)', dataIndex: 'priceUsd', key: 'priceUsd', width: 100, render: (v: number) => `$${(v / 100).toFixed(2)}` },
    { title: '天数', dataIndex: 'validityDays', key: 'validityDays', width: 60, render: (v: number) => v === 0 ? '永久' : v },
    { title: '设备', dataIndex: 'maxDevices', key: 'maxDevices', width: 60 },
    {
      title: '推荐', dataIndex: 'popular', key: 'popular', width: 60,
      render: (v: boolean) => v ? <Tag color="gold">推荐</Tag> : null,
    },
    {
      title: '状态', dataIndex: 'active', key: 'active', width: 70,
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '启用' : '禁用'}</Tag>,
    },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 60 },
    {
      title: t('app.action'), key: 'action', width: 160,
      render: (_: any, record: Plan) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>{t('app.edit')}</Button>
          <Popconfirm title="确认删除此套餐？" onConfirm={() => handleDelete(record.planId)}>
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
        <Table dataSource={data} columns={columns} rowKey="planId" loading={loading} pagination={false} size="small" scroll={{ x: 1200 }} />
      </Card>

      <Modal title={editing ? '编辑套餐' : '新增套餐'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={640} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}
          onValuesChange={() => setCurr({ ...form.getFieldsValue() })}>
          <Form.Item name="planId" label="ID" rules={[{ required: true }]}>
            <Input placeholder="standard / pro / lifetime" disabled={!!editing}
              style={{ color: fieldColor('planId') }} />
          </Form.Item>
          <Form.Item name="tier" label="层级" rules={[{ required: true }]}>
            <Input placeholder="standard / pro"
              style={{ color: fieldColor('tier') }} />
          </Form.Item>
          <Form.Item name="nameZh" label="名称(中文)" rules={[{ required: true }]}>
            <Input style={{ color: fieldColor('nameZh') }} />
          </Form.Item>
          <Form.Item name="nameEn" label="名称(英文)" rules={[{ required: true }]}>
            <Input style={{ color: fieldColor('nameEn') }} />
          </Form.Item>
          <Form.Item name="descriptionZh" label="描述(中文)">
            <Input style={{ color: fieldColor('descriptionZh') }} />
          </Form.Item>
          <Form.Item name="descriptionEn" label="描述(英文)">
            <Input style={{ color: fieldColor('descriptionEn') }} />
          </Form.Item>
          <Space size={16}>
            <Form.Item name="priceCny" label="价格(CNY/分)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ color: fieldColor('priceCny') }} />
            </Form.Item>
            <Form.Item name="priceUsd" label="价格(USD/分)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ color: fieldColor('priceUsd') }} />
            </Form.Item>
            <Form.Item name="validityDays" label="天数" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ color: fieldColor('validityDays') }} />
            </Form.Item>
            <Form.Item name="maxDevices" label="设备数" rules={[{ required: true }]}>
              <InputNumber min={1} max={99} style={{ color: fieldColor('maxDevices') }} />
            </Form.Item>
          </Space>
          <Form.Item name="featuresZh" label="功能列表(中文，每行一个)">
            <TextArea rows={4} style={{ color: fieldColor('featuresZh') }} />
          </Form.Item>
          <Form.Item name="featuresEn" label="功能列表(英文，每行一个)">
            <TextArea rows={4} style={{ color: fieldColor('featuresEn') }} />
          </Form.Item>
          <Space size={16}>
            <Form.Item name="active" label="启用" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="popular" label="推荐" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="sortOrder" label="排序">
              <InputNumber min={0} style={{ color: fieldColor('sortOrder') }} />
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

export default PlanPage;
