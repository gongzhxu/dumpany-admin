import type { Order } from "../../api/orders";
import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Input, Select, Modal, message, Tag,
  Popconfirm, Typography, Card, Descriptions,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { orderApi } from '../../api/orders';

const { Title } = Typography;

const statusColorMap: Record<string, string> = {
  pending: 'orange',
  paid: 'green',
  refunded: 'red',
  cancelled: 'default',
};

const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<Order | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await orderApi.list({ page, pageSize, keyword, status: statusFilter });
      setData(res.data.list);
      setTotal(res.data.total);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefund = async (id: number) => {
    try {
      await orderApi.refund(id);
      message.success('Order refunded');
      fetchData();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const showDetail = async (id: number) => {
    try {
      const res: any = await orderApi.get(id);
      setDetail(res.data);
      setDetailOpen(true);
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: t('order.orderNo'),
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (text: string, record: Order) => (
        <Button type="link" size="small" onClick={() => showDetail(record.id)}>{text}</Button>
      ),
    },
    { title: t('license.subscriber'), dataIndex: 'subscriber', key: 'subscriber' },
    { title: t('order.product'), dataIndex: 'product', key: 'product' },
    {
      title: t('order.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number, record: Order) => `${record.currency} ${val.toFixed(2)}`,
    },
    {
      title: t('app.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text: string) => (
        <Tag color={statusColorMap[text]}>{t(`order.${text}`)}</Tag>
      ),
    },
    {
      title: t('license.licenseKey'),
      dataIndex: 'licenseKey',
      key: 'licenseKey',
      ellipsis: true,
    },
    {
      title: t('settings.created_at'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: t('app.action'),
      key: 'action',
      width: 80,
      render: (_: any, record: Order) => (
        record.status === 'paid' ? (
          <Popconfirm
            title={t('order.refund_confirm')}
            onConfirm={() => handleRefund(record.id)}
          >
            <Button size="small" color="danger" variant="outlined">{t('order.refund')}</Button>
          </Popconfirm>
        ) : null
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('order.title')}</Title>
      </div>

      <Card>
        <div className="table-toolbar">
          <div className="toolbar-left">
            <Input
              placeholder={t('order.orderNo')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
              allowClear
            />
            <Select
              placeholder={t('app.status')}
              value={statusFilter || undefined}
              onChange={(v) => setStatusFilter(v || '')}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="pending">{t('order.pending')}</Select.Option>
              <Select.Option value="paid">{t('order.paid')}</Select.Option>
              <Select.Option value="refunded">{t('order.refunded')}</Select.Option>
              <Select.Option value="cancelled">{t('order.cancelled')}</Select.Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchData} />
          </div>
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `Total ${t}`,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
          scroll={{ x: 900 }}
          size="small"
        />
      </Card>

      <Modal
        title={t('order.orderNo')}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={600}
      >
        {detail && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
            <Descriptions.Item label={t('order.orderNo')}>{detail.orderNo}</Descriptions.Item>
            <Descriptions.Item label={t('license.subscriber')} span={2}>{detail.subscriber}</Descriptions.Item>
            <Descriptions.Item label={t('order.product')}>{detail.product}</Descriptions.Item>
            <Descriptions.Item label={t('order.amount')}>{detail.currency} {detail.amount.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label={t('app.status')}>
              <Tag color={statusColorMap[detail.status]}>{detail.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('license.licenseKey')} span={2}>{detail.licenseKey || '-'}</Descriptions.Item>
            <Descriptions.Item label={t('order.created_at')}>
              {dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label={t('order.paid')}>
              {detail.paid_at ? dayjs(detail.paid_at).format('YYYY-MM-DD HH:mm') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;
