import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useProjectStore } from '@/store/projectStore';
import { VideoStyle, AspectRatio } from '@/types';

const STYLE_TEMPLATES: Array<{ id: VideoStyle; icon: string; name: string }> = [
  { id: 'cinematic', icon: '🎬', name: '电影质感' },
  { id: 'japanese', icon: '🌸', name: '日系治愈' },
  { id: 'cyberpunk', icon: '🤖', name: '赛博朋克' },
  { id: 'anime', icon: '🎨', name: '动画卡通' },
  { id: 'business', icon: '💼', name: '商务专业' },
  { id: 'vintage', icon: '📷', name: '复古胶片' },
  { id: 'nature', icon: '🌿', name: '自然纪录' },
  { id: 'minimal', icon: '⚪', name: '极简主义' },
];

const ASPECT_RATIOS: Array<{ id: AspectRatio; label: string; desc: string }> = [
  { id: '16:9', label: '16:9', desc: '横屏' },
  { id: '9:16', label: '9:16', desc: '竖屏' },
  { id: '1:1', label: '1:1', desc: '方形' },
  { id: '4:3', label: '4:3', desc: '传统' },
];

export const StyleSelectScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentProject, setStyle, setAspectRatio, isLoading } = useProjectStore();

  const handleNext = () => {
    navigation.navigate('AudioConfig' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step 3.5/4</Text>
          <Text style={styles.stepTitle}>选择视频风格</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '87%' }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>🎨 视觉风格</Text>
        <View style={styles.styleGrid}>
          {STYLE_TEMPLATES.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.styleItem,
                currentProject.style === style.id && styles.styleItemSelected,
              ]}
              onPress={() => setStyle(style.id)}
            >
              <Text style={styles.styleIcon}>{style.icon}</Text>
              <Text style={styles.styleName}>{style.name}</Text>
              {currentProject.style === style.id && (
                <View style={styles.checkMark}>
                  <Text style={styles.checkMarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>📐 画面比例</Text>
        <View style={styles.ratioRow}>
          {ASPECT_RATIOS.map((ratio) => (
            <TouchableOpacity
              key={ratio.id}
              style={[
                styles.ratioItem,
                currentProject.aspectRatio === ratio.id && styles.ratioItemSelected,
              ]}
              onPress={() => setAspectRatio(ratio.id)}
            >
              <Text style={styles.ratioLabel}>{ratio.label}</Text>
              <Text style={styles.ratioDesc}>{ratio.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={styles.previewCard}>
          <Text style={styles.previewTitle}>预览效果</Text>
          <View style={styles.previewBox}>
            <Text style={styles.previewIcon}>
              {STYLE_TEMPLATES.find((s) => s.id === currentProject.style)?.icon || '🎬'}
            </Text>
            <Text style={styles.previewStyle}>
              {STYLE_TEMPLATES.find((s) => s.id === currentProject.style)?.name}
            </Text>
            <Text style={styles.previewRatio}>{currentProject.aspectRatio}</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button
          title="下一步：配音配乐 →"
          onPress={handleNext}
          loading={isLoading}
          fullWidth
          size="large"
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  stepIndicator: {
    marginBottom: 24,
  },
  stepText: {
    fontSize: 14,
    color: '#6B7280',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  styleItem: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  styleItemSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  styleIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  styleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  checkMark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratioRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  ratioItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ratioItemSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  ratioLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  ratioDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  previewCard: {
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  previewBox: {
    height: 160,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  previewStyle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  previewRatio: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

export default StyleSelectScreen;
