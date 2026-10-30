import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Share,
  SafeAreaView,
} from 'react-native';

import { useRoute } from '@react-navigation/native';
import { VideoPlayer } from '@/components/VideoPlayer';
import apiClient from '@/services/api';
import { VideoProject } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
}

export const PreviewScreen: React.FC = () => {
  const route = useRoute();
  const projectId = (route.params as { projectId?: string } | undefined)?.projectId;
  const [project, setProject] = useState<VideoProject | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setProject(null);
    setError(null);
    if (!projectId) { setError('缺少项目编号'); return; }
    apiClient.getProject(projectId).then((value) => {
      if (active) setProject(value);
    }).catch(() => { if (active) setError('加载视频失败，请返回后重试'); });
    return () => { active = false; };
  }, [projectId]);
  const videoData = { title: project?.title || '视频预览', createdAt: project?.createdAt || '' };

  const handleQuickAction = (action: string) => {
    Alert.alert(`${action}`, `${action}功能开发中...`);
  };

  const handleSaveToAlbum = async () => {
    Alert.alert('暂不可用', '相册保存尚未接入，视频未保存');
  };

  const handleShare = async () => {
    if (!project?.videoUrl) return;
    try {
      await Share.share({
        message: `${project?.generationMode === 'demo' ? 'VidCraft AI 演示示例' : videoData.title}：${project?.videoUrl}`,
        url: project?.videoUrl || undefined,
        title: videoData.title,
      });
    } catch (error) {
      Alert.alert('分享失败', '请稍后重试');
    }
  };

  const quickActions: QuickAction[] = [
    { id: 'filter', icon: '🎨', label: '滤镜', onPress: () => handleQuickAction('滤镜') },
    { id: 'crop', icon: '✂️', label: '裁剪', onPress: () => handleQuickAction('裁剪') },
    { id: 'subtitle', icon: '🔤', label: '字幕', onPress: () => handleQuickAction('字幕') },
    { id: 'music', icon: '🎵', label: '配乐', onPress: () => handleQuickAction('配乐') },
    { id: 'ratio', icon: '📐', label: '比例', onPress: () => handleQuickAction('比例') },
    { id: 'regenerate', icon: '🔄', label: '重生成', onPress: () => handleQuickAction('重生成') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.playerContainer}>
          {project?.videoUrl ? (
            <VideoPlayer key={projectId} uri={project.videoUrl} style={styles.videoPlaceholder}
              onError={() => setError('视频播放失败，请稍后重试')} />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text>{error || (project ? '项目尚无可播放视频' : '加载中...')}</Text>
            </View>
          )}
        </View>
        {error && project?.videoUrl && <Text accessibilityRole="alert">{error}</Text>}
        {project?.generationMode === 'demo' && <Text>演示模式：此处播放示例视频，演示任务不扣额度。</Text>}

        <View style={styles.infoContainer}>
          <Text style={styles.videoTitle}>{videoData.title}</Text>
          <Text style={styles.videoDate}>创建于 {videoData.createdAt}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>快捷操作</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionItem}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.quickActionIcon}>
                  <Text style={styles.quickActionIconText}>{action.icon}</Text>
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSaveToAlbum}
            disabled={!project?.videoUrl}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonIcon}>💾</Text>
            <Text style={styles.saveButtonText}>
              相册保存暂未接入
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            disabled={!project?.videoUrl}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Text style={styles.shareButtonIcon}>📤</Text>
            <Text style={styles.shareButtonText}>分享到社交平台</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  playerContainer: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#1F2937',
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  videoPlaceholderLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playButtonIcon: {
    fontSize: 28,
    marginLeft: 4,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  progressBarWrapper: {
    height: 20,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  progressThumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366F1',
    marginRight: -6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  timeContainer: {
    marginTop: 4,
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  videoDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  quickActionsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickActionItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionIconText: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 14,
    color: '#374151',
  },
  actionButtonsContainer: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: '#6366F1',
  },
  saveButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shareButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default PreviewScreen;
