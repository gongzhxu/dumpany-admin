import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, message, Typography, Card, Space, Tag, Popconfirm } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
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
      message.success('已标记为已处理');
      fetchData(page);
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    } finally {
      setMarking(null);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 80, render: (v: number) => v || '-' },
    {
      title: '反馈内容', dataIndex: 'content', key: 'content', width: 400,
      render: (v: string) => <div style={{ maxWidth: 400, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{v}</div>,
    },
    {
      title: '截图', dataIndex: 'imageUrls', key: 'imageUrls', width: 100,
      render: (v: string) => {
        if (!v || v === '[]' || v === 'null') return '-';
        try {
          const urls = JSON.parse(v);
          if (!urls || urls.length === 0) return '-';
          return urls.map((url: string, i: number) => (
            <a key={i} href={url} target="_blank" rel="noreferrer" style={{ marginRight: 4 }}>截图{i + 1}</a>
          ));
        } catch { return '-'; }
      },
    },
    {
      title: '状态', dataIndex: 'handled', key: 'handled', width: 80,
      render: (v: boolean) => v
        ? <Tag icon={<CheckCircleOutlined />} color="success">已处理</Tag>
        : <Tag color="warning">待处理</Tag>,
    },
    { title: '提交时间', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
    {
      title: '操作', key: 'action', width: 100,
      render: (_: any, record: Feedback) => (
        <Space>
          {!record.handled && (
            <Popconfirm title="标记为已处理？" onConfirm={() => handleMarkHandled(record.id)}>
              <Button size="small" type="primary" loading={marking === record.id}>
                标记已处理
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={4}>用户反馈</Title>
      </div>

      <Card>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            onChange: fetchData,
            showTotal: (t: number) => `共 ${t} 条`,
          }}
          size="small"
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default FeedbackPage;
