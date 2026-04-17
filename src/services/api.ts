/**
 * VidCraft AI - API 服务层
 * API service layer for communicating with backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  ApiResponse,
  LoginResponse,
  User,
  VideoProject,
  CreateProjectRequest,
  EnhancePromptRequest,
  EnhancePromptResponse,
  GenerateStoryboardRequest,
  GenerateStoryboardResponse,
  GenerationProgress,
  StyleTemplate,
  VoiceOption,
  MusicOption,
  PaginatedResponse,
} from '@/types';

// API 基础配置
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api/v1' 
  : 'https://api.vidcraft.ai/api/v1';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * API客户端类
 * Manages all API communications
 */
class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * 设置请求/响应拦截器
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // 请求拦截器 - 添加认证头
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器 - 处理Token刷新
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };

        // Token过期，尝试刷新（防止无限循环）
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // 刷新失败，清除Token
            await this.clearTokens();
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * 刷新Token
   * Refresh access token using refresh token
   */
  private async refreshToken(): Promise<string> {
    // 防止并发刷新
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      await this.setTokens(accessToken, newRefreshToken);
      
      return accessToken;
    })();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * 存储Token
   * Store tokens securely
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * 清除Token
   * Clear stored tokens
   */
  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }

  /**
   * 检查是否已登录
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return !!token;
  }

  // ==================== 认证相关API ====================

  /**
   * 发送验证码
   * Send SMS verification code
   */
  async sendVerificationCode(phone: string, type: 'register' | 'login' | 'reset'): Promise<void> {
    await this.client.post('/auth/send-code', { phone, type });
  }

  /**
   * 用户注册
   * Register new user
   */
  async register(phone: string, code: string, password: string): Promise<LoginResponse> {
    const response = await this.client.post<ApiResponse<LoginResponse>>('/auth/register', {
      phone,
      code,
      password,
    });
    
    const { accessToken, refreshToken } = response.data.data;
    await this.setTokens(accessToken, refreshToken);
    
    return response.data.data;
  }

  /**
   * 用户登录
   * Login with phone and password/code
   */
  async login(phone: string, credential: string, type: 'password' | 'code'): Promise<LoginResponse> {
    const response = await this.client.post<ApiResponse<LoginResponse>>('/auth/login', {
      phone,
      [type]: credential,
    });
    
    const { accessToken, refreshToken } = response.data.data;
    await this.setTokens(accessToken, refreshToken);
    
    return response.data.data;
  }

  /**
   * 登出
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      await this.clearTokens();
    }
  }

  // ==================== 用户相关API ====================

  /**
   * 获取当前用户信息
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  }

  /**
   * 更新用户信息
   * Update user profile
   */
  async updateUser(data: Partial<Pick<User, 'nickname' | 'avatarUrl'>>): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>('/users/me', data);
    return response.data.data;
  }

  /**
   * 获取用户配额
   * Get user credits
   */
  async getUserCredits(): Promise<{ credits: number; membership: string }> {
    const response = await this.client.get<ApiResponse<{ credits: number; membership: string }>>('/users/me/credits');
    return response.data.data;
  }

  // ==================== 脚本相关API ====================

  /**
   * Prompt增强
   * Enhance user prompt with AI
   */
  async enhancePrompt(request: EnhancePromptRequest): Promise<EnhancePromptResponse> {
    const response = await this.client.post<ApiResponse<EnhancePromptResponse>>('/scripts/enhance', request);
    return response.data.data;
  }

  /**
   * 生成分镜
   * Generate storyboard from enhanced prompt
   */
  async generateStoryboard(request: GenerateStoryboardRequest): Promise<GenerateStoryboardResponse> {
    const response = await this.client.post<ApiResponse<GenerateStoryboardResponse>>('/scripts/storyboard', request);
    return response.data.data;
  }

  // ==================== 视频相关API ====================

  /**
   * 创建视频项目
   * Create new video project
   */
  async createProject(request: CreateProjectRequest): Promise<VideoProject> {
    const response = await this.client.post<ApiResponse<VideoProject>>('/videos', request);
    return response.data.data;
  }

  /**
   * 获取视频列表
   * Get user's video projects
   */
  async getProjects(page = 1, pageSize = 20): Promise<PaginatedResponse<VideoProject>> {
    const response = await this.client.get<ApiResponse<PaginatedResponse<VideoProject>>>('/videos', {
      params: { page, pageSize },
    });
    return response.data.data;
  }

  /**
   * 获取视频详情
   * Get video project details
   */
  async getProject(id: string): Promise<VideoProject> {
    const response = await this.client.get<ApiResponse<VideoProject>>(`/videos/${id}`);
    return response.data.data;
  }

  /**
   * 开始生成视频
   * Start video generation
   */
  async startGeneration(projectId: string): Promise<{ taskId: string; estimatedTime: number }> {
    const response = await this.client.post<ApiResponse<{ taskId: string; estimatedTime: number }>>(
      `/videos/${projectId}/generate`
    );
    return response.data.data;
  }

  /**
   * 获取生成进度
   * Get generation progress
   */
  async getProgress(projectId: string): Promise<GenerationProgress> {
    const response = await this.client.get<ApiResponse<GenerationProgress>>(`/videos/${projectId}/progress`);
    return response.data.data;
  }

  /**
   * 删除视频
   * Delete video project
   */
  async deleteProject(id: string): Promise<void> {
    await this.client.delete(`/videos/${id}`);
  }

  // ==================== 模板相关API ====================

  /**
   * 获取风格模板
   * Get style templates
   */
  async getStyleTemplates(): Promise<StyleTemplate[]> {
    const response = await this.client.get<ApiResponse<StyleTemplate[]>>('/templates/styles');
    return response.data.data;
  }

  /**
   * 获取配音选项
   * Get voice options
   */
  async getVoiceOptions(): Promise<VoiceOption[]> {
    const response = await this.client.get<ApiResponse<VoiceOption[]>>('/templates/voices');
    return response.data.data;
  }

  /**
   * 获取音乐列表
   * Get music library
   */
  async getMusicOptions(mood?: string): Promise<MusicOption[]> {
    const response = await this.client.get<ApiResponse<MusicOption[]>>('/templates/music', {
      params: mood ? { mood } : undefined,
    });
    return response.data.data;
  }
}

// 导出单例
export const apiClient = new ApiClient();
export default apiClient;

