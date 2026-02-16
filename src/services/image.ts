import { request } from '@umijs/max';

export interface ImageItem {
  _id: string;
  filename: string;
  name?: string;
  url: string;
  size?: number;
  width?: number;
  height?: number;
  format?: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ImageListParams {
  page?: number;
  pageSize?: number;
  filename?: string;
  name?: string;
}

export interface ImageListResponse {
  data: ImageItem[];
  success: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface UploadImageParams {
  name?: string;
  description?: string;
}

export interface UploadImageResponse {
  success: boolean;
  data: ImageItem;
}

export interface UpdateImageParams {
  name?: string;
  description?: string;
}

export interface UpdateImageResponse {
  success: boolean;
  data: ImageItem;
}

export interface DeleteImageResponse {
  success: boolean;
  message?: string;
}

/** 获取图片列表 GET /blogNewsApi/images */
export async function getImageList(params?: ImageListParams) {
  return request<ImageListResponse>('/blogNewsApi/images', {
    method: 'GET',
    params: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
      filename: params?.filename,
      name: params?.name,
    },
  });
}

/** 上传图片 POST /blogNewsApi/images/upload */
export async function uploadImage(
  file: File,
  data: UploadImageParams,
  onProgress?: (percent: number) => void
) {
  const formData = new FormData();
  formData.append('file', file);
  if (data.name) formData.append('name', data.name);
  if (data.description) formData.append('description', data.description);

  return request<UploadImageResponse>('/blogNewsApi/images/upload', {
    method: 'POST',
    data: formData,
    timeout: 120000, // 2 分钟超时
    requestType: 'form',
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = (progressEvent.loaded / progressEvent.total) * 100;
        onProgress(percent);
      }
    },
  });
}

/** 更新图片信息 PUT /blogNewsApi/images/:id */
export async function updateImage(id: string, data: UpdateImageParams) {
  return request<UpdateImageResponse>(`/blogNewsApi/images/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 删除图片 DELETE /blogNewsApi/images/:id */
export async function deleteImage(id: string) {
  return request<DeleteImageResponse>(`/blogNewsApi/images/${id}`, {
    method: 'DELETE',
  });
}

/** 批量删除图片 DELETE /blogNewsApi/images/batch */
export async function batchDeleteImages(ids: string[]) {
  return request<DeleteImageResponse>('/blogNewsApi/images/batch', {
    method: 'DELETE',
    data: { ids },
  });
}

/** 获取图片详情 GET /blogNewsApi/images/:id */
export async function getImageDetail(id: string) {
  return request<{ success: boolean; data: ImageItem }>(`/blogNewsApi/images/${id}`, {
    method: 'GET',
  });
}
