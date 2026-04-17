/**
 * VidCraft AI - Rate Limiting Middleware
 * Protects API endpoints from abuse
 */

import rateLimit from 'express-rate-limit';

function createApiResponse(message: string) {
  return {
    code: 429,
    message,
    data: null,
    timestamp: Date.now(),
  };
}

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: createApiResponse('请求过于频繁，请稍后再试'),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: createApiResponse('登录尝试过多，请15分钟后重试'),
});

export const smsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: createApiResponse('验证码发送过于频繁，请60秒后重试'),
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: createApiResponse('AI 请求过于频繁，请稍后重试'),
});
