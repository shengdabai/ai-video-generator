/**
 * VidCraft AI - Template Routes
 * Style templates, voice options, and music library
 */

import { Router, Request, Response } from 'express';

const router = Router();

function apiResponse<T>(data: T, message: string = 'success', code: number = 200) {
  return { code, message, data, timestamp: Date.now() };
}

const STYLE_TEMPLATES = [
  {
    id: 'style-cinematic',
    name: 'cinematic',
    displayName: '电影质感',
    description: '电影级色彩、浅景深、宽银幕画面',
    previewUrl: 'https://picsum.photos/id/10/400/225',
    isPremium: false,
  },
  {
    id: 'style-anime',
    name: 'anime',
    displayName: '动画卡通',
    description: '扁平/3D动画风格、鲜艳色彩',
    previewUrl: 'https://picsum.photos/id/20/400/225',
    isPremium: false,
  },
  {
    id: 'style-business',
    name: 'business',
    displayName: '商务专业',
    description: '简洁大气、蓝色主调、专业感',
    previewUrl: 'https://picsum.photos/id/30/400/225',
    isPremium: false,
  },
  {
    id: 'style-cyberpunk',
    name: 'cyberpunk',
    displayName: '赛博朋克',
    description: '霓虹灯、暗调、未来感',
    previewUrl: 'https://picsum.photos/id/40/400/225',
    isPremium: true,
  },
  {
    id: 'style-japanese',
    name: 'japanese',
    displayName: '日系治愈',
    description: '柔和光影、清新色调、温暖',
    previewUrl: 'https://picsum.photos/id/50/400/225',
    isPremium: false,
  },
  {
    id: 'style-vintage',
    name: 'vintage',
    displayName: '复古胶片',
    description: '颗粒感、褪色效果、老电影质感',
    previewUrl: 'https://picsum.photos/id/60/400/225',
    isPremium: true,
  },
  {
    id: 'style-nature',
    name: 'nature',
    displayName: '自然纪录',
    description: '高清写实、自然光、纪录片风格',
    previewUrl: 'https://picsum.photos/id/70/400/225',
    isPremium: false,
  },
  {
    id: 'style-minimal',
    name: 'minimal',
    displayName: '极简主义',
    description: '纯色背景、聚焦主体、简洁',
    previewUrl: 'https://picsum.photos/id/80/400/225',
    isPremium: false,
  },
];

const VOICE_OPTIONS = [
  {
    id: 'voice-male-1',
    name: '磁性男声',
    gender: 'male',
    language: 'zh-CN',
    sampleUrl: 'https://example.com/voice/male-1.mp3',
    isPremium: false,
  },
  {
    id: 'voice-female-1',
    name: '温柔女声',
    gender: 'female',
    language: 'zh-CN',
    sampleUrl: 'https://example.com/voice/female-1.mp3',
    isPremium: false,
  },
  {
    id: 'voice-male-2',
    name: '浑厚男声',
    gender: 'male',
    language: 'zh-CN',
    sampleUrl: 'https://example.com/voice/male-2.mp3',
    isPremium: true,
  },
  {
    id: 'voice-female-2',
    name: '活力女声',
    gender: 'female',
    language: 'zh-CN',
    sampleUrl: 'https://example.com/voice/female-2.mp3',
    isPremium: true,
  },
  {
    id: 'voice-child-1',
    name: '可爱童声',
    gender: 'child',
    language: 'zh-CN',
    sampleUrl: 'https://example.com/voice/child-1.mp3',
    isPremium: true,
  },
];

const MUSIC_OPTIONS = [
  {
    id: 'music-1',
    name: '清晨微光',
    artist: 'VidCraft Studio',
    duration: 120,
    mood: 'calm',
    genre: 'ambient',
    previewUrl: 'https://example.com/music/calm-1.mp3',
    isPremium: false,
  },
  {
    id: 'music-2',
    name: '城市节拍',
    artist: 'VidCraft Studio',
    duration: 90,
    mood: 'energetic',
    genre: 'electronic',
    previewUrl: 'https://example.com/music/energetic-1.mp3',
    isPremium: false,
  },
  {
    id: 'music-3',
    name: '温暖午后',
    artist: 'VidCraft Studio',
    duration: 150,
    mood: 'warm',
    genre: 'acoustic',
    previewUrl: 'https://example.com/music/warm-1.mp3',
    isPremium: false,
  },
  {
    id: 'music-4',
    name: '星际漫游',
    artist: 'VidCraft Studio',
    duration: 180,
    mood: 'epic',
    genre: 'orchestral',
    previewUrl: 'https://example.com/music/epic-1.mp3',
    isPremium: true,
  },
  {
    id: 'music-5',
    name: '夏日海岸',
    artist: 'VidCraft Studio',
    duration: 100,
    mood: 'happy',
    genre: 'pop',
    previewUrl: 'https://example.com/music/happy-1.mp3',
    isPremium: false,
  },
  {
    id: 'music-6',
    name: '深夜独白',
    artist: 'VidCraft Studio',
    duration: 200,
    mood: 'melancholy',
    genre: 'piano',
    previewUrl: 'https://example.com/music/melancholy-1.mp3',
    isPremium: true,
  },
];

// ==================== Get Style Templates ====================

router.get('/styles', (_req: Request, res: Response) => {
  res.json(apiResponse(STYLE_TEMPLATES));
});

// ==================== Get Voice Options ====================

router.get('/voices', (_req: Request, res: Response) => {
  res.json(apiResponse(VOICE_OPTIONS));
});

// ==================== Get Music Library ====================

router.get('/music', (req: Request, res: Response) => {
  const { mood } = req.query;

  const filtered = mood
    ? MUSIC_OPTIONS.filter((m) => m.mood === mood)
    : MUSIC_OPTIONS;

  res.json(apiResponse(filtered));
});

export default router;
