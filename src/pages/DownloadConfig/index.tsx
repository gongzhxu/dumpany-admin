import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Typography, Card, Space, Popconfirm, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

interface DownloadConfig {
  id: number;
  platform: string;
  label: string;
  arch: string;
  version: string;
  url: string;
  enabled: boolean;
  createdAt: string;
}

const PLATFORMS = [
  { value: 'macos_apple', label: 'macOS (Apple Silicon)' },
  { value: 'macos_intel', label: 'macOS (Intel)' },
  { value: 'windows', label: 'Windows' },
  { value: 'linux', label: 'Linux' },
];

const ARCHES = ['ARM64', 'x64', 'x86_64', 'i386'];

const DownloadConfigPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<DownloadConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DownloadConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res: any = await request.get(`/download-config/list?page=${p}&pageSize=${pageSize}`);
      if (res.data) {
        setData(res.data.list || []);
        setTotal(res.data.total || 0);
        setPage(p);
      }
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
    setModalOpen(true);
  };

  const openEdit = (record: DownloadConfig) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await request.post('/download-config/save', { ...values, id: editing?.id || 0 });
      message.success(t('downloadConfig.saved'));
      setModalOpen(false);
      fetchData(page);
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/download-config/delete/${id}`);
      message.success(t('downloadConfig.deleted'));
      fetchData(page);
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    }
  };

  const columns = [
    { title: t('downloadConfig.platform'), dataIndex: 'label', key: 'label', width: 180 },
    { title: t('downloadConfig.platformId'), dataIndex: 'platform', key: 'platform', width: 130 },
    { title: t('downloadConfig.arch'), dataIndex: 'arch', key: 'arch', width: 80 },
    { title: t('downloadConfig.version'), dataIndex: 'version', key: 'version', width: 100 },
    {
      title: t('downloadConfig.url'), dataIndex: 'url', key: 'url', ellipsis: true,
      render: (v: string) => <Typography.Text copyable style={{ maxWidth: 280, display: 'inline-block' }} ellipsis>{v}</Typography.Text>,
    },
    {
      title: t('downloadConfig.status'), dataIndex: 'enabled', key: 'enabled', width: 70,
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? t('downloadConfig.enabled') : t('downloadConfig.disabled')}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: any, record: DownloadConfig) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>{t('downloadConfig.edit')}</Button>
          <Popconfirm title={t('downloadConfig.deleteConfirm')} onConfirm={() => handleDelete(record.id)}>
            <Button size="small" color="danger" variant="outlined">{t('downloadConfig.delete')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('downloadConfig.title')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('downloadConfig.add')}</Button>
      </div>

      <Card>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ current: page, pageSize, total, onChange: fetchData, showTotal: (n: number) => `${t('downloadConfig.total')} ${n}` }}
          size="small"
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal title={editing ? t('downloadConfig.editModal') : t('downloadConfig.addModal')} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={560} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="platform" label={t('downloadConfig.platform')} rules={[{ required: true }]}>
            <Select placeholder={t('downloadConfig.selectPlatform')}>
              {PLATFORMS.map(p => <Select.Option key={p.value} value={p.value}>{p.label}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="label" label={t('downloadConfig.label')} rules={[{ required: true }]}>
            <Input placeholder="macOS (Apple Silicon)" />
          </Form.Item>
          <Form.Item name="arch" label={t('downloadConfig.arch')}>
            <Select placeholder={t('downloadConfig.selectArch')} allowClear>
              {ARCHES.map(a => <Select.Option key={a} value={a}>{a}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="version" label={t('downloadConfig.versionLabel')} rules={[{ required: true }]}>
            <Input placeholder="1.2.0" />
          </Form.Item>
          <Form.Item name="url" label={t('downloadConfig.urlLabel')} rules={[{ required: true }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="enabled" label={t('downloadConfig.enabledLabel')} valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>{t('downloadConfig.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DownloadConfigPage;
