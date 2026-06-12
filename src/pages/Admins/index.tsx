import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, message, Tag, Popconfirm, Typography, Card, Space,
} from 'antd';
import { PlusOutlined, LockOutlined, EditOutlined } from '@ant-design/icons';
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
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdAdminId, setPwdAdminId] = useState<number>(0);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Admin | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [editForm] = Form.useForm();

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

  const handleEdit = async (values: { nickname: string }) => {
    if (!editRecord) return;
    setEditLoading(true);
    try {
      await request.put(`/admins/${editRecord.id}`, values);
      message.success(t('admin.edit_success'));
      setEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (values: { password: string }) => {
    setPwdLoading(true);
    try {
      await request.put(`/admins/${pwdAdminId}`, values);
      message.success('Password updated');
      setPwdModalOpen(false);
      pwdForm.resetFields();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setPwdLoading(false);
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
      width: 240,
      render: (_: any, record: Admin) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => { setEditRecord(record); editForm.setFieldsValue({ nickname: record.nickname }); setEditModalOpen(true); }}
          >
            {t('app.edit')}
          </Button>
          <Popconfirm
            title={t('admin.disable_confirm')}
            onConfirm={() => handleToggleDisable(record.id)}
          >
            <Button size="small" color={record.status === 1 ? 'danger' : 'primary'} variant="outlined">
              {record.status === 1 ? t('admin.disable_btn') : t('admin.enable_btn')}
            </Button>
          </Popconfirm>
          <Button
            size="small"
            icon={<LockOutlined />}
            onClick={() => { setPwdAdminId(record.id); setPwdModalOpen(true); }}
          >
            {t('admin.change_password')}
          </Button>
        </Space>
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

      <Modal
        title={t('admin.change_password_title')}
        open={pwdModalOpen}
        onCancel={() => { setPwdModalOpen(false); pwdForm.resetFields(); }}
        footer={null}
        width={400}
      >
        <Form form={pwdForm} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            name="password"
            label={t('admin.new_password')}
            rules={[{ required: true, min: 6, message: t('admin.password_rule') }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={pwdLoading} block>
              {t('app.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('admin.edit_title')}
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields(); }}
        footer={null}
        width={400}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="nickname" label={t('admin.nickname')}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={editLoading} block>
              {t('app.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminsPage;
