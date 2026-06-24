import type { License, Quota } from "../../api/licenses";
import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, Button, Input,  message,
  Tag, Popconfirm, Typography, Card,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import licenseApi from '../../api/licenses';

const { Title } = Typography;

const LicensePage: React.FC = () => {
  const { t } = useTranslation();
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await licenseApi.quotaList({});
      setQuotas(res.data || []);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRevoke = async (key: string) => {
    try {
      await licenseApi.revoke(key);
      message.success(t('license.revoke'));
      fetchData();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const statusTag = (status: number) => {
    if (status === 0) return <Tag color="red">{t('app.disabled')}</Tag>;
    return <Tag color="green">{t('app.enabled')}</Tag>;
  };

  const licenseColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: t('license.licenseKey'),
      dataIndex: 'licenseKey',
      key: 'licenseKey',
      ellipsis: true,
      width: 280,
      render: (text: string) => <code style={{ fontSize: 12 }}>{text}</code>,
    },
    {
      title: t('license.subscriber'),
      dataIndex: 'subscriber',
      key: 'subscriber',
      width: 160,
    },
    {
      title: t('license.tier'),
      dataIndex: 'tier',
      key: 'tier',
      width: 100,
      render: (text: string) => t(`license.${text}`),
    },
    {
      title: t('license.maxDevices'),
      key: 'devices',
      width: 120,
      render: (_: any, r: License) => `${r.usedDevices}/${r.maxDevices}`,
    },
    {
      title: t('license.issuedAt'),
      dataIndex: 'issuedAt',
      key: 'issuedAt',
      width: 150,
      render: (val: number) => dayjs.unix(val).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('license.expiresAt'),
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 150,
      render: (val: number) => (val ? dayjs.unix(val).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: t('app.status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (val: number) => statusTag(val),
    },
    {
      title: t('app.action'),
      key: 'action',
      width: 100,
      render: (_: any, record: License) => (
        record.status === 1 ? (
          <Popconfirm
            title={t('license.revoke_confirm')}
            onConfirm={() => handleRevoke(record.licenseKey)}
          >
            <Button size="small" color="danger" variant="outlined">
              {t('license.revoke')}
            </Button>
          </Popconfirm>
        ) : null
      ),
    },
  ];

  const quotaColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: t('app.userId'),
      dataIndex: 'userId',
      key: 'userId',
      width: 80,
    },
    {
      title: t('license.tier'),
      dataIndex: 'tier',
      key: 'tier',
      width: 100,
      render: (text: string) => t(`license.${text}`),
    },
    {
      title: t('license.quota'),
      key: 'quota',
      width: 130,
      render: (_: any, r: Quota) => `${r.usedQuota}/${r.totalQuota}`,
    },
    {
      title: t('license.expiresAt'),
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 150,
      render: (val: number) => (val ? dayjs.unix(val).format('YYYY-MM-DD HH:mm') : '∞'),
    },
    {
      title: t('app.status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (val: number) => statusTag(val),
    },
    {
      title: t('app.created_at'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (val: number) => (val ? dayjs.unix(val).format('YYYY-MM-DD HH:mm') : '-'),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('license.title')}</Title>
      </div>

      <Card>
        <div className="table-toolbar">
          <div className="toolbar-left">
            <Input
              placeholder={t('license.licenseKey')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
              allowClear
            />
            <Button icon={<ReloadOutlined />} onClick={fetchData} />
          </div>
        </div>

        <Table
          dataSource={quotas}
          columns={quotaColumns}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 900 }}
          size="small"
          expandable={{
            expandedRowRender: (record: Quota) => (
              <Table
                dataSource={record.licenses || []}
                columns={licenseColumns}
                rowKey="id"
                size="small"
                pagination={false}
                scroll={{ x: 1100 }}
              />
            ),
            rowExpandable: () => true,
          }}
        />
      </Card>
    </div>
  );
};

export default LicensePage;
