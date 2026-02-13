// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 发送验证码 GET /blogNewsApi/user/captcha */
export async function getFakeCaptcha(
  params: {
    // query
    /** 手机号 */
    phone?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.FakeCaptcha>('/blogNewsApi/user/captcha', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
