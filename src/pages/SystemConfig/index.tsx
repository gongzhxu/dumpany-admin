import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Modal, Input, InputNumber, Switch, message, Typography, Card, Tag,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ConfigItem | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editLoading, setEditLoading] = useState(false);

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

  const openEdit = (record: ConfigItem) => {
    setEditRecord(record);
    setEditValue(record.configValue);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editRecord) return;
    setEditLoading(true);
    try {
      await request.put('/system-config/update', { configKey: editRecord.configKey, configValue: editValue });
      message.success('配置已更新');
      setEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const typeColor: Record<string, string> = {
    string: 'blue',
    int: 'purple',
    bool: 'orange',
    json: 'geekblue',
  };

  const columns = [
    { title: t('system_config.config_key'), dataIndex: 'configKey', key: 'configKey', width: 220 },
    {
      title: t('system_config.config_value'),
      dataIndex: 'configValue',
      key: 'configValue',
      ellipsis: true,
      render: (text: string) => (
        <Typography.Paragraph copyable ellipsis={{ rows: 1 }} style={{ margin: 0, maxWidth: 300 }}>
          {text}
        </Typography.Paragraph>
      ),
    },
    {
      title: t('system_config.config_type'),
      dataIndex: 'configType',
      key: 'configType',
      width: 100,
      render: (text: string) => <Tag color={typeColor[text] || 'default'}>{text}</Tag>,
    },
    { title: t('system_config.description'), dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: t('system_config.cache_ttl'),
      dataIndex: 'cacheTTL',
      key: 'cacheTTL',
      width: 120,
      render: (val: number) => (val === 0 ? t('system_config.no_cache') : `${val}s`),
    },
    {
      title: t('app.status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (val: number) => (
        <Tag color={val === 1 ? 'green' : 'red'}>
          {val === 1 ? t('app.active') : t('app.disabled')}
        </Tag>
      ),
    },
    {
      title: t('app.action'),
      key: 'action',
      width: 80,
      render: (_: any, record: ConfigItem) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
          {t('app.edit')}
        </Button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('system_config.title')}</Title>
      </div>

      <Card>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="configKey"
          loading={loading}
          pagination={false}
          size="small"
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={t('system_config.edit_title')}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEditSubmit}
        confirmLoading={editLoading}
        destroyOnClose
      >
        {editRecord && (
          <div>
            <p><strong>{editRecord.configKey}</strong></p>
            <p style={{ color: '#888', fontSize: 13 }}>{editRecord.description}</p>
            {editRecord.configType === 'int' ? (
              <InputNumber
                style={{ width: '100%' }}
                value={parseInt(editValue) || 0}
                onChange={(v) => setEditValue(String(v))}
              />
            ) : editRecord.configType === 'bool' ? (
              <Switch
                checked={editValue === '1'}
                onChange={(v) => setEditValue(v ? '1' : '0')}
              />
            ) : (
              <Input.TextArea
                rows={3}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SystemConfigPage;
