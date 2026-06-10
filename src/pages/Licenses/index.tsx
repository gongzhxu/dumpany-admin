import type { License, CreateLicenseParams } from "../../api/licenses";
import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Input, Select, Space, Modal, Form, InputNumber, message,
  Tag, Popconfirm, Typography, Card, Descriptions,
} from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { licenseApi } from '../../api/licenses';

const { Title } = Typography;


const LicensesPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<License[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewId, setRenewId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<License | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);
  const [createForm] = Form.useForm();
  const [renewForm] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await licenseApi.list({ page, pageSize, keyword, type: typeFilter, status: statusFilter });
      setData(res.data.list);
      setTotal(res.data.total);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, typeFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (values: CreateLicenseParams) => {
    setCreateLoading(true);
    try {
      await licenseApi.create(values);
      message.success('License created successfully');
      setCreateModalOpen(false);
      createForm.resetFields();
      fetchData();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRenew = async (values: { extra_days: number }) => {
    if (!renewId) return;
    setRenewLoading(true);
    try {
      await licenseApi.renew(renewId, values.extra_days);
      message.success('License renewed successfully');
      setRenewModalOpen(false);
      setRenewId(null);
      renewForm.resetFields();
      fetchData();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setRenewLoading(false);
    }
  };

  const handleRevoke = async (id: number) => {
    try {
      await licenseApi.revoke(id);
      message.success('License revoked');
      fetchData();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const showDetail = async (id: number) => {
    try {
      const res: any = await licenseApi.get(id);
      setDetail(res.data);
      setDetailOpen(true);
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const statusColorMap: Record<string, string> = {
    active: 'green',
    revoked: 'red',
    expired: 'orange',
  };

  const typeColorMap: Record<string, string> = {
    trial: 'blue',
    paid: 'purple',
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: t('license.license_key'),
      dataIndex: 'license_key',
      key: 'license_key',
      ellipsis: true,
      render: (text: string, record: License) => (
        <a onClick={() => showDetail(record.id)}>{text}</a>
      ),
    },
    {
      title: t('license.subscriber'),
      dataIndex: 'subscriber',
      key: 'subscriber',
    },
    {
      title: t('license.type'),
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (text: string) => <Tag color={typeColorMap[text]}>{t(`license.${text}`)}</Tag>,
    },
    {
      title: t('license.tier'),
      dataIndex: 'tier',
      key: 'tier',
      width: 100,
      render: (text: string) => t(`license.${text}`),
    },
    {
      title: t('license.issued_at'),
      dataIndex: 'issued_at',
      key: 'issued_at',
      width: 160,
      render: (val: number) => dayjs.unix(val).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('license.expires_at'),
      dataIndex: 'expires_at',
      key: 'expires_at',
      width: 160,
      render: (val: number) => dayjs.unix(val).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('app.status'),
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (text: string) => (
        <Tag color={statusColorMap[text]}>{text.toUpperCase()}</Tag>
      ),
    },
    {
      title: t('app.action'),
      key: 'action',
      width: 160,
      render: (_: any, record: License) => (
        <Space>
          <a onClick={() => { setRenewId(record.id); setRenewModalOpen(true); }}>{t('license.renew')}</a>
          {record.status === 'active' && (
            <Popconfirm
              title={t('license.revoke_confirm')}
              onConfirm={() => handleRevoke(record.id)}
            >
              <a style={{ color: 'red' }}>{t('license.revoke')}</a>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('license.title')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          {t('license.generate')}
        </Button>
      </div>

      <Card>
        <div className="table-toolbar">
          <div className="toolbar-left">
            <Input
              placeholder={t('license.license_key')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
              allowClear
            />
            <Select
              placeholder={t('license.type')}
              value={typeFilter || undefined}
              onChange={(v) => setTypeFilter(v || '')}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="trial">Trial</Select.Option>
              <Select.Option value="paid">Paid</Select.Option>
            </Select>
            <Select
              placeholder={t('app.status')}
              value={statusFilter || undefined}
              onChange={(v) => setStatusFilter(v || '')}
              style={{ width: 120 }}
              allowClear
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="revoked">Revoked</Select.Option>
              <Select.Option value="expired">Expired</Select.Option>
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
          scroll={{ x: 1100 }}
          size="small"
        />
      </Card>

      {/* Create License Modal */}
      <Modal
        title={t('license.create_title')}
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        footer={null}
        width={500}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="type" label={t('license.type')} rules={[{ required: true }]}>
            <Select>
              <Select.Option value="paid">{t('license.paid')}</Select.Option>
              <Select.Option value="trial">{t('license.trial')}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="subscriber" label={t('license.subscriber')} rules={[{ required: true, type: 'email' }]}>
            <Input placeholder={t('license.placeholder_subscriber')} />
          </Form.Item>
          <Form.Item name="tier" label={t('license.tier')} rules={[{ required: true }]}>
            <Select>
              <Select.Option value="standard">{t('license.standard')}</Select.Option>
              <Select.Option value="pro">{t('license.pro')}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="max_devices" label={t('license.max_devices')} initialValue={1} rules={[{ required: true }]}>
            <InputNumber min={1} max={99} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="duration_days" label={t('license.duration_days')} initialValue={365} rules={[{ required: true }]}>
            <InputNumber min={1} max={3650} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createLoading} block>
              {t('app.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Renew Modal */}
      <Modal
        title={t('license.renew_title')}
        open={renewModalOpen}
        onCancel={() => { setRenewModalOpen(false); setRenewId(null); renewForm.resetFields(); }}
        footer={null}
        width={400}
      >
        <Form form={renewForm} layout="vertical" onFinish={handleRenew}>
          <Form.Item name="extra_days" label={t('license.renew_days')} initialValue={365} rules={[{ required: true }]}>
            <InputNumber min={1} max={3650} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={renewLoading} block>
              {t('app.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={t('license.license_key')}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={600}
      >
        {detail && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
            <Descriptions.Item label={t('license.type')}>{detail.type}</Descriptions.Item>
            <Descriptions.Item label={t('license.license_key')} span={2}>{detail.license_key}</Descriptions.Item>
            <Descriptions.Item label={t('license.subscriber')} span={2}>{detail.subscriber}</Descriptions.Item>
            <Descriptions.Item label={t('license.tier')}>{detail.tier}</Descriptions.Item>
            <Descriptions.Item label={t('license.max_devices')}>{detail.max_devices}</Descriptions.Item>
            <Descriptions.Item label={t('app.status')}>
              <Tag color={statusColorMap[detail.status]}>{detail.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('license.issued_at')}>
              {dayjs.unix(detail.issued_at).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label={t('license.expires_at')}>
              {dayjs.unix(detail.expires_at).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Machine ID" span={2}>{detail.machine_id || '-'}</Descriptions.Item>
            <Descriptions.Item label="Signature" span={2} style={{ wordBreak: 'break-all' }}>
              {detail.signature}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default LicensesPage;
