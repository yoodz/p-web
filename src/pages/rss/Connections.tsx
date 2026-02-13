import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, message, Modal, Popconfirm, Select, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import { getRSSList, addRSS, updateRSS, deleteRSS, type RSSItem } from '@/services/rss';

const { TextArea } = Input;

const Connections: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RSSItem | null>(null);
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();

  const columns: ProColumns<RSSItem>[] = [
    {
      title: '标题',
      dataIndex: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'RSS 地址',
      dataIndex: 'rssUrl',
      width: 300,
      copyable: true,
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
    },
    {
      title: '审核状态',
      dataIndex: 'auditStatus',
      width: 120,
      valueType: 'select',
      valueEnum: {
        0: { text: '未审核', status: 'Default' },
        1: { text: '已通过', status: 'Success' },
      },
      render: (_, record) => (
        <Tag color={record.auditStatus === 1 ? 'green' : 'default'}>
          {record.auditStatus === 1 ? '已通过' : '未审核'}
        </Tag>
      ),
    },
    {
      title: '更新失败次数',
      dataIndex: 'errorCount',
      width: 130,
      search: false,
      sorter: true,
      render: (_, record) => {
        const count = record.errorCount || 0;
        return count > 0 ? <Tag color="red">{count}</Tag> : <Tag color="green">{count}</Tag>;
      },
    },
    {
      title: '最后更新时间',
      dataIndex: 'lastUpdateAt',
      width: 180,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '创建时间',
      dataIndex: 'createAt',
      width: 180,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => handleEdit(record)}
        >
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除"
          description="确定要删除这条RSS连接吗？"
          onConfirm={() => handleDelete(record._id)}
          okText="确定"
          cancelText="取消"
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  const handleEdit = (record: RSSItem) => {
    setEditingRecord(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      auditStatus: record.auditStatus,
    });
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRSS(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error: any) {
      let errorMsg = '删除失败';
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        // 编辑模式：可以更新 title, description, auditStatus
        await updateRSS(editingRecord._id, {
          title: values.title,
          description: values.description,
          auditStatus: values.auditStatus,
        });
        message.success('更新成功');
      } else {
        // 新增模式：只需要 rssUrl
        await addRSS({ rssUrl: values.rssUrl, title: values.title });
        if (values.rssUrl) {
          message.success('添加成功，正在抓取RSS内容...');
        } else {
          message.success('添加成功');
        }
      }
      setIsModalVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error: any) {
      // 提取错误信息并显示
      let errorMsg = editingRecord ? '更新失败' : '添加失败';
      if (error?.data?.error) {
        errorMsg = error.data.error;
      } else if (error?.error) {
        errorMsg = error.error;
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      message.error(errorMsg);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <PageContainer>
      <ProTable<RSSItem>
        headerTitle="RSS 连接管理"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={handleAdd}
          >
            <PlusOutlined /> 添加 RSS
          </Button>,
        ]}
        request={async (params, sort) => {
          const response = await getRSSList({
            page: params.current,
            pageSize: params.pageSize,
            auditStatus: params.auditStatus,
            title: params.title,
            rssUrl: params.rssUrl,
            deleted: 0, // 默认只显示未删除的
            sortField: Object.keys(sort || {})[0],
            sortOrder: Object.values(sort || {})[0],
          });
          return {
            data: response.data || [],
            success: response.success,
            total: response.pagination?.total || 0,
          };
        }}
        columns={columns}
        scroll={{ x: 1700 }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />

      <Modal
        title={editingRecord ? '编辑 RSS' : '添加 RSS'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          {!editingRecord ? (
            // 新增模式：输入标题和 RSS 地址
            <>
              <Form.Item
                label="标题"
                name="title"
              >
                <Input placeholder="请输入标题（可选）" />
              </Form.Item>
              <Form.Item
                label="RSS 地址"
                name="rssUrl"
                rules={[
                  { required: true, message: '请输入RSS地址' },
                  { type: 'url', message: '请输入有效的URL' },
                ]}
              >
                <Input placeholder="请输入RSS地址，如：https://example.com/rss" />
              </Form.Item>
            </>
          ) : (
            // 编辑模式：可以编辑标题、描述、审核状态
            <>
              <Form.Item
                label="标题"
                name="title"
              >
                <Input placeholder="请输入标题" />
              </Form.Item>
              <Form.Item
                label="描述"
                name="description"
              >
                <TextArea rows={3} placeholder="请输入描述（可选）" />
              </Form.Item>
              <Form.Item
                label="审核状态"
                name="auditStatus"
                rules={[{ required: true, message: '请选择审核状态' }]}
              >
                <Select>
                  <Select.Option value={0}>未审核</Select.Option>
                  <Select.Option value={1}>已通过</Select.Option>
                </Select>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Connections;
