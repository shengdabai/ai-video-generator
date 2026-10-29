/**
 * VidCraft AI - 生成进度页面
 * Video generation progress screen
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Button } from '@/components/ui/Button';
import { ProgressTracker } from '@/components/ProgressTracker';
import { useProjectStore } from '@/store/projectStore';
import apiClient from '@/services/api';
import { pollGenerationProgress } from '@/utils/pollGenerationProgress';

/**
 * 生成进度页面
 * Displays real-time video generation progress
 */
export const ProgressScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId } = route.params as { projectId: string };
  
  const { generationProgress, updateProgress } = useProjectStore();
  const [estimatedTime, setEstimatedTime] = useState<string>('');
  const [pollError, setPollError] = useState(false);
  const projectProgress = generationProgress?.projectId === projectId ? generationProgress : null;
  
  // 动画
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  /**
   * 启动动画
   * Start loading animations
   */
  useEffect(() => {
    // 旋转动画
    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotation.start();

    // 脉冲动画
    const pulse = Animated.loop(
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
    );
    pulse.start();
    return () => {
      rotation.stop();
      pulse.stop();
    };
  }, [rotateAnim, pulseAnim]);

  /**
   * 轮询进度
   * Poll for generation progress
   */
  useFocusEffect(useCallback(() => {
    setEstimatedTime('');
    setPollError(false);
    return pollGenerationProgress(projectId, {
      getProgress: (id) => apiClient.getProgress(id),
      onProgress: (progress) => {
        updateProgress(progress);
        setPollError(false);
        if (progress.estimatedRemaining != null) {
          const minutes = Math.floor(progress.estimatedRemaining / 60);
          const seconds = progress.estimatedRemaining % 60;
          setEstimatedTime(`${minutes}分${seconds}秒`);
        } else {
          setEstimatedTime('');
        }
      },
      onCompleted: () => (navigation as any).replace('Preview', { projectId }),
      onError: () => {
        setPollError(true);
        setEstimatedTime('');
      },
    });
  }, [projectId, navigation, updateProgress]));

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  /**
   * 返回首页
   * Navigate back to home
   */
  const handleGoHome = () => {
    (navigation as any).navigate('Main', { screen: 'Home' });
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
        <Text style={styles.title}>
          {projectProgress?.status === 'failed' ? '视频生成失败' : 'AI 正在为您创作...'}
        </Text>
        <Text style={styles.subtitle}>
          {projectProgress?.status === 'failed'
            ? '请返回首页查看项目'
            : pollError ? '暂时无法获取进度，正在重试' : '这可能需要几分钟时间'}
        </Text>

        {/* 进度追踪器 */}
        {projectProgress && (
          <View style={styles.progressContainer}>
            <ProgressTracker
              progress={projectProgress}
              estimatedTime={estimatedTime}
            />
          </View>
        )}

        {/* 提示 */}
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            离开此页后，服务端会继续处理生成任务；返回此页后会刷新进度。
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

