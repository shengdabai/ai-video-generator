/**
 * VidCraft AI - 核心类型定义
 * Core type definitions for the app
 */

// ==================== 用户相关类型 ====================

/** 会员等级 */
export type MembershipLevel = 'free' | 'pro' | 'business';

/** 用户信息 */
export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatarUrl: string | null;
  membership: MembershipLevel;
  credits: number;
  createdAt: string;
}

/** 登录凭证 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** 登录响应 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ==================== 视频项目相关类型 ====================

/** 项目状态 */
export type ProjectStatus = 'draft' | 'processing' | 'completed' | 'failed';

/** 画面比例 */
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

/** 视频风格 */
export type VideoStyle = 
  | 'cinematic' 
  | 'anime' 
  | 'business' 
  | 'cyberpunk' 
  | 'japanese' 
  | 'vintage' 
  | 'nature' 
  | 'minimal';

/** 配音配置 */
export interface VoiceConfig {
  enabled: boolean;
  voiceId?: string;
  text?: string;
  volume?: number;
}

/** 配乐配置 */
export interface MusicConfig {
  enabled: boolean;
  musicId?: string;
  volume?: number;
}

/** 视频项目 */
export interface VideoProject {
  id: string;
  userId: string;
  title: string;
  originalPrompt: string;
  enhancedPrompt: string | null;
  styleTemplate: VideoStyle;
  aspectRatio: AspectRatio;
  voiceConfig: VoiceConfig;
  musicConfig: MusicConfig;
  status: ProjectStatus;
  duration: number | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 创建项目请求 */
export interface CreateProjectRequest {
  title?: string;
  originalPrompt: string;
  enhancedPrompt?: string;
  storyboardId?: string;
  styleTemplate?: VideoStyle;
  aspectRatio?: AspectRatio;
  voiceConfig?: VoiceConfig;
  musicConfig?: MusicConfig;
}

// ==================== 分镜相关类型 ====================

/** 分镜状态 */
export type StoryboardStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** 镜头类型 */
export type CameraType = 'wide' | 'medium' | 'close-up' | 'extreme-close-up';

/** 镜头运动 */
export type CameraMovement = 'static' | 'pan' | 'tilt' | 'zoom' | 'track' | 'push' | 'pull';

/** 分镜场景 */
export interface Storyboard {
  id: string;
  projectId: string;
  sceneIndex: number;
  prompt: string;
  duration: number;
  cameraType: CameraType | null;
  movement: CameraMovement | null;
  videoClipUrl: string | null;
  thumbnailUrl: string | null;
  status: StoryboardStatus;
}

/** Prompt增强请求 */
export interface EnhancePromptRequest {
  prompt: string;
  style?: VideoStyle;
  language?: 'zh' | 'en';
}

/** Prompt增强响应 */
export interface EnhancePromptResponse {
  originalPrompt: string;
  enhancedPrompt: string;
  styleSuggestions: VideoStyle[];
  mood: string;
  durationSuggestion: number;
}

/** 生成分镜请求 */
export interface GenerateStoryboardRequest {
  enhancedPrompt: string;
  targetDuration?: number;
  sceneCount?: number;
}

/** 生成分镜响应 */
export interface GenerateStoryboardResponse {
  storyboardId: string;
  totalDuration: number;
  scenes: Array<{
    index: number;
    prompt: string;
    duration: number;
    camera: CameraType;
    movement: CameraMovement;
  }>;
}

// ==================== 生成任务相关类型 ====================

/** 任务状态 */
export type TaskStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed';

/** 生成进度步骤 */
export interface ProgressStep {
  name: string;
  status: TaskStatus;
  progress: number;
}

/** 生成进度 */
export interface GenerationProgress {
  projectId: string;
  status: TaskStatus;
  progress: number;
  currentStep: string;
  steps: ProgressStep[];
  estimatedRemaining: number | null;
}

/** 生成完成响应 */
export interface GenerationCompleteResponse {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
}

// ==================== 模板相关类型 ====================

/** 风格模板 */
export interface StyleTemplate {
  id: string;
  name: VideoStyle;
  displayName: string;
  description: string;
  previewUrl: string;
  isPremium: boolean;
}

/** 配音选项 */
export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'child';
  language: string;
  sampleUrl: string;
  isPremium: boolean;
}

/** 音乐选项 */
export interface MusicOption {
  id: string;
  name: string;
  artist: string;
  duration: number;
  mood: string;
  genre: string;
  previewUrl: string;
  isPremium: boolean;
}

// ==================== API响应类型 ====================

/** 统一API响应 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/** 分页参数 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== WebSocket消息类型 ====================

/** WS消息类型 */
export type WSMessageType = 'progress' | 'completed' | 'error';

/** WS进度消息 */
export interface WSProgressMessage {
  type: 'progress';
  data: {
    progress: number;
    currentStep: string;
    message: string;
  };
}

/** WS完成消息 */
export interface WSCompletedMessage {
  type: 'completed';
  data: GenerationCompleteResponse;
}

/** WS错误消息 */
export interface WSErrorMessage {
  type: 'error';
  data: {
    code: number;
    message: string;
  };
}

/** WS消息联合类型 */
export type WSMessage = WSProgressMessage | WSCompletedMessage | WSErrorMessage;

