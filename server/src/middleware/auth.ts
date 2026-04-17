/**
 * VidCraft AI - JWT Authentication Middleware
 * Validates Bearer tokens and attaches user to request
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import db from '../db/database';

export interface JwtPayload {
  userId: string;
  phone: string;
  type?: 'access' | 'refresh';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function generateTokens(payload: JwtPayload): {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} {
  const accessToken = jwt.sign(
    { ...payload, type: 'access' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as string & { __brand: 'StringValue' } } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as string & { __brand: 'StringValue' } } as jwt.SignOptions
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 7 * 24 * 60 * 60,
  };
}

export function verifyToken(token: string, expectedType?: 'access' | 'refresh'): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

  if (expectedType && decoded.type !== expectedType) {
    throw new Error(`Invalid token type: expected ${expectedType}`);
  }

  return { userId: decoded.userId, phone: decoded.phone, type: decoded.type };
}

export function isTokenBlacklisted(token: string): boolean {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const row = db
    .prepare('SELECT 1 FROM token_blacklist WHERE token_hash = ? AND expires_at > datetime(\'now\')')
    .get(tokenHash);
  return !!row;
}

export function blacklistToken(token: string): void {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const decoded = jwt.decode(token) as { exp?: number } | null;
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare('INSERT OR IGNORE INTO token_blacklist (token_hash, expires_at) VALUES (?, ?)')
    .run(tokenHash, expiresAt);
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      code: 401,
      message: '未登录，请先登录',
      data: null,
      timestamp: Date.now(),
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    if (isTokenBlacklisted(token)) {
      res.status(401).json({
        code: 401,
        message: 'Token 已失效，请重新登录',
        data: null,
        timestamp: Date.now(),
      });
      return;
    }

    const payload = verifyToken(token, 'access');

    const user = db
      .prepare('SELECT id FROM users WHERE id = ?')
      .get(payload.userId) as { id: string } | undefined;

    if (!user) {
      res.status(401).json({
        code: 401,
        message: '用户不存在',
        data: null,
        timestamp: Date.now(),
      });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      code: 401,
      message: 'Token 无效或已过期',
      data: null,
      timestamp: Date.now(),
    });
  }
}
