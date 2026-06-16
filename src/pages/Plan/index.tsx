import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Select, message, Typography, Card, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

interface Plan {
  id: number;
  planId: string;
  tier: string;
  priceCNY: number;
  priceUSD: number;
  validityType: string;
  validityValue: number;
  maxDevices: number;
  status: number;
  popular: boolean;
  sortOrder: number;
  paymentExpirySeconds: number;
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
          priceCny: editing.priceCNY,
          priceUsd: editing.priceUSD,
          validityType: editing.validityType,
          validityValue: editing.validityValue,
          maxDevices: editing.maxDevices,
          status: editing.status,
          popular: editing.popular,
          sortOrder: editing.sortOrder,
          paymentExpirySeconds: editing.paymentExpirySeconds ?? 7200,
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
    const defaults = { status: 1, popular: false, validityType: 'day', validityValue: 30, maxDevices: 1, priceCny: 0, priceUsd: 0, sortOrder: 0, paymentExpirySeconds: 7200 };
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
      const body = { ...values };
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
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '标识', dataIndex: 'planId', key: 'planId', width: 100 },
    { title: t('license.tier'), dataIndex: 'tier', key: 'tier', width: 80 },
    { title: '价格(CNY)', dataIndex: 'priceCNY', key: 'priceCNY', width: 100, render: (v: number) => v != null ? `¥${(v / 100).toFixed(2)}` : '-' },
    { title: '价格(USD)', dataIndex: 'priceUSD', key: 'priceUSD', width: 100, render: (v: number) => v != null ? `$${(v / 100).toFixed(2)}` : '-' },
    { title: '有效期', dataIndex: 'validityType', key: 'validityType', width: 80, render: (_: string, r: Plan) => {
      const map: Record<string, string> = { hour: '小时', day: '天', year: '年', permanent: '永久' };
      return r.validityType === 'permanent' ? '永久' : `${r.validityValue} ${map[r.validityType] || r.validityType}`;
    }},
    { title: '设备', dataIndex: 'maxDevices', key: 'maxDevices', width: 60 },
    {
      title: '推荐', dataIndex: 'popular', key: 'popular', width: 60,
      render: (v: boolean) => v ? <Tag color="gold">推荐</Tag> : null,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 70,
      render: (v: number) => <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '启用' : '禁用'}</Tag>,
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
          <Space size={16}>
            <Form.Item name="priceCny" label="价格(CNY/分)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ color: fieldColor('priceCny') }} />
            </Form.Item>
            <Form.Item name="priceUsd" label="价格(USD/分)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ color: fieldColor('priceUsd') }} />
            </Form.Item>
            <Form.Item name="validityType" label="有效期" initialValue="day">
              <Select style={{ width: 110 }} onChange={() => { const t = form.getFieldValue('validityType'); if (t === 'permanent') form.setFieldsValue({ validityValue: 0 }); }}>
                <Select.Option value="hour">小时</Select.Option>
                <Select.Option value="day">天</Select.Option>
                <Select.Option value="year">年</Select.Option>
                <Select.Option value="permanent">永久</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="validityValue" label="值" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ color: fieldColor('validityValue'), width: 80 }}
                disabled={form.getFieldValue('validityType') === 'permanent'} />
            </Form.Item>
            <Form.Item name="maxDevices" label="设备数" rules={[{ required: true }]}>
              <InputNumber min={1} max={99} style={{ color: fieldColor('maxDevices') }} />
            </Form.Item>
          </Space>
          <Space size={16}>
            <Form.Item name="status" label="状态" initialValue={1}>
              <Select style={{ width: 100 }}>
                <Select.Option value={1}>启用</Select.Option>
                <Select.Option value={0}>禁用</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="popular" label="推荐" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="sortOrder" label="排序">
              <InputNumber min={0} style={{ color: fieldColor('sortOrder') }} />
            </Form.Item>
          </Space>
          <Space size={16}>
            <Form.Item name="paymentExpirySeconds" label="支付过期(秒)" initialValue={7200}>
              <InputNumber min={1} style={{ color: fieldColor('paymentExpirySeconds') }} />
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
