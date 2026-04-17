/**
 * VidCraft AI - 登录/注册页面
 * Login and registration screen with phone verification
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';

type AuthMode = 'login' | 'register';
type LoginType = 'password' | 'code';

/**
 * 登录/注册页面
 * Handles user authentication with phone number
 */
export const LoginScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginType, setLoginType] = useState<LoginType>('code');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { sendCode, login, register, isLoading, error, clearError } = useAuthStore();

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 验证手机号
  const isValidPhone = (phone: string): boolean => {
    return /^1[3-9]\d{9}$/.test(phone);
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (!isValidPhone(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    try {
      await sendCode(phone, mode);
      setCountdown(60);
      Alert.alert('成功', '验证码已发送');
    } catch (err: any) {
      Alert.alert('错误', err.message);
    }
  };

  // 登录
  const handleLogin = async () => {
    if (!isValidPhone(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    const credential = loginType === 'code' ? code : password;
    if (!credential) {
      Alert.alert('提示', loginType === 'code' ? '请输入验证码' : '请输入密码');
      return;
    }

    try {
      await login(phone, credential, loginType);
    } catch (err: any) {
      Alert.alert('登录失败', err.message);
    }
  };

  // 注册
  const handleRegister = async () => {
    if (!isValidPhone(phone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    if (code.length !== 6) {
      Alert.alert('提示', '请输入6位验证码');
      return;
    }

    if (password.length < 8 || password.length > 20) {
      Alert.alert('提示', '密码长度需要8-20位');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    try {
      await register(phone, code, password);
    } catch (err: any) {
      Alert.alert('注册失败', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🎬</Text>
            <Text style={styles.logoText}>VidCraft AI</Text>
            <Text style={styles.logoSubtext}>让想象变成视频</Text>
          </View>

          {/* 切换标签 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => {
                setMode('login');
                clearError();
              }}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                登录
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'register' && styles.tabActive]}
              onPress={() => {
                setMode('register');
                clearError();
              }}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                注册
              </Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.formCard} elevated>
            {/* 手机号输入 */}
            <Input
              label="手机号"
              placeholder="请输入手机号"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
            />

            {/* 验证码输入 */}
            {(mode === 'register' || loginType === 'code') && (
              <Input
                label="验证码"
                placeholder="请输入验证码"
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
                maxLength={6}
                rightAction={{
                  text: countdown > 0 ? `${countdown}s` : '获取验证码',
                  onPress: handleSendCode,
                  disabled: countdown > 0 || !isValidPhone(phone),
                }}
              />
            )}

            {/* 密码输入 */}
            {(mode === 'register' || loginType === 'password') && (
              <Input
                label="密码"
                placeholder={mode === 'register' ? '请设置密码 (8-20位)' : '请输入密码'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                maxLength={20}
              />
            )}

            {/* 确认密码 - 仅注册 */}
            {mode === 'register' && (
              <Input
                label="确认密码"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                maxLength={20}
              />
            )}

            {/* 登录方式切换 - 仅登录 */}
            {mode === 'login' && (
              <TouchableOpacity
                style={styles.switchLoginType}
                onPress={() => setLoginType(loginType === 'code' ? 'password' : 'code')}
              >
                <Text style={styles.switchLoginTypeText}>
                  {loginType === 'code' ? '使用密码登录' : '使用验证码登录'}
                </Text>
              </TouchableOpacity>
            )}

            {/* 错误提示 */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* 提交按钮 */}
            <Button
              title={mode === 'login' ? '登录' : '注册'}
              onPress={mode === 'login' ? handleLogin : handleRegister}
              loading={isLoading}
              fullWidth
              size="large"
            />
          </Card>

          {/* 其他登录方式 */}
          <View style={styles.otherMethods}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>其他方式</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialIcon}>💬</Text>
                <Text style={styles.socialText}>微信</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialIcon}>🍎</Text>
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 用户协议 */}
          <Text style={styles.agreement}>
            登录即表示同意
            <Text style={styles.link}>《用户协议》</Text>
            和
            <Text style={styles.link}>《隐私政策》</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  logoSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  formCard: {
    marginBottom: 24,
  },
  switchLoginType: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  switchLoginTypeText: {
    fontSize: 14,
    color: '#6366F1',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  otherMethods: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  socialButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    minWidth: 80,
  },
  socialIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  socialText: {
    fontSize: 12,
    color: '#6B7280',
  },
  agreement: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  link: {
    color: '#6366F1',
  },
});

export default LoginScreen;
