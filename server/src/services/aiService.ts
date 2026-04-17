/**
 * VidCraft AI - AI Service
 * Prompt enhancement and storyboard generation using Gemini
 */

import { env } from '../config/env';

interface EnhanceResult {
  enhancedPrompt: string;
  styleSuggestions: string[];
  mood: string;
  durationSuggestion: number;
}

interface StoryboardScene {
  index: number;
  prompt: string;
  duration: number;
  camera: string;
  movement: string;
}

interface StoryboardResult {
  totalDuration: number;
  scenes: StoryboardScene[];
}

import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiClient = env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(env.GEMINI_API_KEY)
  : null;

async function callGemini(prompt: string): Promise<string> {
  if (!geminiClient) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const model = geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

function buildEnhancePrompt(
  userPrompt: string,
  style: string,
  language: string
): string {
  const lang = language === 'zh' ? '中文' : 'English';
  return `You are a professional video director and cinematographer. Enhance the following video scene description to be more vivid, cinematic, and suitable for AI video generation.

User description: "${userPrompt}"
Video style: ${style}
Response language: ${lang}

Please respond in valid JSON format only (no markdown, no code blocks):
{
  "enhancedPrompt": "A detailed, professional description of the video scene with visual details, lighting, camera angles, colors, and atmosphere",
  "styleSuggestions": ["style1", "style2", "style3"],
  "mood": "the overall mood/emotion of the scene",
  "durationSuggestion": 30
}

The enhancedPrompt should be 100-300 words, highly descriptive, and include:
- Detailed visual elements
- Lighting and color palette
- Camera perspective
- Atmosphere and emotion
- Movement and action`;
}

function buildStoryboardPrompt(
  enhancedPrompt: string,
  sceneCount: number
): string {
  return `You are a professional storyboard artist. Break the following video description into ${sceneCount} distinct scenes for a storyboard.

Video description: "${enhancedPrompt}"

Please respond in valid JSON format only (no markdown, no code blocks):
{
  "totalDuration": 45,
  "scenes": [
    {
      "index": 1,
      "prompt": "Detailed description of this specific scene",
      "duration": 10,
      "camera": "wide",
      "movement": "pan"
    }
  ]
}

Rules:
- Each scene should be 5-15 seconds
- camera must be one of: wide, medium, close-up, extreme-close-up
- movement must be one of: static, pan, tilt, zoom, track, push, pull
- Total duration should be 30-60 seconds
- Each scene prompt should be specific and actionable for AI video generation
- Scenes should flow naturally and tell a cohesive story`;
}

function parseJsonResponse<T>(text: string): T {
  const cleaned = text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  return JSON.parse(cleaned) as T;
}

function createFallbackEnhance(userPrompt: string): EnhanceResult {
  return {
    enhancedPrompt: `${userPrompt}. The scene is captured with cinematic quality, featuring natural lighting and smooth camera movements. The color palette is warm and inviting, creating an immersive visual experience. Professional composition with attention to depth and detail.`,
    styleSuggestions: ['cinematic', 'nature', 'minimal'],
    mood: 'cinematic',
    durationSuggestion: 30,
  };
}

function createFallbackStoryboard(
  enhancedPrompt: string,
  sceneCount: number
): StoryboardResult {
  const baseDuration = Math.floor(45 / sceneCount);
  const cameras = ['wide', 'medium', 'close-up', 'wide'];
  const movements = ['pan', 'static', 'push', 'track'];

  const scenes: StoryboardScene[] = Array.from(
    { length: sceneCount },
    (_, i) => ({
      index: i + 1,
      prompt: `Scene ${i + 1}: ${enhancedPrompt.slice(
        i * Math.floor(enhancedPrompt.length / sceneCount),
        (i + 1) * Math.floor(enhancedPrompt.length / sceneCount)
      )}`,
      duration: baseDuration,
      camera: cameras[i % cameras.length],
      movement: movements[i % movements.length],
    })
  );

  return {
    totalDuration: baseDuration * sceneCount,
    scenes,
  };
}

export async function enhancePrompt(
  userPrompt: string,
  style: string = 'cinematic',
  language: string = 'zh'
): Promise<EnhanceResult> {
  try {
    const prompt = buildEnhancePrompt(userPrompt, style, language);
    const response = await callGemini(prompt);
    return parseJsonResponse<EnhanceResult>(response);
  } catch (error) {
    if (!env.GEMINI_API_KEY) {
      return createFallbackEnhance(userPrompt);
    }
    throw new Error(
      `AI enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function generateStoryboard(
  enhancedPrompt: string,
  sceneCount: number = 4
): Promise<StoryboardResult> {
  const clampedCount = Math.max(2, Math.min(8, sceneCount));

  try {
    const prompt = buildStoryboardPrompt(enhancedPrompt, clampedCount);
    const response = await callGemini(prompt);
    return parseJsonResponse<StoryboardResult>(response);
  } catch (error) {
    if (!env.GEMINI_API_KEY) {
      return createFallbackStoryboard(enhancedPrompt, clampedCount);
    }
    throw new Error(
      `Storyboard generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
