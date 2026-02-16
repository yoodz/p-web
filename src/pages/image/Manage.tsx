import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Image as AntImage } from 'antd';
import React, { useRef, useState } from 'react';
import { getImageList, deleteImage, type ImageItem } from '@/services/image';
import ImageUploadModal from './components/ImageUploadModal';

const ImageManage: React.FC = () => {
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<ImageItem>[] = [
    {
      title: '图片',
      dataIndex: 'url',
      width: 120,
      search: false,
      render: (_, record) => (
        <AntImage
          src={record.url}
          alt={record.name || record.filename}
          width={80}
          height={80}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          preview={{ mask: '预览' }}
        />
      ),
    },
    {
      title: '文件名',
      dataIndex: 'filename',
      width: 280,
      ellipsis: true,
      render: (_, record) => (
        <span style={{ fontSize: 12, color: '#999' }}>{record.filename}</span>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      width: 120,
      search: false,
      render: (_, record) => {
        const size = record.size || 0;
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        return `${(size / 1024 / 1024).toFixed(2)} MB`;
      },
    },
    {
      title: '尺寸',
      dataIndex: 'dimensions',
      width: 150,
      search: false,
      render: (_, record) => {
        if (record.width && record.height) {
          return `${record.width} x ${record.height}`;
        }
        return '-';
      },
    },
    {
      title: '格式',
      dataIndex: 'format',
      width: 100,
      search: false,
      render: (_, record) => {
        const ext = record.filename?.split('.').pop()?.toUpperCase() || '';
        return <Tag>{ext}</Tag>;
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      width: 180,
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 140,
      fixed: 'right',
      render: (_, record) => [
        <a
          key="copy"
          onClick={() => {
            navigator.clipboard.writeText(record.url);
            message.success('链接已复制');
          }}
        >
          复制链接
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除"
          description="确定要删除这张图片吗？"
          onConfirm={() => handleDelete(record._id)}
          okText="确定"
          cancelText="取消"
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      await deleteImage(id);
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

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的图片');
      return;
    }
    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedRowKeys.length} 张图片吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await Promise.all(selectedRowKeys.map((id) => deleteImage(id as string)));
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          actionRef.current?.reload();
        } catch (error: any) {
          let errorMsg = '批量删除失败';
          if (error?.data?.error) {
            errorMsg = error.data.error;
          } else if (error?.error) {
            errorMsg = error.error;
          } else if (error?.message) {
            errorMsg = error.message;
          }
          message.error(errorMsg);
        }
      },
    });
  };

  const handleUploadSuccess = () => {
    // 只刷新表格，不关闭弹窗，方便继续上传
    actionRef.current?.reload();
  };

  return (
    <PageContainer>
      <ProTable<ImageItem>
        headerTitle="图片管理"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            key="upload"
            type="primary"
            onClick={() => setIsUploadModalVisible(true)}
          >
            <PlusOutlined /> 上传图片
          </Button>,
        ]}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        tableAlertRender={({ selectedRowKeys }) => (
          <Space size={24}>
            <span>
              已选择 <a>{selectedRowKeys.length}</a> 项
            </span>
          </Space>
        )}
        tableAlertOptionRender={() => (
          <Space size={16}>
            <a
              onClick={handleBatchDelete}
              style={{ color: 'red' }}
            >
              <DeleteOutlined /> 批量删除
            </a>
          </Space>
        )}
        request={async (params) => {
          const response = await getImageList({
            page: params.current,
            pageSize: params.pageSize,
            filename: params.filename,
            name: params.name,
          });
          return {
            data: response.data || [],
            success: response.success,
            total: response.pagination?.total || 0,
          };
        }}
        columns={columns}
        scroll={{ x: 1280 }}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <ImageUploadModal
        visible={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        onSuccess={handleUploadSuccess}
      />

      <Modal
        open={isPreviewVisible}
        title="图片预览"
        footer={null}
        onCancel={() => setIsPreviewVisible(false)}
        width="80vw"
        style={{ top: 20 }}
      >
        <AntImage
          src={previewImage}
          alt="预览"
          style={{ width: '100%' }}
          preview={false}
        />
      </Modal>
    </PageContainer>
  );
};

export default ImageManage;
