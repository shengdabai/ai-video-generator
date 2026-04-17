/**
 * VidCraft AI - Video Routes
 * Video project CRUD and generation endpoints
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth';
import db from '../db/database';
import { createGenerationTask, getProgress } from '../services/videoService';
import { ProjectRow } from '../types/database';
import { formatProject } from '../utils/formatters';
import { apiResponse } from '../utils/response';

const router = Router();

// ==================== Create Project ====================

const createSchema = z.object({
  title: z.string().max(200).optional(),
  originalPrompt: z.string().min(5, '描述至少5个字符'),
  enhancedPrompt: z.string().optional(),
  styleTemplate: z.string().default('cinematic'),
  aspectRatio: z.string().default('16:9'),
  voiceConfig: z.object({
    enabled: z.boolean(),
    voiceId: z.string().optional(),
    text: z.string().optional(),
    volume: z.number().optional(),
  }).optional(),
  musicConfig: z.object({
    enabled: z.boolean(),
    musicId: z.string().optional(),
    volume: z.number().optional(),
  }).optional(),
});

router.post('/', authMiddleware, (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(apiResponse(null, parsed.error.errors[0].message, 400));
      return;
    }

    const data = parsed.data;
    const userId = req.user!.userId;
    const projectId = uuidv4();
    const title = data.title || `${data.originalPrompt.slice(0, 20)}...`;

    db.prepare(`
      INSERT INTO video_projects
        (id, user_id, title, original_prompt, enhanced_prompt,
         style_template, aspect_ratio, voice_config, music_config)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      userId,
      title,
      data.originalPrompt,
      data.enhancedPrompt || null,
      data.styleTemplate,
      data.aspectRatio,
      JSON.stringify(data.voiceConfig || { enabled: false }),
      JSON.stringify(data.musicConfig || { enabled: false })
    );

    const project = db
      .prepare('SELECT * FROM video_projects WHERE id = ?')
      .get(projectId) as ProjectRow;

    res.status(201).json(apiResponse(formatProject(project), '项目创建成功'));
  } catch (error) {
    res.status(500).json(apiResponse(null, '创建项目失败', 500));
  }
});

// ==================== Get Projects List ====================

router.get('/', authMiddleware, (req: Request, res: Response) => {
  try {
    const pageParam = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
    const pageSizeParam = Array.isArray(req.query.pageSize) ? req.query.pageSize[0] : req.query.pageSize;
    const page = Math.max(1, parseInt(String(pageParam || '1')) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(String(pageSizeParam || '20')) || 20));
    const offset = (page - 1) * pageSize;
    const userId = req.user!.userId;

    const countResult = db
      .prepare('SELECT COUNT(*) as total FROM video_projects WHERE user_id = ?')
      .get(userId) as { total: number };

    const projects = db
      .prepare(`
        SELECT * FROM video_projects
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `)
      .all(userId, pageSize, offset) as ProjectRow[];

    const totalPages = Math.ceil(countResult.total / pageSize);

    res.json(
      apiResponse({
        items: projects.map(formatProject),
        total: countResult.total,
        page,
        pageSize,
        totalPages,
      })
    );
  } catch (error) {
    res.status(500).json(apiResponse(null, '获取项目列表失败', 500));
  }
});

// ==================== Get Project Detail ====================

router.get('/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const project = db
      .prepare('SELECT * FROM video_projects WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user!.userId) as ProjectRow | undefined;

    if (!project) {
      res.status(404).json(apiResponse(null, '项目不存在', 404));
      return;
    }

    res.json(apiResponse(formatProject(project)));
  } catch (error) {
    res.status(500).json(apiResponse(null, '获取项目详情失败', 500));
  }
});

// ==================== Delete Project ====================

router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const result = db
      .prepare('DELETE FROM video_projects WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user!.userId);

    if (result.changes === 0) {
      res.status(404).json(apiResponse(null, '项目不存在', 404));
      return;
    }

    res.json(apiResponse(null, '项目已删除'));
  } catch (error) {
    res.status(500).json(apiResponse(null, '删除项目失败', 500));
  }
});

// ==================== Start Generation ====================

router.post('/:id/generate', authMiddleware, (req: Request, res: Response) => {
  try {
    const project = db
      .prepare('SELECT * FROM video_projects WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user!.userId) as ProjectRow | undefined;

    if (!project) {
      res.status(404).json(apiResponse(null, '项目不存在', 404));
      return;
    }

    if (project.status === 'processing') {
      res.status(400).json(apiResponse(null, '视频正在生成中', 400));
      return;
    }

    const deductResult = db
      .prepare('UPDATE users SET credits = credits - 1 WHERE id = ? AND credits > 0')
      .run(req.user!.userId);

    if (deductResult.changes === 0) {
      res.status(403).json(apiResponse(null, '生成次数已用完，请升级会员', 403));
      return;
    }

    const result = createGenerationTask(project.id);

    res.json(apiResponse(result, '视频开始生成'));
  } catch (error) {
    res.status(500).json(apiResponse(null, '启动生成任务失败', 500));
  }
});

// ==================== Get Generation Progress ====================

router.get('/:id/progress', authMiddleware, (req: Request, res: Response) => {
  try {
    const project = db
      .prepare('SELECT id FROM video_projects WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user!.userId);

    if (!project) {
      res.status(404).json(apiResponse(null, '项目不存在', 404));
      return;
    }

    const projectId = String(req.params.id);
    const progress = getProgress(projectId);

    if (!progress) {
      res.status(404).json(apiResponse(null, '没有生成任务', 404));
      return;
    }

    res.json(apiResponse(progress));
  } catch (error) {
    res.status(500).json(apiResponse(null, '获取进度失败', 500));
  }
});

export default router;
