/**
 * VidCraft AI - 生成进度页面
 * Video generation progress screen
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from '@/components/ui/Button';
import { ProgressTracker } from '@/components/ProgressTracker';
import { useProjectStore } from '@/store/projectStore';
import apiClient from '@/services/api';

/**
 * 生成进度页面
 * Displays real-time video generation progress
 */
export const ProgressScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId } = route.params as { projectId: string };
  
  const { generationProgress, updateProgress, isGenerating } = useProjectStore();
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  
  // 动画
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  /**
   * 启动动画
   * Start loading animations
   */
  useEffect(() => {
    // 旋转动画
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 脉冲动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /**
   * 轮询进度
   * Poll for generation progress
   */
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pollProgress = async () => {
      try {
        const progress = await apiClient.getProgress(projectId);
        updateProgress(progress);

        // 更新预计时间
        if (progress.estimatedRemaining) {
          const minutes = Math.floor(progress.estimatedRemaining / 60);
          const seconds = progress.estimatedRemaining % 60;
          setEstimatedTime(`${minutes}分${seconds}秒`);
        }

        // 完成或失败时跳转
        if (progress.status === 'completed') {
          clearInterval(intervalId);
          (navigation as any).navigate('Preview', { projectId });
        } else if (progress.status === 'failed') {
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Failed to poll progress:', error);
      }
    };

    // 立即执行一次
    pollProgress();

    // 每3秒轮询一次
    intervalId = setInterval(pollProgress, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [projectId]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  /**
   * 返回首页
   * Navigate back to home
   */
  const handleGoHome = () => {
    navigation.navigate('Home' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 动画图标 */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ rotate: rotation }, { scale: pulseAnim }],
            },
          ]}
        >
          <Text style={styles.icon}>🎬</Text>
        </Animated.View>

        {/* 标题 */}
        <Text style={styles.title}>AI 正在为您创作...</Text>
        <Text style={styles.subtitle}>这可能需要几分钟时间</Text>

        {/* 进度追踪器 */}
        {generationProgress && (
          <View style={styles.progressContainer}>
            <ProgressTracker
              progress={generationProgress}
              estimatedTime={estimatedTime}
            />
          </View>
        )}

        {/* 提示 */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            生成过程中您可以切换到其他页面，完成后会通知您
          </Text>
        </View>
      </View>

      {/* 底部按钮 */}
      <View style={styles.bottomContainer}>
        <Button
          title="🏠 返回首页"
          onPress={handleGoHome}
          variant="secondary"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  progressContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 24,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

export default ProgressScreen;

