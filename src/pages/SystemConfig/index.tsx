import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Switch, message, Typography, Card, Tag, Space, Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;
const { TextArea } = Input;

interface ConfigItem {
  configKey: string;
  configValue: string;
  configType: string;
  description: string;
  cacheTTL: number;
  status: number;
  updatedAt: string;
}

const SystemConfigPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ConfigItem | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/system-config/list');
      setData(res.data || []);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({ configType: 'string', cacheTTL: 0, status: 1 });
    setModalOpen(true);
  };

  const openEdit = (record: ConfigItem) => {
    setEditRecord(record);
    form.setFieldsValue({
      configKey: record.configKey,
      configValue: record.configValue,
      configType: record.configType,
      description: record.description,
      cacheTTL: record.cacheTTL,
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    setEditLoading(true);
    try {
      if (editRecord) {
        await request.put('/system-config/update', values);
        message.success(t('common.saved'));
      } else {
        await request.post('/system-config/create', values);
        message.success(t('common.saved'));
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await request.delete('/system-config/delete', { data: { configKey: key } });
      message.success('已删除');
      fetchData();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleToggleStatus = async (record: ConfigItem) => {
    try {
      await request.put('/system-config/update', {
        configKey: record.configKey,
        configValue: record.configValue,
        configType: record.configType,
        description: record.description,
        cacheTTL: record.cacheTTL,
        status: record.status === 1 ? 0 : 1,
      });
      fetchData();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const typeColor: Record<string, string> = {
    string: 'blue', int: 'purple', bool: 'orange', json: 'geekblue',
  };

  const columns = [
    { title: t('system_config.config_key'), dataIndex: 'configKey', key: 'configKey', width: 220 },
    {
      title: t('system_config.config_value'), dataIndex: 'configValue', key: 'configValue',
      ellipsis: true,
      render: (text: string) => (
        <Typography.Paragraph copyable ellipsis={{ rows: 1 }} style={{ margin: 0, maxWidth: 300 }}>
          {text}
        </Typography.Paragraph>
      ),
    },
    {
      title: t('system_config.config_type'), dataIndex: 'configType', key: 'configType', width: 80,
      render: (text: string) => <Tag color={typeColor[text] || 'default'}>{text}</Tag>,
    },
    { title: t('system_config.description'), dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: t('system_config.cache_ttl'), dataIndex: 'cacheTTL', key: 'cacheTTL', width: 100,
      render: (val: number) => (val === 0 ? t('system_config.no_cache') : `${val}s`),
    },
    {
      title: t('app.status'), dataIndex: 'status', key: 'status', width: 80,
      render: (val: number, record: ConfigItem) => (
        <Switch checked={val === 1} size="small" onChange={() => handleToggleStatus(record)}
          checkedChildren={t('app.active')} unCheckedChildren={t('app.disabled')} />
      ),
    },
    {
      title: t('app.action'), key: 'action', width: 120,
      render: (_: any, record: ConfigItem) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>{t('app.edit')}</Button>
          <Popconfirm title="确认删除此配置？" onConfirm={() => handleDelete(record.configKey)}>
            <Button size="small" color="danger" variant="outlined" icon={<DeleteOutlined />}>{t('app.delete')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('system_config.title')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>{t('app.create')}</Button>
      </div>
      <Card>
        <Table dataSource={data} columns={columns} rowKey="configKey" loading={loading} pagination={false} size="small" scroll={{ x: 1100 }} />
      </Card>
      <Modal title={editRecord ? t('system_config.edit_title') : '新增配置'} open={modalOpen}
        onCancel={() => setModalOpen(false)} footer={null} width={560} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="configKey" label={t('system_config.config_key')} rules={[{ required: true }]}>
            <Input disabled={!!editRecord} />
          </Form.Item>
          <Form.Item name="configValue" label={t('system_config.config_value')} rules={[{ required: true }]}>
            <TextArea rows={3} />
          </Form.Item>
          <Space size={16}>
            <Form.Item name="configType" label={t('system_config.config_type')}>
              <Select style={{ width: 120 }}>
                <Select.Option value="string">string</Select.Option>
                <Select.Option value="int">int</Select.Option>
                <Select.Option value="bool">bool</Select.Option>
                <Select.Option value="json">json</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="cacheTTL" label={t('system_config.cache_ttl')}>
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="status" label={t('app.status')}>
              <Select style={{ width: 100 }}>
                <Select.Option value={1}>{t('app.active')}</Select.Option>
                <Select.Option value={0}>{t('app.disabled')}</Select.Option>
              </Select>
            </Form.Item>
          </Space>
          <Form.Item name="description" label={t('system_config.description')}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={editLoading} block>{t('common.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemConfigPage;
