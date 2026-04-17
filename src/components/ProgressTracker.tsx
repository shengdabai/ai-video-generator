/**
 * VidCraft AI - 生成进度追踪组件
 * Generation progress tracker component
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { GenerationProgress, ProgressStep } from '@/types';

interface ProgressTrackerProps {
  /** 进度数据 */
  progress: GenerationProgress;
  /** 预计剩余时间格式化 */
  estimatedTime?: string;
}

/**
 * 进度追踪组件
 * Displays video generation progress with steps
 */
export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  estimatedTime,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress.progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress.progress]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  /**
   * 获取步骤图标
   * Get icon for step status
   */
  const getStepIcon = (status: string): string => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'running':
      case 'processing':
        return '🔄';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  /**
   * 获取步骤显示名称
   * Get display name for step
   */
  const getStepName = (name: string): string => {
    const nameMap: Record<string, string> = {
      analyzing: '场景分析',
      generating_scene_1: '生成分镜 1',
      generating_scene_2: '生成分镜 2',
      generating_scene_3: '生成分镜 3',
      audio_synthesis: '音频合成',
      video_composition: '视频合成',
    };
    return nameMap[name] || name;
  };

  return (
    <View style={styles.container}>
      {/* 主进度条 */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[styles.progressBar, { width: progressWidth }]}
        />
      </View>
      <Text style={styles.progressText}>{progress.progress}%</Text>

      {/* 步骤列表 */}
      <View style={styles.stepsContainer}>
        {progress.steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <Text style={styles.stepIcon}>{getStepIcon(step.status)}</Text>
            <View style={styles.stepContent}>
              <Text
                style={[
                  styles.stepName,
                  step.status === 'completed' && styles.stepNameCompleted,
                  step.status === 'running' && styles.stepNameActive,
                ]}
              >
                {getStepName(step.name)}
              </Text>
              {step.status === 'running' && (
                <Text style={styles.stepProgress}>{step.progress}%</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* 预计时间 */}
      {estimatedTime && (
        <View style={styles.estimatedContainer}>
          <Text style={styles.estimatedLabel}>预计剩余时间:</Text>
          <Text style={styles.estimatedTime}>{estimatedTime}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginTop: 16,
  },
  stepsContainer: {
    marginTop: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stepIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepName: {
    fontSize: 14,
    color: '#6B7280',
  },
  stepNameCompleted: {
    color: '#10B981',
  },
  stepNameActive: {
    color: '#6366F1',
    fontWeight: '500',
  },
  stepProgress: {
    fontSize: 12,
    color: '#6366F1',
  },
  estimatedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  estimatedLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  estimatedTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});

export default ProgressTracker;

