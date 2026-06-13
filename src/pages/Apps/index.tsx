import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Card, Typography, message, Popconfirm, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

interface App {
  appId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const AppsPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<App[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<App | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get('/app/list');
      setData(res.data || []);
    } catch (err: any) {
      message.error(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: App) => {
    setEditRecord(record);
    form.setFieldsValue({ appId: record.appId, name: record.name, description: record.description });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editRecord) {
        await request.put('/app/update', { appId: editRecord.appId, ...values });
        message.success(t('apps.update_success'));
      } else {
        await request.post('/app/create', values);
        message.success(t('apps.create_success'));
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.msg || t('apps.save_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await request.delete('/app/delete', { data: { appId: id } });
      message.success(t('apps.delete_success'));
      fetchData();
    } catch (err: any) {
      message.error(err.response?.data?.msg || t('apps.save_failed'));
    }
  };

  const columns = [
    { title: t('apps.appId'), dataIndex: 'appId', key: 'appId', width: 120 },
    { title: t('apps.name'), dataIndex: 'name', key: 'name', width: 200 },
    { title: t('apps.description'), dataIndex: 'description', key: 'description', ellipsis: true },
    { title: t('apps.createdAt'), dataIndex: 'createdAt', key: 'createdAt', width: 180 },
    {
      title: t('app.action'),
      key: 'action',
      width: 150,
      render: (_: any, record: App) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            {t('app.edit')}
          </Button>
          <Popconfirm
            title={record.appId === 'dumpany' ? t('apps.cannot_delete_default') : t('apps.delete_confirm')}
            onConfirm={() => handleDelete(record.appId)}
            disabled={record.appId === 'dumpany'}
          >
            <Button type="link" size="small" danger disabled={record.appId === 'dumpany'}>
              {t('app.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Typography.Title level={4}>{t('apps.title')}</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('apps.add_app')}
        </Button>
      </div>
      <Card>
        <Table columns={columns} dataSource={data} rowKey="appId" loading={loading} pagination={false} />
      </Card>
      <Modal
        title={editRecord ? t('apps.edit_title') : t('apps.add_title')}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          {!editRecord && (
            <Form.Item name="appId" label={t('apps.appId')} rules={[{ required: true, message: 'App ID is required' }]}>
              <Input placeholder="e.g. my-app" />
            </Form.Item>
          )}
          <Form.Item name="name" label={t('apps.name')} rules={[{ required: true, message: 'App name is required' }]}>
            <Input placeholder={t('apps.name_placeholder')} />
          </Form.Item>
          <Form.Item name="description" label={t('apps.description')}>
            <Input.TextArea placeholder={t('apps.description_placeholder')} rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AppsPage;
