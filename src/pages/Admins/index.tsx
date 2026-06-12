import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, message, Tag, Popconfirm, Typography, Card,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

interface Admin {
  id: number;
  username: string;
  nickname: string;
  status: number;
  created_at: string;
}

const AdminsPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/admins');
      setData(res.data);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (values: { username: string; password: string; nickname: string }) => {
    setCreateLoading(true);
    try {
      await request.post('/admins', values);
      message.success('Admin created');
      setModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleDisable = async (id: number) => {
    try {
      await request.put(`/admins/${id}/disable`);
      message.success('Status updated');
      fetchData();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: t('app.username'), dataIndex: 'username', key: 'username' },
    { title: t('admin.nickname'), dataIndex: 'nickname', key: 'nickname' },
    {
      title: t('app.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val: number) => (
        <Tag color={val === 1 ? 'green' : 'red'}>
          {val === 1 ? t('admin.enabled') : t('admin.disabled')}
        </Tag>
      ),
    },
    {
      title: t('app.action'),
      key: 'action',
      width: 120,
      render: (_: any, record: Admin) => (
        <Popconfirm
          title={t('admin.disable_confirm')}
          onConfirm={() => handleToggleDisable(record.id)}
        >
          <a style={{ color: record.status === 1 ? 'red' : 'green' }}>
            {record.status === 1 ? t('admin.disabled') : t('admin.enabled')}
          </a>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('admin.title')}</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          {t('admin.add_admin')}
        </Button>
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
        title={t('admin.add_title')}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        footer={null}
        width={450}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="username"
            label={t('app.username')}
            rules={[{ required: true, min: 3, max: 64 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('app.password')}
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item name="nickname" label={t('admin.nickname')}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createLoading} block>
              {t('app.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminsPage;
