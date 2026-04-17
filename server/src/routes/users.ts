/**
 * VidCraft AI - User Routes
 * User profile management
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import db from '../db/database';
import { authMiddleware } from '../middleware/auth';
import { UserRow, USER_SAFE_COLUMNS } from '../types/database';
import { formatUser } from '../utils/formatters';
import { apiResponse } from '../utils/response';

const router = Router();

// ==================== Get Current User ====================

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  try {
    const user = db
      .prepare(`SELECT ${USER_SAFE_COLUMNS} FROM users WHERE id = ?`)
      .get(req.user!.userId) as UserRow | undefined;

    if (!user) {
      res.status(404).json(apiResponse(null, '用户不存在', 404));
      return;
    }

    res.json(apiResponse(formatUser(user)));
  } catch (error) {
    res.status(500).json(apiResponse(null, '获取用户信息失败', 500));
  }
});

// ==================== Update Current User ====================

const updateUserSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().optional(),
});

router.put('/me', authMiddleware, (req: Request, res: Response) => {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(apiResponse(null, parsed.error.errors[0].message, 400));
      return;
    }

    const { nickname, avatarUrl } = parsed.data;
    const userId = req.user!.userId;

    const updates: string[] = [];
    const values: (string | undefined)[] = [];

    if (nickname !== undefined) {
      updates.push('nickname = ?');
      values.push(nickname);
    }
    if (avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatarUrl);
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(userId);

      db.prepare(`
        UPDATE users SET ${updates.join(', ')} WHERE id = ?
      `).run(...values);
    }

    const user = db
      .prepare(`SELECT ${USER_SAFE_COLUMNS} FROM users WHERE id = ?`)
      .get(userId) as UserRow;

    res.json(apiResponse(formatUser(user), '更新成功'));
  } catch (error) {
    res.status(500).json(apiResponse(null, '更新用户信息失败', 500));
  }
});

// ==================== Get User Credits ====================

router.get('/me/credits', authMiddleware, (req: Request, res: Response) => {
  try {
    const user = db
      .prepare('SELECT credits, membership FROM users WHERE id = ?')
      .get(req.user!.userId) as { credits: number; membership: string } | undefined;

    if (!user) {
      res.status(404).json(apiResponse(null, '用户不存在', 404));
      return;
    }

    res.json(apiResponse({
      credits: user.credits,
      membership: user.membership,
    }));
  } catch (error) {
    res.status(500).json(apiResponse(null, '获取配额信息失败', 500));
  }
});

export default router;
