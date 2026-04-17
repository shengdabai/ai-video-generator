/**
 * VidCraft AI - Video Generation Service
 * Simulated video generation queue with progress tracking
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';

interface GenerationTask {
  id: string;
  project_id: string;
  status: string;
  progress: number;
  current_step: string;
  estimated_remaining: number | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface ProgressInfo {
  projectId: string;
  status: string;
  progress: number;
  currentStep: string;
  steps: Array<{
    name: string;
    status: string;
    progress: number;
  }>;
  estimatedRemaining: number | null;
}

const activeTimers: Map<string, NodeJS.Timeout> = new Map();

const GENERATION_STEPS = [
  { name: 'preparing', label: '准备资源' },
  { name: 'scene_1', label: '生成分镜 1' },
  { name: 'scene_2', label: '生成分镜 2' },
  { name: 'scene_3', label: '生成分镜 3' },
  { name: 'audio', label: '音频合成' },
  { name: 'compositing', label: '视频合成' },
  { name: 'encoding', label: '编码输出' },
];

function buildSteps(
  currentProgress: number
): Array<{ name: string; status: string; progress: number }> {
  const stepSize = 100 / GENERATION_STEPS.length;

  return GENERATION_STEPS.map((step, index) => {
    const stepStart = index * stepSize;
    const stepEnd = (index + 1) * stepSize;

    if (currentProgress >= stepEnd) {
      return { name: step.label, status: 'completed', progress: 100 };
    }
    if (currentProgress >= stepStart) {
      const stepProgress = Math.round(
        ((currentProgress - stepStart) / stepSize) * 100
      );
      return { name: step.label, status: 'running', progress: stepProgress };
    }
    return { name: step.label, status: 'pending', progress: 0 };
  });
}

function getCurrentStepName(progress: number): string {
  const stepSize = 100 / GENERATION_STEPS.length;
  const stepIndex = Math.min(
    Math.floor(progress / stepSize),
    GENERATION_STEPS.length - 1
  );
  return GENERATION_STEPS[stepIndex].name;
}

export function createGenerationTask(projectId: string): { taskId: string; estimatedTime: number } {
  const taskId = uuidv4();

  db.prepare(`
    UPDATE video_projects SET status = 'processing', updated_at = datetime('now')
    WHERE id = ?
  `).run(projectId);

  db.prepare(`
    INSERT INTO generation_tasks (id, project_id, status, progress, current_step, started_at)
    VALUES (?, ?, 'running', 0, 'preparing', datetime('now'))
  `).run(taskId, projectId);

  const existingTimer = activeTimers.get(projectId);
  if (existingTimer) {
    clearInterval(existingTimer);
    activeTimers.delete(projectId);
  }

  simulateProgress(taskId, projectId);

  return { taskId, estimatedTime: 120 };
}

function simulateProgress(taskId: string, projectId: string): void {
  let progress = 0;
  const intervalMs = 2000;
  const increment = Math.floor(Math.random() * 8) + 5;

  const timer: NodeJS.Timeout = setInterval(() => {
    progress = Math.min(progress + increment, 100);
    const currentStep = getCurrentStepName(progress);
    const remaining = Math.max(
      0,
      Math.round(((100 - progress) / increment) * (intervalMs / 1000))
    );

    if (progress >= 100) {
      clearInterval(timer);
      activeTimers.delete(projectId);

      db.prepare(`
        UPDATE generation_tasks
        SET status = 'completed', progress = 100, current_step = 'completed',
            estimated_remaining = 0, completed_at = datetime('now')
        WHERE id = ?
      `).run(taskId);

      db.prepare(`
        UPDATE video_projects
        SET status = 'completed', duration = 45,
            video_url = 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            thumbnail_url = 'https://picsum.photos/640/360',
            updated_at = datetime('now')
        WHERE id = ?
      `).run(projectId);
    } else {
      db.prepare(`
        UPDATE generation_tasks
        SET progress = ?, current_step = ?, estimated_remaining = ?
        WHERE id = ?
      `).run(progress, currentStep, remaining, taskId);
    }
  }, intervalMs);

  activeTimers.set(projectId, timer);
}

export function cleanupTimers(): void {
  for (const [projectId, timer] of activeTimers) {
    clearInterval(timer);
    activeTimers.delete(projectId);
  }
}

export function getProgress(projectId: string): ProgressInfo | null {
  const task = db
    .prepare(`
      SELECT * FROM generation_tasks
      WHERE project_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `)
    .get(projectId) as GenerationTask | undefined;

  if (!task) {
    return null;
  }

  return {
    projectId: task.project_id,
    status: task.status,
    progress: task.progress,
    currentStep: task.current_step,
    steps: buildSteps(task.progress),
    estimatedRemaining: task.estimated_remaining,
  };
}
