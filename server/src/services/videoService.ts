/**
 * VidCraft AI - Video Generation Service
 * Simulated video generation queue with progress tracking
 */

import { randomUUID as uuidv4 } from 'node:crypto';
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
  generationMode: 'demo';
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

export function createGenerationTask(projectId: string, userId: string): { taskId: string; estimatedTime: number; generationMode: 'demo'; creditsCharged: 0 } {
  const taskId = uuidv4();
  db.transaction(() => {
    const project = db.prepare('SELECT status FROM video_projects WHERE id = ? AND user_id = ?')
      .get(projectId, userId) as { status: string } | undefined;
    if (!project) throw new Error('PROJECT_NOT_FOUND');
    if (project.status === 'processing') throw new Error('ALREADY_PROCESSING');
    // This queue only produces sample clips. Demo tasks must never consume credits.
    db.prepare("UPDATE video_projects SET status = 'processing', updated_at = datetime('now') WHERE id = ?").run(projectId);
    db.prepare(`INSERT INTO generation_tasks (id, project_id, status, progress, current_step, started_at)
      VALUES (?, ?, 'running', 0, 'preparing', datetime('now'))`).run(taskId, projectId);
  })();

  const existingTimer = activeTimers.get(projectId);
  if (existingTimer) {
    clearInterval(existingTimer);
    activeTimers.delete(projectId);
  }

  simulateProgress(taskId, projectId);

  return { taskId, estimatedTime: 120, generationMode: 'demo', creditsCharged: 0 };
}

/** Commit both completion records together, including recovery of legacy partial writes. */
export function completeTask(taskId: string, projectId: string): void {
  db.transaction(() => {
      const task = db.prepare('SELECT id FROM generation_tasks WHERE id = ? AND project_id = ?').get(taskId, projectId);
      if (!task) throw new Error('TASK_NOT_FOUND');
      db.prepare(`
        UPDATE generation_tasks
        SET status = 'completed', progress = 100, current_step = 'completed',
            estimated_remaining = 0, completed_at = datetime('now')
        WHERE id = ?
      `).run(taskId);

      db.prepare(`
        UPDATE video_projects
        SET status = 'completed', duration = NULL,
            video_url = 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            thumbnail_url = NULL,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(projectId);
  })();
}

function simulateProgress(taskId: string, projectId: string, initialProgress = 0): void {
  let progress = Math.max(0, Math.min(100, initialProgress));
  const intervalMs = 2000;
  const increment = Math.floor(Math.random() * 8) + 5;

  const timer: NodeJS.Timeout = setInterval(() => {
    try {
      progress = Math.min(progress + increment, 100);
      const currentStep = getCurrentStepName(progress);
      const remaining = Math.max(
        0,
        Math.round(((100 - progress) / increment) * (intervalMs / 1000))
      );

      if (progress >= 100) {
        clearInterval(timer);
        activeTimers.delete(projectId);

        completeTask(taskId, projectId);
      } else {
        const updated = db.prepare(`
          UPDATE generation_tasks
          SET progress = ?, current_step = ?, estimated_remaining = ?
          WHERE id = ?
        `).run(progress, currentStep, remaining, taskId);
        if (!updated.changes) { clearInterval(timer); activeTimers.delete(projectId); }
      }
    } catch {
      clearInterval(timer);
      activeTimers.delete(projectId);
      // A failed timer callback must not crash the process or expose SQL details.
      try {
        db.transaction(() => {
          db.prepare("UPDATE generation_tasks SET status = 'failed', error_message = '演示任务失败', completed_at = datetime('now') WHERE id = ?").run(taskId);
          db.prepare("UPDATE video_projects SET status = 'failed', updated_at = datetime('now') WHERE id = ?").run(projectId);
        })();
      } catch { /* Storage may be unavailable; stop the timer regardless. */ }
    }
  }, intervalMs);

  activeTimers.set(projectId, timer);
}

/** Resume the existing simulated jobs after a server restart without charging again. */
export function resumePendingTasks(): number {
  const partial = db.prepare(`SELECT t.id, t.project_id FROM generation_tasks t
    JOIN video_projects p ON p.id = t.project_id
    WHERE t.status = 'completed' AND p.status = 'processing'
      AND NOT EXISTS (SELECT 1 FROM generation_tasks newer
        WHERE newer.project_id = t.project_id AND newer.status = 'running')`).all() as Array<{id:string;project_id:string}>;
  for (const task of partial) completeTask(task.id, task.project_id);
  const tasks = db.prepare(`SELECT t.id, t.project_id, t.progress FROM generation_tasks t
    JOIN video_projects p ON p.id = t.project_id
    WHERE t.status = 'running' AND p.status = 'processing' ORDER BY t.created_at DESC`).all() as Array<{ id: string; project_id: string; progress: number }>;
  let resumed = 0;
  for (const task of tasks) {
    if (activeTimers.has(task.project_id)) continue;
    simulateProgress(task.id, task.project_id, task.progress);
    resumed++;
  }
  return resumed;
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
      ORDER BY created_at DESC, rowid DESC
      LIMIT 1
    `)
    .get(projectId) as GenerationTask | undefined;

  if (!task) {
    return null;
  }

  return {
    generationMode: 'demo',
    projectId: task.project_id,
    status: task.status,
    progress: task.progress,
    currentStep: task.current_step,
    steps: buildSteps(task.progress),
    estimatedRemaining: task.estimated_remaining,
  };
}
