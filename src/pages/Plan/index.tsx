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
  originalPriceCNY: number;
  originalPriceUSD: number;
  validityType: string;
  validityValue: number;
  maxDevices: number;
  status: number;
  popular: boolean;
  sortOrder: number;
  bulkDiscountRate: number;
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
          id: editing.id,
          planId: editing.planId,
          tier: editing.tier,
          priceCny: editing.priceCNY,
          priceUsd: editing.priceUSD,
          originalPriceCny: editing.originalPriceCNY,
          originalPriceUsd: editing.originalPriceUSD,
          validityType: editing.validityType,
          validityValue: editing.validityValue,
          maxDevices: editing.maxDevices,
          status: editing.status,
          popular: editing.popular,
          sortOrder: editing.sortOrder,
          bulkDiscountRate: editing.bulkDiscountRate,
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
    const defaults = { status: 1, popular: false, validityType: 'day', validityValue: 30, maxDevices: 1, priceCny: 0, priceUsd: 0, originalPriceCny: 0, originalPriceUsd: 0, bulkDiscountRate: 10000, sortOrder: 0, paymentExpirySeconds: 7200 };
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
      if (editing) body.id = editing.id;
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
    if (!editing) return undefined;
    if (init[key] !== curr[key]) return '#ff4d4f';
    return '#bbb';
  };

  const columns = [
    { title: t('plan.id'), dataIndex: 'id', key: 'id', width: 60 },
    { title: t('plan.planId'), dataIndex: 'planId', key: 'planId', width: 100 },
    { title: t('license.tier'), dataIndex: 'tier', key: 'tier', width: 80 },
    { title: t('plan.priceCNY'), dataIndex: 'priceCNY', key: 'priceCNY', width: 90, render: (v: number) => v != null ? `¥${(v / 100).toFixed(2)}` : '-' },
    { title: t('plan.originalPriceCNY'), dataIndex: 'originalPriceCNY', key: 'originalPriceCNY', width: 90, render: (v: number) => v ? `¥${(v / 100).toFixed(2)}` : '-' },
    { title: t('plan.validity'), dataIndex: 'validityType', key: 'validityType', width: 80, render: (_: string, r: Plan) => {
      const map: Record<string, string> = { hour: t('plan.hour'), day: t('plan.day'), year: t('plan.year'), permanent: t('plan.permanent') };
      return r.validityType === 'permanent' ? t('plan.permanent') : `${r.validityValue} ${map[r.validityType] || r.validityType}`;
    }},
    { title: t('plan.devices'), dataIndex: 'maxDevices', key: 'maxDevices', width: 60 },
    {
      title: '推荐', dataIndex: 'popular', key: 'popular', width: 60,
      render: (v: boolean) => v ? <Tag color="gold">{t('plan.popular')}</Tag> : null,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 70,
      render: (v: number) => <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? t('plan.enabled') : t('plan.disabled')}</Tag>,
    },
    { title: t('plan.sortOrder'), dataIndex: 'sortOrder', key: 'sortOrder', width: 60 },
    {
      title: t('app.action'), key: 'action', width: 160,
      render: (_: any, record: Plan) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>{t('plan.edit')}</Button>
          <Popconfirm title={t('plan.deleteConfirm')} onConfirm={() => handleDelete(record.planId)}>
            <Button size="small" color="danger" variant="outlined">{t('plan.delete')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('plan.title')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('plan.add')}</Button>
      </div>

      <Card>
        <Table dataSource={data} columns={columns} rowKey="planId" loading={loading} pagination={false} size="small" scroll={{ x: 1200 }} />
      </Card>

      <Modal title={editing ? t('plan.editModal') : t('plan.addModal')} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={800} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}
          onValuesChange={() => setCurr({ ...form.getFieldsValue() })}>
          <Form.Item name="planId" label={t('plan.id')} rules={[{ required: true }]}>
            <Input placeholder="standard / pro / lifetime" disabled={!!editing}
              style={{ color: fieldColor('planId') }} />
          </Form.Item>
          <Form.Item name="tier" label={t('plan.tier')} rules={[{ required: true }]}>
            <Input placeholder="standard / pro"
              style={{ color: fieldColor('tier') }} />
          </Form.Item>
          <Space size={16}>
            <Form.Item name="priceCny" label={t('plan.priceCnyLabel')} rules={[{ required: true }]}>
              <InputNumber min={0} style={{ color: fieldColor('priceCny') }} />
            </Form.Item>
            <Form.Item name="originalPriceCny" label={t('plan.originalPriceCnyLabel')}>
              <InputNumber min={0} style={{ color: fieldColor('originalPriceCny') }} />
            </Form.Item>
            <Form.Item name="priceUsd" label={t('plan.priceUsdLabel')} rules={[{ required: true }]}>
              <InputNumber min={0} style={{ color: fieldColor('priceUsd') }} />
            </Form.Item>
            <Form.Item name="originalPriceUsd" label={t('plan.originalPriceUsdLabel')}>
              <InputNumber min={0} style={{ color: fieldColor('originalPriceUsd') }} />
            </Form.Item>
          </Space>
          <Space size={16}>
            <Form.Item name="validityType" label={t('plan.validityType')} initialValue="day">
              <Select style={{ width: 110 }} onChange={() => { const t = form.getFieldValue('validityType'); if (t === 'permanent') form.setFieldsValue({ validityValue: 0 }); }}>
                <Select.Option value="hour">{t('plan.hour')}</Select.Option>
                <Select.Option value="day">{t('plan.day')}</Select.Option>
                <Select.Option value="year">{t('plan.year')}</Select.Option>
                <Select.Option value="permanent">{t('plan.permanent')}</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="validityValue" label={t('plan.validityValue')} rules={[{ required: true }]}>
              <InputNumber min={0} style={{ color: fieldColor('validityValue'), width: 80 }}
                disabled={form.getFieldValue('validityType') === 'permanent'} />
            </Form.Item>
            <Form.Item name="maxDevices" label={t('plan.maxDevices')} rules={[{ required: true }]}>
              <InputNumber min={1} max={99} style={{ color: fieldColor('maxDevices') }} />
            </Form.Item>
            <Form.Item name="bulkDiscountRate" label={t('plan.bulkDiscountRate')} initialValue={10000}>
              <InputNumber min={0} max={10000} style={{ color: fieldColor('bulkDiscountRate') }} />
            </Form.Item>
          </Space>
          <Space size={16}>
            <Form.Item name="status" label={t('plan.status')} initialValue={1}>
              <Select style={{ width: 100 }}>
                <Select.Option value={1}>{t('plan.enabled')}</Select.Option>
                <Select.Option value={0}>{t('plan.disabled')}</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="popular" label={t('plan.popularLabel')} valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="sortOrder" label={t('plan.sortOrderLabel')}>
              <InputNumber min={0} style={{ color: fieldColor('sortOrder') }} />
            </Form.Item>
            <Form.Item name="paymentExpirySeconds" label={t('plan.paymentExpiry')} initialValue={7200}>
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
