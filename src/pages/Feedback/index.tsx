import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, message, Typography, Card, Tag, Tooltip, Input, Modal, Form } from 'antd';
import { CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import request from '../../api/request';

const { Title } = Typography;
const { TextArea } = Input;

interface FeedbackUserInfo {
  nickname: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface Feedback {
  id: number;
  userId: number;
  userInfo?: FeedbackUserInfo | null;
  content: string;
  imageUrls: string[];
  handled: boolean;
  handleResult: string;
  handledAt: string;
  createdAt: string;
}

function fmtTime(v: string) {
  if (!v) return '-';
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

function isVideo(url: string) {
  return /\.(mp4|mov|avi|mkv|webm)(\?|$)/i.test(url);
}

const FeedbackPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Mark handled modal
  const [markModalOpen, setMarkModalOpen] = useState(false);
  const [markId, setMarkId] = useState<number | null>(null);
  const [handleResult, setHandleResult] = useState('');
  const [marking, setMarking] = useState(false);

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    setPage(p);
    try {
      const params = `page=${p}&pageSize=20${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`;
      const res: any = await request.get(`/feedback/list?${params}`);
      if (res.data) {
        setData(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openMarkModal = (id: number) => {
    setMarkId(id);
    setHandleResult('');
    setMarkModalOpen(true);
  };

  const handleMarkSubmit = async () => {
    if (!handleResult.trim()) {
      message.error(t('feedback.handleResultRequired'));
      return;
    }
    if (markId === null) return;
    setMarking(true);
    try {
      await request.put(`/feedback/mark-handled/${markId}`, { handleResult: handleResult.trim() });
      message.success(t('feedback.marked'));
      setMarkModalOpen(false);
      fetchData(page);
    } catch (err: any) {
      message.error(err?.response?.data?.msg || err.message);
    } finally {
      setMarking(false);
    }
  };

  const userColumnRender = (_v: any, record: Feedback) => {
    const uid = record.userId;
    if (!uid) return <span>-</span>;
    const info = record.userInfo;
    if (!info) return <span>UID: {uid}</span>;
    const tooltipContent = (
      <div>
        <div>ID: {uid}</div>
        <div>{t('feedback.userName')}: {info.nickname}</div>
        <div>{t('feedback.email')}: {info.email || '-'}</div>
        <div>{t('feedback.phone')}: {info.phone || '-'}</div>
        <div>{t('feedback.regTime')}: {info.createdAt}</div>
      </div>
    );
    return (
      <Tooltip title={tooltipContent} color="#fff" overlayInnerStyle={{ color: '#333' }}>
        <span style={{ cursor: 'pointer', borderBottom: '1px dashed #999' }}>{info.nickname || `UID:${uid}`}</span>
      </Tooltip>
    );
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: t('feedback.userId'), dataIndex: 'userId', key: 'userId', width: 120,
      render: userColumnRender,
    },
    {
      title: t('feedback.content'), dataIndex: 'content', key: 'content', width: 350,
      render: (v: string) => <div style={{ maxWidth: 350, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{v}</div>,
    },
    {
      title: t('feedback.image'), dataIndex: 'imageUrls', key: 'imageUrls', width: 130,
      render: (v: string[]) => {
        if (!v || v.length === 0) return '-';
        return (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {v.map((url: string, i: number) =>
              isVideo(url) ? (
                <div key={i} onClick={() => { setPreviewUrls(v); setPreviewIndex(i) }}
                  style={{ width: 50, height: 50, borderRadius: 4, border: '1px solid #f0f0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', fontSize: 20 }}>▶</div>
              ) : (
                <img key={i} src={url} alt="" onClick={() => { setPreviewUrls(v); setPreviewIndex(i) }}
                  style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0', cursor: 'pointer' }} />
              )
            )}
          </div>
        );
      },
    },
    { title: t('feedback.submittedAt'), dataIndex: 'createdAt', key: 'createdAt', width: 160, render: (v: string) => fmtTime(v) },
    {
      title: t('feedback.status'), dataIndex: 'handled', key: 'handled', width: 70,
      render: (v: boolean) => v
        ? <Tag icon={<CheckCircleOutlined />} color="success">{t('feedback.handled')}</Tag>
        : <Tag color="warning">{t('feedback.pending')}</Tag>,
    },
    {
      title: t('feedback.handleResult'), dataIndex: 'handleResult', key: 'handleResult', width: 180,
      render: (v: string) => v ? <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{v}</div> : '-',
    },
    { title: t('feedback.handledAt'), dataIndex: 'handledAt', key: 'handledAt', width: 160, render: (v: string) => fmtTime(v) },
    {
      title: t('feedback.action'), key: 'action', width: 100,
      render: (_: any, record: Feedback) => (
        !record.handled && (
          <Button size="small" type="primary" onClick={() => openMarkModal(record.id)}>
            {t('feedback.markHandled')}
          </Button>
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
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <Input.Search
            placeholder={t('feedback.searchPlaceholder')}
            allowClear
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onSearch={() => fetchData(1)}
            onPressEnter={() => fetchData(1)}
            style={{ width: 300 }}
          />
        </div>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ current: page, pageSize: 20, total, onChange: fetchData, showTotal: (n: number) => t('feedback.total', { count: n }) }}
          size="small"
          scroll={{ x: 1100 }}
        />
      </Card>

      <Modal
        title={t('feedback.markHandled')}
        open={markModalOpen}
        onCancel={() => setMarkModalOpen(false)}
        onOk={handleMarkSubmit}
        confirmLoading={marking}
      >
        <Form layout="vertical">
          <Form.Item label={t('feedback.handleResult')} required>
            <TextArea rows={4} value={handleResult} onChange={e => setHandleResult(e.target.value)}
              placeholder={t('feedback.handleResultPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>

      {previewIndex >= 0 && previewUrls[previewIndex] && (
        <div onClick={() => setPreviewIndex(-1)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, cursor: 'zoom-out' }}>
          <span onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex > 0 ? previewIndex - 1 : previewUrls.length - 1); }}
            style={{ fontSize: 40, color: 'white', cursor: 'pointer', userSelect: 'none', padding: '0 8px', lineHeight: 1 }}>‹</span>
          {isVideo(previewUrls[previewIndex])
            ? <video src={previewUrls[previewIndex]} controls autoPlay style={{ maxWidth: '80vw', maxHeight: '90vh', borderRadius: 8 }} />
            : <img src={previewUrls[previewIndex]} alt="" style={{ maxWidth: '70vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} />
          }
          <span onClick={(e) => { e.stopPropagation(); setPreviewIndex(previewIndex < previewUrls.length - 1 ? previewIndex + 1 : 0); }}
            style={{ fontSize: 40, color: 'white', cursor: 'pointer', userSelect: 'none', padding: '0 8px', lineHeight: 1 }}>›</span>
          <span style={{ position: 'absolute', bottom: 16, color: 'white', fontSize: 14, background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: 12 }}>
            {previewIndex + 1} / {previewUrls.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
