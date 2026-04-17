/**
 * VidCraft AI - 认证状态管理
 * Authentication state management using Zustand
 */

import { create } from 'zustand';
import { User } from '@/types';
import apiClient from '@/services/api';

interface AuthState {
  /** 当前用户 */
  user: User | null;
  /** 是否已登录 */
  isLoggedIn: boolean;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  
  // Actions
  /** 初始化认证状态 */
  initialize: () => Promise<void>;
  /** 发送验证码 */
  sendCode: (phone: string, type: 'register' | 'login' | 'reset') => Promise<void>;
  /** 注册 */
  register: (phone: string, code: string, password: string) => Promise<void>;
  /** 登录 */
  login: (phone: string, credential: string, type: 'password' | 'code') => Promise<void>;
  /** 登出 */
  logout: () => Promise<void>;
  /** 更新用户信息 */
  updateUser: (data: Partial<Pick<User, 'nickname' | 'avatarUrl'>>) => Promise<void>;
  /** 刷新用户信息 */
  refreshUser: () => Promise<void>;
  /** 清除错误 */
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  error: null,

  /**
   * 初始化认证状态
   * Initialize auth state on app start
   */
  initialize: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const loggedIn = await apiClient.isLoggedIn();
      
      if (loggedIn) {
        const user = await apiClient.getCurrentUser();
        set({ user, isLoggedIn: true, isLoading: false });
      } else {
        set({ user: null, isLoggedIn: false, isLoading: false });
      }
    } catch (error) {
      // Token 无效或过期
      await apiClient.clearTokens();
      set({ user: null, isLoggedIn: false, isLoading: false });
    }
  },

  /**
   * 发送验证码
   * Send SMS verification code
   */
  sendCode: async (phone: string, type: 'register' | 'login' | 'reset') => {
    set({ isLoading: true, error: null });
    
    try {
      await apiClient.sendVerificationCode(phone, type);
      set({ isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || '发送验证码失败，请稍后重试';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * 注册
   * Register new user
   */
  register: async (phone: string, code: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiClient.register(phone, code, password);
      set({ 
        user: response.user, 
        isLoggedIn: true, 
        isLoading: false 
      });
    } catch (error: any) {
      const message = error.response?.data?.message || '注册失败，请稍后重试';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * 登录
   * Login user
   */
  login: async (phone: string, credential: string, type: 'password' | 'code') => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiClient.login(phone, credential, type);
      set({ 
        user: response.user, 
        isLoggedIn: true, 
        isLoading: false 
      });
    } catch (error: any) {
      const message = error.response?.data?.message || '登录失败，请检查账号密码';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * 登出
   * Logout user
   */
  logout: async () => {
    set({ isLoading: true });
    
    try {
      await apiClient.logout();
    } finally {
      set({ 
        user: null, 
        isLoggedIn: false, 
        isLoading: false,
        error: null 
      });
    }
  },

  /**
   * 更新用户信息
   * Update user profile
   */
  updateUser: async (data: Partial<Pick<User, 'nickname' | 'avatarUrl'>>) => {
    set({ isLoading: true, error: null });
    
    try {
      const user = await apiClient.updateUser(data);
      set({ user, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || '更新失败，请稍后重试';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * 刷新用户信息
   * Refresh user data from server
   */
  refreshUser: async () => {
    if (!get().isLoggedIn) return;
    
    try {
      const user = await apiClient.getCurrentUser();
      set({ user });
    } catch (error) {
      // 静默失败
      console.error('Failed to refresh user:', error);
    }
  },

  /**
   * 清除错误
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));

