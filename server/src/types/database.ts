/**
 * VidCraft AI - Database Type Definitions
 * Shared interfaces for database row types
 */

export interface UserRow {
  id: string;
  phone: string;
  password_hash: string;
  nickname: string;
  avatar_url: string | null;
  membership: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectRow {
  id: string;
  user_id: string;
  title: string;
  original_prompt: string;
  enhanced_prompt: string | null;
  style_template: string;
  aspect_ratio: string;
  voice_config: string;
  music_config: string;
  status: string;
  duration: number | null;
  video_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerationTask {
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

export interface VerificationRecord {
  id: string;
  phone: string;
  code: string;
  type: string;
  expires_at: string;
  used: number;
}

/** Fields safe to select for user queries (excludes password_hash) */
export const USER_SAFE_COLUMNS = 'id, phone, nickname, avatar_url, membership, credits, created_at, updated_at';
