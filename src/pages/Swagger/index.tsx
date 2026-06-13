import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import {
  Table, Button, Modal, Form, Input, message, Typography, Card, Space, Popconfirm,
} from 'antd';
import { PlusOutlined, LinkOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

interface Account {
  id: number;
  username: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

const SwaggerAccounts: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [swaggerUrl, setSwaggerUrl] = useState('https://api.dumpany.cn/swagger/');
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Account | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/settings/swagger-account/list');
      setData(res.data);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    request.get('/system-config/list').then((res: any) => {
      const cfg = (res.data || []).find((c: any) => c.configKey === 'swagger_url');
      if (cfg?.configValue) setSwaggerUrl(cfg.configValue);
    }).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Account) => {
    setEditRecord(record);
    form.setFieldsValue({ username: record.username, remark: record.remark });
    setModalOpen(true);
  };

  const handleSubmit = async (values: { username: string; password?: string; remark?: string }) => {
    setSubmitting(true);
    try {
      if (editRecord) {
        const body: any = { username: values.username, remark: values.remark || '' };
        if (values.password) body.password = values.password;
        await request.put('/settings/swagger-account/update', { swaggerAccountId: editRecord.id, ...body });
        message.success(t('swagger.update_success'));
      } else {
        await request.post('/settings/swagger-account/create', values);
        message.success(t('swagger.create_success'));
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message || t('swagger.save_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete('/settings/swagger-account/delete', { data: { swaggerAccountId: id } });
      message.success(t('swagger.delete_success'));
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: t('swagger.username'), dataIndex: 'username', key: 'username' },
    { title: t('swagger.remark'), dataIndex: 'remark', key: 'remark' },
    { title: t('swagger.created_at'), dataIndex: 'createdAt', key: 'createdAt', width: 170, render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-' },
    {
      title: t('swagger.updatedAt'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: t('app.action'),
      key: 'action',
      width: 160,
      render: (_: any, record: Account) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>{t('app.edit')}</Button>
          <Popconfirm
            title={t('swagger.delete_confirm')}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" color="danger" variant="outlined">{t('app.delete')}</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}><img src="/swagger-icon.svg" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: -3 }} alt="" />{t('swagger.swagger_title')}</Title>
        <Space>
          <Button icon={<LinkOutlined />} onClick={() => window.open(swaggerUrl, '_blank')}>
            {t('swagger.swagger_open')}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {t('swagger.add_account')}
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>

      <Modal
        title={editRecord ? t('swagger.edit_title') : t('swagger.add_title')}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
        width={450}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="username"
            label={t('swagger.username')}
            rules={[{ required: true, min: 2, message: t('swagger.username_required') }]}
          >
            <Input placeholder={t('swagger.username_placeholder')} />
          </Form.Item>

          <Form.Item
            name="password"
            label={editRecord ? t('swagger.password_optional') : t('swagger.password')}
            rules={editRecord ? [] : [{ required: true, min: 6, message: t('swagger.password_rule') }]}
          >
            <Input.Password placeholder={t('swagger.password_placeholder')} />
          </Form.Item>

          <Form.Item name="remark" label={t('swagger.remark')}>
            <Input placeholder={t('swagger.remark_placeholder')} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              {t('app.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SwaggerAccounts;
