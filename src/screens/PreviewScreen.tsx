import React, { useState } from 'react';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
}

export const PreviewScreen: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(28);
  const [duration] = useState(45);
  const [isSaving, setIsSaving] = useState(false);

  const videoData = {
    title: '城市夜雨漫步',
    createdAt: '2024-01-15 14:30',
    thumbnail: null,
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (progress: number) => {
    setCurrentTime(Math.floor(progress * duration));
  };

  const handleQuickAction = (action: string) => {
    Alert.alert(`${action}`, `${action}功能开发中...`);
  };

  const handleSaveToAlbum = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert('保存成功', '视频已保存到相册');
    }, 1500);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `来看看我用 VidCraft AI 创作的视频：${videoData.title}`,
        title: videoData.title,
      });
    } catch (error) {
      console.error('Share error:', error);
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

  const progress = currentTime / duration;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.playerContainer}>
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoPlaceholderText}>📹</Text>
            <Text style={styles.videoPlaceholderLabel}>视频播放区域</Text>
          </View>
          
          <TouchableOpacity
            style={styles.playButtonOverlay}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <View style={styles.playButton}>
              <Text style={styles.playButtonIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <TouchableOpacity
            style={styles.progressBarWrapper}
            onPress={(e: { nativeEvent: { locationX: number } }) => {
              const { locationX } = e.nativeEvent;
              const progressWidth = SCREEN_WIDTH - 32;
              handleSeek(locationX / progressWidth);
            }}
            activeOpacity={1}
          >
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]}>
                <View style={styles.progressThumb} />
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {isPlaying ? '▶️' : '⏸️'} {formatTime(currentTime)}/{formatTime(duration)}
            </Text>
          </View>
        </View>

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
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonIcon}>💾</Text>
            <Text style={styles.saveButtonText}>
              {isSaving ? '保存中...' : '保存到相册'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
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
