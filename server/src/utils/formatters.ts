/**
 * VidCraft AI - Data Formatters
 * Transform database rows to API response shapes
 */

import { UserRow, ProjectRow } from '../types/database';
import { safeJsonParse } from './json';

export function formatUser(row: UserRow) {
  return {
    id: row.id,
    phone: row.phone,
    nickname: row.nickname,
    avatarUrl: row.avatar_url,
    membership: row.membership,
    credits: row.credits,
    createdAt: row.created_at,
  };
}

export function formatProject(row: ProjectRow) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    originalPrompt: row.original_prompt,
    enhancedPrompt: row.enhanced_prompt,
    styleTemplate: row.style_template,
    aspectRatio: row.aspect_ratio,
    voiceConfig: safeJsonParse(row.voice_config, { enabled: false }),
    musicConfig: safeJsonParse(row.music_config, { enabled: false }),
    status: row.status,
    duration: row.duration,
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
