import { Modal, Button, message, Progress, Space } from 'antd';
import { Image as AntImage } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useState, useRef } from 'react';
import { uploadImage } from '@/services/image';

interface ImageUploadModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface UploadItem {
  uid: string;
  file: File;
  url: string;
  name: string;
  size: number;
  width?: number;
  height?: number;
  status: 'waiting' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [uploadList, setUploadList] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取图片尺寸
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newUploads: UploadItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        message.error(`${file.name} 不是图片文件`);
        continue;
      }

      const dimensions = await getImageDimensions(file);
      const uid = `${Date.now()}-${i}`;

      newUploads.push({
        uid,
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        width: dimensions.width,
        height: dimensions.height,
        status: 'waiting',
        progress: 0,
      });
    }

    setUploadList((prev) => [...prev, ...newUploads]);
  };

  const handleUpload = async (item: UploadItem) => {
    setUploadList((prev) =>
      prev.map((i) =>
        i.uid === item.uid ? { ...i, status: 'uploading', progress: 0 } : i
      )
    );

    try {
      const response = await uploadImage(
        item.file,
        {
          name: item.name,
        },
        (progress) => {
          setUploadList((prev) =>
            prev.map((i) =>
              i.uid === item.uid ? { ...i, progress: Math.round(progress) } : i
            )
          );
        }
      );

      if (response.success) {
        setUploadList((prev) =>
          prev.map((i) =>
            i.uid === item.uid ? { ...i, status: 'success', progress: 100 } : i
          )
        );
        message.success(`${item.name} 上传成功`);
        // 单个上传成功后刷新表格
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        throw new Error('上传失败');
      }
    } catch (error: any) {
      setUploadList((prev) =>
        prev.map((i) =>
          i.uid === item.uid
            ? { ...i, status: 'error', error: error?.message || '上传失败' }
            : i
        )
      );
      message.error(`${item.name} 上传失败: ${error?.message || '未知错误'}`);
    }
  };

  const handleRemove = (uid: string) => {
    setUploadList((prev) => {
      const item = prev.find((i) => i.uid === uid);
      if (item?.url) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.uid !== uid);
    });
  };

  const handleCancel = () => {
    uploadList.forEach((item) => {
      if (item.url) URL.revokeObjectURL(item.url);
    });
    setUploadList([]);
    onCancel();
  };

  const handleOk = async () => {
    // 检查是否有待上传的图片
    const waitingItems = uploadList.filter((i) => i.status === 'waiting');
    if (waitingItems.length === 0) {
      // 没有待上传的图片，直接关闭弹窗
      uploadList.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
      setUploadList([]);
        onCancel();
      return;
    }

    // 执行上传
    setIsUploading(true);
    for (const item of waitingItems) {
      await handleUpload(item);
    }
    setIsUploading(false);

    // 上传完成后关闭弹窗
    setTimeout(() => {
      uploadList.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
      setUploadList([]);
        onCancel();
    }, 500);
  };

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <Modal
      title="上传图片"
      open={visible}
      onCancel={handleCancel}
      width={900}
      destroyOnClose
      footer={null}
    >
      <div
        style={{
          marginBottom: 16,
          padding: 24,
          border: '1px dashed #d9d9d9',
          borderRadius: 4,
          textAlign: 'center',
          cursor: 'pointer',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <PlusOutlined style={{ fontSize: 32, color: '#999' }} />
        <div style={{ marginTop: 8, color: '#999' }}>点击选择图片或拖拽图片到此处</div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {uploadList.length > 0 && (
        <>
          <div style={{ marginBottom: 16, color: '#999' }}>
            已选择 {uploadList.length} 张图片
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {uploadList.map((item) => (
              <div
                key={item.uid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 12,
                  border: '1px solid #f0f0f0',
                  borderRadius: 4,
                  marginBottom: 8,
                  backgroundColor: '#fafafa',
                }}
              >
                <AntImage
                  src={item.url}
                  alt={item.name}
                  width={80}
                  height={80}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    {item.width} x {item.height}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    大小: {formatSize(item.size)}
                  </div>
                  {item.status === 'uploading' && (
                    <Progress percent={item.progress} size="small" />
                  )}
                  {item.status === 'success' && (
                    <span style={{ color: '#52c41a', fontSize: 12 }}>上传成功</span>
                  )}
                  {item.status === 'error' && (
                    <span style={{ color: '#ff4d4f', fontSize: 12 }}>{item.error}</span>
                  )}
                </div>

                <Space>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(item.uid)}
                  />
                </Space>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button
          type="primary"
          size="large"
          onClick={handleOk}
          loading={isUploading}
          disabled={uploadList.filter((i) => i.status === 'waiting').length === 0}
        >
          {isUploading ? '上传中...' : '上传'}
        </Button>
      </div>
    </Modal>
  );
};

export default ImageUploadModal;
