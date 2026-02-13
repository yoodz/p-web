import { request } from '@umijs/max';

export interface RSSItem {
  _id: string;
  title: string;
  rssUrl: string;
  image?: string;
  description?: string;
  lastBuildDate?: string;
  lastUpdateAt?: string;
  generator?: string;
  deleted: number;
  auditStatus: number;
  init: number;
  errorCount?: number;
  createAt: string;
}

export interface RSSListParams {
  page?: number;
  pageSize?: number;
  auditStatus?: number;
  deleted?: number;
  title?: string;
  rssUrl?: string;
  sortField?: string;
  sortOrder?: string;
}

export interface RSSListResponse {
  data: RSSItem[];
  success: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface AddRSSParams {
  rssUrl: string;
  title?: string;
}

export interface AddRSSResponse {
  success: boolean;
  repeat?: boolean;
}

export interface UpdateRSSParams {
  title?: string;
  description?: string;
  auditStatus?: number;
  deleted?: number;
}

export interface UpdateRSSResponse {
  success: boolean;
  data: RSSItem;
}

export interface DeleteRSSResponse {
  success: boolean;
  message?: string;
}

/** 获取 RSS 列表 GET /blogNewsApi/rss */
export async function getRSSList(params?: RSSListParams) {
  return request<RSSListResponse>('/blogNewsApi/rss', {
    method: 'GET',
    params: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
      auditStatus: params?.auditStatus,
      deleted: params?.deleted ?? 0,
      title: params?.title,
      rssUrl: params?.rssUrl,
      sortField: params?.sortField,
      sortOrder: params?.sortOrder,
    },
  });
}

/** 添加 RSS POST /blogNewsApi/rss */
export async function addRSS(data: AddRSSParams) {
  return request<AddRSSResponse>('/blogNewsApi/rss', {
    method: 'POST',
    data,
  });
}

/** 更新 RSS PUT /blogNewsApi/rss/:id */
export async function updateRSS(id: string, data: UpdateRSSParams) {
  return request<UpdateRSSResponse>(`/blogNewsApi/rss/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 删除 RSS DELETE /blogNewsApi/rss/:id */
export async function deleteRSS(id: string) {
  return request<DeleteRSSResponse>(`/blogNewsApi/rss/${id}`, {
    method: 'DELETE',
  });
}
