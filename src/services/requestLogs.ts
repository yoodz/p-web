import { request } from '@umijs/max';

export interface RequestLogItem {
  _id: string;
  timestamp: string;
  method: string;
  url: string;
  path: string;
  statusCode: number;
  responseTime: number;
  ip: string;
  userAgent: string;
  userId?: string;
  username?: string;
}

export interface RequestLogParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  startDate?: string;
  endDate?: string;
}

export interface RequestLogResponse {
  success: boolean;
  logs: RequestLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getRequestLogs(params: RequestLogParams): Promise<RequestLogResponse> {
  return request('/blogNewsApi/request-logs', {
    method: 'GET',
    params,
  });
}

export async function getRequestLogsStats(params?: { startDate?: string; endDate?: string }) {
  return request('/blogNewsApi/request-logs/stats', {
    method: 'GET',
    params,
  });
}

export async function cleanupRequestLogs(days?: number) {
  return request('/blogNewsApi/request-logs/cleanup', {
    method: 'POST',
    data: { days },
  });
}
