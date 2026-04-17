/**
 * VidCraft AI - 视频项目状态管理
 * Video project state management using Zustand
 */

import { create } from 'zustand';
import {
  VideoProject,
  VideoStyle,
  AspectRatio,
  VoiceConfig,
  MusicConfig,
  Storyboard,
  EnhancePromptResponse,
  GenerateStoryboardResponse,
  GenerationProgress,
} from '@/types';
import apiClient from '@/services/api';

interface ProjectState {
  // 列表状态
  projects: VideoProject[];
  isLoadingList: boolean;
  hasMore: boolean;
  currentPage: number;

  // 当前编辑状态
  currentProject: {
    originalPrompt: string;
    enhancedPrompt: string | null;
    storyboards: Storyboard[];
    style: VideoStyle;
    aspectRatio: AspectRatio;
    voiceConfig: VoiceConfig;
    musicConfig: MusicConfig;
  };

  // 生成状态
  generationProgress: GenerationProgress | null;
  isGenerating: boolean;

  // 加载状态
  isLoading: boolean;
  error: string | null;

  // Actions - 列表
  loadProjects: (refresh?: boolean) => Promise<void>;
  loadMoreProjects: () => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Actions - 创作流程
  setOriginalPrompt: (prompt: string) => void;
  enhancePrompt: () => Promise<EnhancePromptResponse>;
  setEnhancedPrompt: (prompt: string) => void;
  generateStoryboard: () => Promise<GenerateStoryboardResponse>;
  updateStoryboard: (index: number, updates: Partial<Storyboard>) => void;
  setStyle: (style: VideoStyle) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setVoiceConfig: (config: VoiceConfig) => void;
  setMusicConfig: (config: MusicConfig) => void;
  
  // Actions - 生成
  startGeneration: () => Promise<string>;
  updateProgress: (progress: GenerationProgress) => void;
  resetCurrentProject: () => void;
  clearError: () => void;
}

const initialCurrentProject = {
  originalPrompt: '',
  enhancedPrompt: null,
  storyboards: [],
  style: 'cinematic' as VideoStyle,
  aspectRatio: '16:9' as AspectRatio,
  voiceConfig: { enabled: false },
  musicConfig: { enabled: false },
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  // 初始状态
  projects: [],
  isLoadingList: false,
  hasMore: true,
  currentPage: 1,
  currentProject: { ...initialCurrentProject },
  generationProgress: null,
  isGenerating: false,
  isLoading: false,
  error: null,

  /**
   * 加载视频项目列表
   * Load video projects list
   */
  loadProjects: async (refresh = false) => {
    if (refresh) {
      set({ currentPage: 1, hasMore: true, projects: [] });
    }

    set({ isLoadingList: true, error: null });

    try {
      const response = await apiClient.getProjects(1, 20);
      set({
        projects: response.items,
        hasMore: response.page < response.totalPages,
        currentPage: 1,
        isLoadingList: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || '加载失败';
      set({ isLoadingList: false, error: message });
    }
  },

  /**
   * 加载更多项目
   * Load more projects (pagination)
   */
  loadMoreProjects: async () => {
    const { isLoadingList, hasMore, currentPage } = get();
    if (isLoadingList || !hasMore) return;

    set({ isLoadingList: true });

    try {
      const nextPage = currentPage + 1;
      const response = await apiClient.getProjects(nextPage, 20);
      set((state) => ({
        projects: [...state.projects, ...response.items],
        hasMore: response.page < response.totalPages,
        currentPage: nextPage,
        isLoadingList: false,
      }));
    } catch (error: any) {
      set({ isLoadingList: false });
    }
  },

  /**
   * 删除项目
   * Delete a video project
   */
  deleteProject: async (id: string) => {
    try {
      await apiClient.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || '删除失败';
      set({ error: message });
      throw new Error(message);
    }
  },

  /**
   * 设置原始描述
   * Set original prompt
   */
  setOriginalPrompt: (prompt: string) => {
    set((state) => ({
      currentProject: { ...state.currentProject, originalPrompt: prompt },
    }));
  },

  /**
   * 增强描述
   * Enhance prompt with AI
   */
  enhancePrompt: async () => {
    const { currentProject } = get();
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.enhancePrompt({
        prompt: currentProject.originalPrompt,
        style: currentProject.style,
        language: 'zh',
      });

      set((state) => ({
        currentProject: {
          ...state.currentProject,
          enhancedPrompt: response.enhancedPrompt,
        },
        isLoading: false,
      }));

      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'AI增强失败';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * 设置增强后的描述
   * Set enhanced prompt (for manual editing)
   */
  setEnhancedPrompt: (prompt: string) => {
    set((state) => ({
      currentProject: { ...state.currentProject, enhancedPrompt: prompt },
    }));
  },

  /**
   * 生成分镜
   * Generate storyboard from enhanced prompt
   */
  generateStoryboard: async () => {
    const { currentProject } = get();
    if (!currentProject.enhancedPrompt) {
      throw new Error('请先进行AI增强');
    }

    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.generateStoryboard({
        enhancedPrompt: currentProject.enhancedPrompt,
        sceneCount: 3,
      });

      const storyboards: Storyboard[] = response.scenes.map((scene, index) => ({
        id: `temp-${index}`,
        projectId: '',
        sceneIndex: scene.index,
        prompt: scene.prompt,
        duration: scene.duration,
        cameraType: scene.camera,
        movement: scene.movement,
        videoClipUrl: null,
        thumbnailUrl: null,
        status: 'pending',
      }));

      set((state) => ({
        currentProject: {
          ...state.currentProject,
          storyboards,
        },
        isLoading: false,
      }));

      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || '生成分镜失败';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * 更新分镜
   * Update a storyboard scene
   */
  updateStoryboard: (index: number, updates: Partial<Storyboard>) => {
    set((state) => ({
      currentProject: {
        ...state.currentProject,
        storyboards: state.currentProject.storyboards.map((sb, i) =>
          i === index ? { ...sb, ...updates } : sb
        ),
      },
    }));
  },

  /**
   * 设置视频风格
   * Set video style template
   */
  setStyle: (style: VideoStyle) => {
    set((state) => ({
      currentProject: { ...state.currentProject, style },
    }));
  },

  /**
   * 设置画面比例
   * Set aspect ratio
   */
  setAspectRatio: (aspectRatio: AspectRatio) => {
    set((state) => ({
      currentProject: { ...state.currentProject, aspectRatio },
    }));
  },

  /**
   * 设置配音配置
   * Set voice configuration
   */
  setVoiceConfig: (voiceConfig: VoiceConfig) => {
    set((state) => ({
      currentProject: { ...state.currentProject, voiceConfig },
    }));
  },

  /**
   * 设置配乐配置
   * Set music configuration
   */
  setMusicConfig: (musicConfig: MusicConfig) => {
    set((state) => ({
      currentProject: { ...state.currentProject, musicConfig },
    }));
  },

  /**
   * 开始生成视频
   * Start video generation
   */
  startGeneration: async () => {
    const { currentProject } = get();
    set({ isLoading: true, isGenerating: true, error: null });

    try {
      // 1. 创建项目
      const project = await apiClient.createProject({
        title: currentProject.originalPrompt.slice(0, 20) + '...',
        originalPrompt: currentProject.originalPrompt,
        enhancedPrompt: currentProject.enhancedPrompt || undefined,
        styleTemplate: currentProject.style,
        aspectRatio: currentProject.aspectRatio,
        voiceConfig: currentProject.voiceConfig,
        musicConfig: currentProject.musicConfig,
      });

      // 2. 开始生成
      const { taskId } = await apiClient.startGeneration(project.id);

      set({
        isLoading: false,
        generationProgress: {
          projectId: project.id,
          status: 'queued',
          progress: 0,
          currentStep: 'queued',
          steps: [],
          estimatedRemaining: null,
        },
      });

      return project.id;
    } catch (error: any) {
      const message = error.response?.data?.message || '创建任务失败';
      set({ isLoading: false, isGenerating: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * 更新生成进度
   * Update generation progress (from WebSocket)
   */
  updateProgress: (progress: GenerationProgress) => {
    set({ generationProgress: progress });

    if (progress.status === 'completed' || progress.status === 'failed') {
      set({ isGenerating: false });
    }
  },

  /**
   * 重置当前项目
   * Reset current project state
   */
  resetCurrentProject: () => {
    set({
      currentProject: { ...initialCurrentProject },
      generationProgress: null,
      isGenerating: false,
    });
  },

  /**
   * 清除错误
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));

