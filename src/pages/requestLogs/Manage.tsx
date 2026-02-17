import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable, ProCard } from '@ant-design/pro-components';
import { Button, message, Space, Tag, Statistic, Row, Col, Tooltip } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import {
  getRequestLogs,
  getRequestLogsStats,
  cleanupRequestLogs,
  type RequestLogItem,
} from '@/services/requestLogs';

const RequestLogsManage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    try {
      const response = await getRequestLogsStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('获取统计失败:', error);
    }
  };

  const columns: ProColumns<RequestLogItem>[] = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      width: 180,
      search: false,
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '方法',
      dataIndex: 'method',
      width: 80,
      valueType: 'select',
      valueEnum: {
        GET: { text: 'GET', status: 'Success' },
        POST: { text: 'POST', status: 'Processing' },
        PUT: { text: 'PUT', status: 'Warning' },
        DELETE: { text: 'DELETE', status: 'Error' },
      },
      render: (_, record) => {
        const colorMap: Record<string, string> = {
          GET: 'green',
          POST: 'blue',
          PUT: 'orange',
          DELETE: 'red',
        };
        return <Tag color={colorMap[record.method] || 'default'}>{record.method}</Tag>;
      },
    },
    {
      title: '路径',
      dataIndex: 'path',
      width: 300,
      ellipsis: true,
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      width: 100,
      valueType: 'select',
      valueEnum: {
        200: { text: '200 OK' },
        201: { text: '201 Created' },
        204: { text: '204 No Content' },
        400: { text: '400 Bad Request' },
        401: { text: '401 Unauthorized' },
        403: { text: '403 Forbidden' },
        404: { text: '404 Not Found' },
        500: { text: '500 Server Error' },
      },
      render: (_, record) => {
        const statusCode = record.statusCode;
        let color = 'default';
        if (statusCode >= 200 && statusCode < 300) color = 'success';
        else if (statusCode >= 300 && statusCode < 400) color = 'warning';
        else if (statusCode >= 400 && statusCode < 500) color = 'error';
        else if (statusCode >= 500) color = 'error';
        return <Tag color={color}>{statusCode}</Tag>;
      },
    },
    {
      title: '响应时间(ms)',
      dataIndex: 'responseTime',
      width: 120,
      search: false,
      render: (_, record) => {
        const time = record.responseTime || 0;
        let color = 'default';
        if (time < 100) color = 'success';
        else if (time < 500) color = 'warning';
        else color = 'error';
        return <Tag color={color}>{time}</Tag>;
      },
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      width: 140,
      search: false,
    },
    {
      title: '用户',
      dataIndex: 'username',
      width: 120,
      search: false,
      render: (_, record) => record.username || '-',
    },
    {
      title: 'User Agent',
      dataIndex: 'userAgent',
      width: 200,
      search: false,
      ellipsis: true,
      render: (_, record) => {
        const ua = record.userAgent || '-';
        if (ua === '-') return '-';

        let browser = '';
        let os = '';

        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        else if (ua.includes('MicroMessenger')) browser = '微信';

        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac OS X')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

        const parts = [browser, os].filter(Boolean);
        const shortUa = parts.length > 0 ? parts.join(' / ') : ua.substring(0, 50);

        return (
          <Tooltip title={ua}>
            <span style={{ cursor: 'help' }}>{shortUa}</span>
          </Tooltip>
        );
      },
    },
  ];

  const handleCleanup = async () => {
    try {
      const response = await cleanupRequestLogs(30);
      if (response.success) {
        message.success(response.message || '清理成功');
        actionRef.current?.reload();
        fetchStats();
      }
    } catch (error: any) {
      let errorMsg = '清理失败';
      if (error?.data?.error) {
        errorMsg = error.data.error;
      } else if (error?.error) {
        errorMsg = error.error;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      message.error(errorMsg);
    }
  };

  return (
    <PageContainer>
      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <ProCard>
              <Statistic title="总请求数" value={stats.totalRequests || 0} />
            </ProCard>
          </Col>
          <Col span={6}>
            <ProCard>
              <Statistic title="平均响应时间(ms)" value={stats.avgResponseTime || 0} precision={2} />
            </ProCard>
          </Col>
          <Col span={12}>
            <ProCard>
              <Space size="large">
                <div>
                  <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>状态码分布</div>
                  <Space wrap>
                    {Object.entries(stats.statusCodeCounts || {}).map(([code, count]) => (
                      <Tag key={code} color={parseInt(code) >= 500 ? 'red' : parseInt(code) >= 400 ? 'orange' : 'green'}>
                        {code}: {count}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </Space>
            </ProCard>
          </Col>
        </Row>
      )}
      <ProTable<RequestLogItem>
        headerTitle="访问日志"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button key="stats" icon={<ReloadOutlined />} onClick={fetchStats}>
            刷新统计
          </Button>,
          <Button key="cleanup" danger icon={<DeleteOutlined />} onClick={handleCleanup}>
            清理旧日志
          </Button>,
        ]}
        request={async (params) => {
          const response = await getRequestLogs({
            page: params.current,
            pageSize: params.pageSize,
            method: params.method,
            path: params.path,
            statusCode: params.statusCode,
            startDate: params.startDate ? params.startDate + ' 00:00:00' : undefined,
            endDate: params.endDate ? params.endDate + ' 23:59:59' : undefined,
          });
          return {
            data: response.logs || [],
            success: response.success,
            total: response.total || 0,
          };
        }}
        columns={columns}
        scroll={{ x: 1200 }}
        pagination={{
          defaultPageSize: 50,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </PageContainer>
  );
};

export default RequestLogsManage;
