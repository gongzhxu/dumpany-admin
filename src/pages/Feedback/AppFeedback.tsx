import React, { useEffect, useState, useCallback } from 'react';
import { Table, Typography, Card, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

interface AppFeedback {
  id: number;
  objectKey: string;
  fileName: string;
  fileSize: number;
  appVersion: string;
  os: string;
  arch: string;
  licenseType: string;
  machineId: string;
  createdAt: string;
}

function fmtTime(v: string) {
  if (!v) return '-';
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

function fmtFileSize(bytes: number) {
  if (bytes === 0) return '-';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

const AppFeedbackPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<AppFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    setPage(p);
    try {
      const res: any = await request.get(`/feedback/app/list?page=${p}&pageSize=20`);
      if (res.data) {
        setData(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: t('app.os'), dataIndex: 'os', key: 'os', width: 140,
      render: (_v: any, r: AppFeedback) => `${r.os} / ${r.arch}`,
    },
    { title: t('app.version'), dataIndex: 'appVersion', key: 'appVersion', width: 80 },
    {
      title: t('app.licenseType'), dataIndex: 'licenseType', key: 'licenseType', width: 80,
      render: (v: string) => v ? <Tag color={v === 'paid' ? 'green' : 'orange'}>{v}</Tag> : '-',
    },
    { title: t('app.fileSize'), dataIndex: 'fileSize', key: 'fileSize', width: 80, render: (v: number) => fmtFileSize(v) },
    { title: t('app.fileName'), dataIndex: 'fileName', key: 'fileName', width: 200, ellipsis: true },
    { title: t('feedback.submittedAt'), dataIndex: 'createdAt', key: 'createdAt', width: 160, render: (v: string) => fmtTime(v) },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('feedback.title')} - {t('feedback.appFeedback')}</Title>
      </div>
      <Card>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ current: page, pageSize: 20, total, onChange: fetchData, showTotal: (n: number) => t('feedback.total', { count: n }) }}
          size="small"
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default AppFeedbackPage;
