import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, message, Typography, Card, Tag, Popconfirm } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;

interface Feedback {
  id: number;
  userId: number;
  content: string;
  imageUrls: string;
  handled: boolean;
  handledAt: string;
  createdAt: string;
}

const FeedbackPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [marking, setMarking] = useState<number | null>(null);

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    setPage(p);
    try {
      const res: any = await request.get(`/feedback/list?page=${p}&pageSize=20`);
      if (res.data) {
        setData(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMarkHandled = async (id: number) => {
    setMarking(id);
    try {
      await request.put(`/feedback/mark-handled/${id}`);
      message.success(t('feedback.marked'));
      fetchData(page);
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    } finally {
      setMarking(null);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: t('feedback.userId'), dataIndex: 'userId', key: 'userId', width: 80, render: (v: number) => v || '-' },
    {
      title: t('feedback.content'), dataIndex: 'content', key: 'content', width: 400,
      render: (v: string) => <div style={{ maxWidth: 400, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{v}</div>,
    },
    {
      title: t('feedback.image'), dataIndex: 'imageUrls', key: 'imageUrls', width: 100,
      render: (v: string) => {
        if (!v || v === '[]' || v === 'null') return '-';
        try {
          const urls = JSON.parse(v);
          if (!urls || urls.length === 0) return '-';
          return urls.map((url: string, i: number) => (
            <a key={i} href={url} target="_blank" rel="noreferrer" style={{ marginRight: 4 }}>{t('feedback.image')}{i + 1}</a>
          ));
        } catch { return '-'; }
      },
    },
    {
      title: t('feedback.status'), dataIndex: 'handled', key: 'handled', width: 80,
      render: (v: boolean) => v
        ? <Tag icon={<CheckCircleOutlined />} color="success">{t('feedback.handled')}</Tag>
        : <Tag color="warning">{t('feedback.pending')}</Tag>,
    },
    { title: t('feedback.submittedAt'), dataIndex: 'createdAt', key: 'createdAt', width: 160 },
    {
      title: t('feedback.action'), key: 'action', width: 100,
      render: (_: any, record: Feedback) => (
        !record.handled && (
          <Popconfirm title={t('feedback.markHandledConfirm')} onConfirm={() => handleMarkHandled(record.id)}>
            <Button size="small" type="primary" loading={marking === record.id}>{t('feedback.markHandled')}</Button>
          </Popconfirm>
        )
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>{t('feedback.title')}</Title>
      </div>
      <Card>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ current: page, pageSize: 20, total, onChange: fetchData, showTotal: (n: number) => `${t('feedback.total')} ${n}` }}
          size="small"
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default FeedbackPage;
