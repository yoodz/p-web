import { request } from '@umijs/max';

export interface VisitStatsArticle {
  article: string;
  visits: number;
}

export interface VisitStatsItem {
  date: string;
  totalVisits: number;
  articles: VisitStatsArticle[];
}

export interface VisitStatsResponse {
  data: VisitStatsItem[];
  success: boolean;
}

/** 获取文章访问统计数据 GET /blogNewsApi/track-visit-stats */
export async function getVisitStats(options?: { [key: string]: any }) {
  return request<VisitStatsResponse>('/blogNewsApi/track-visit-stats', {
    method: 'GET',
    ...(options || {}),
  });
}
