/**
 * VidCraft AI - Authentication Routes
 * Handles registration, login, logout, and token refresh
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import db from '../db/database';
import { generateTokens, verifyToken, authMiddleware, blacklistToken } from '../middleware/auth';
import { authLimiter, smsLimiter } from '../middleware/rateLimit';
import { sendVerificationCode, verifyCode } from '../services/smsService';
import { UserRow, USER_SAFE_COLUMNS } from '../types/database';
import { formatUser } from '../utils/formatters';
import { apiResponse } from '../utils/response';

const router = Router();

const SALT_ROUNDS = 12;

// ==================== Send Verification Code ====================

const sendCodeSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  type: z.enum(['register', 'login', 'reset']),
});

router.post('/send-code', smsLimiter, (req: Request, res: Response) => {
  try {
    const parsed = sendCodeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(apiResponse(null, parsed.error.errors[0].message, 400));
      return;
    }

    const { phone, type } = parsed.data;

    if (type === 'register') {
      const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
      if (existing) {
        res.status(400).json(apiResponse(null, '该手机号已注册', 400));
        return;
      }
    }

    sendVerificationCode(phone, type);
    res.json(apiResponse(null, '验证码已发送'));
  } catch (error) {
    res.status(500).json(
      apiResponse(null, '发送验证码失败，请稍后重试', 500)
    );
  }
});

// ==================== Register ====================

const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  code: z.string().length(6, '验证码为6位数字'),
  password: z.string().min(8, '密码至少8位').max(20, '密码最多20位'),
});

router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(apiResponse(null, parsed.error.errors[0].message, 400));
      return;
    }

    const { phone, code, password } = parsed.data;

    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existing) {
      res.status(400).json(apiResponse(null, '该手机号已注册', 400));
      return;
    }

    const isValid = verifyCode(phone, code, 'register');
    if (!isValid) {
      res.status(400).json(apiResponse(null, '验证码错误或已过期', 400));
      return;
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    db.prepare(`
      INSERT INTO users (id, phone, password_hash, nickname, credits)
      VALUES (?, ?, ?, ?, 3)
    `).run(userId, phone, passwordHash, `用户${phone.slice(-4)}`);

    const user = db.prepare(`SELECT ${USER_SAFE_COLUMNS} FROM users WHERE id = ?`).get(userId) as UserRow;
    const tokens = generateTokens({ userId, phone });

    res.status(201).json(
      apiResponse({
        user: formatUser(user),
        ...tokens,
      }, '注册成功')
    );
  } catch (error) {
    res.status(500).json(apiResponse(null, '注册失败，请稍后重试', 500));
  }
});

// ==================== Login ====================

const loginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  password: z.string().optional(),
  code: z.string().optional(),
}).refine(
  (data) => data.password || data.code,
  { message: '请提供密码或验证码' }
);

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(apiResponse(null, parsed.error.errors[0].message, 400));
      return;
    }

    const { phone, password, code } = parsed.data;

    const user = db.prepare('SELECT id, phone, password_hash, nickname, avatar_url, membership, credits, created_at FROM users WHERE phone = ?').get(phone) as UserRow | undefined;
    if (!user) {
      res.status(401).json(apiResponse(null, '手机号未注册', 401));
      return;
    }

    if (password) {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        res.status(401).json(apiResponse(null, '密码错误', 401));
        return;
      }
    } else if (code) {
      const isValid = verifyCode(phone, code, 'login');
      if (!isValid) {
        res.status(401).json(apiResponse(null, '验证码错误或已过期', 401));
        return;
      }
    }

    const tokens = generateTokens({ userId: user.id, phone: user.phone });

    res.json(
      apiResponse({
        user: formatUser(user),
        ...tokens,
      }, '登录成功')
    );
  } catch (error) {
    res.status(500).json(apiResponse(null, '登录失败，请稍后重试', 500));
  }
});

// ==================== Logout ====================

router.post('/logout', authMiddleware, (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      blacklistToken(token);
    }
    res.json(apiResponse(null, '已退出登录'));
  } catch (error) {
    res.status(500).json(apiResponse(null, '退出登录失败', 500));
  }
});

// ==================== Refresh Token ====================

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken 不能为空'),
});

router.post('/refresh', (req: Request, res: Response) => {
  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(apiResponse(null, parsed.error.errors[0].message, 400));
      return;
    }

    const payload = verifyToken(parsed.data.refreshToken, 'refresh');
    const tokens = generateTokens({ userId: payload.userId, phone: payload.phone });

    res.json(apiResponse(tokens, 'Token 已刷新'));
  } catch (error) {
    res.status(401).json(apiResponse(null, 'Refresh Token 无效或已过期', 401));
  }
});

export default router;
