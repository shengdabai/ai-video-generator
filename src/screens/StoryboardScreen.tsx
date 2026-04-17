import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useProjectStore } from '@/store/projectStore';

const SCENE_ICONS = ['🌅', '🎬', '✨', '🏙️', '🌸', '🎭'];

export const StoryboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentProject, updateStoryboard, isLoading } = useProjectStore();
  const { storyboards } = currentProject;

  const totalDuration = storyboards.reduce((sum, sb) => sum + sb.duration, 0);

  const handleEdit = (index: number) => {
    Alert.prompt(
      '编辑分镜描述',
      '修改这个分镜的场景描述',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '保存',
          onPress: (text) => {
            if (text) {
              updateStoryboard(index, { prompt: text });
            }
          },
        },
      ],
      'plain-text',
      storyboards[index].prompt
    );
  };

  const handleDelete = (index: number) => {
    Alert.alert('删除分镜', '确定要删除这个分镜吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          const newStoryboards = [...storyboards];
          newStoryboards.splice(index, 1);
        },
      },
    ]);
  };

  const handleNext = () => {
    navigation.navigate('StyleSelect' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step 3/4</Text>
          <Text style={styles.stepTitle}>编辑分镜脚本</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            总时长: {totalDuration}秒 | 共 {storyboards.length} 个分镜
          </Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ 添加</Text>
          </TouchableOpacity>
        </View>

        {storyboards.map((storyboard, index) => (
          <Card key={storyboard.id} style={styles.storyboardCard}>
            <View style={styles.storyboardHeader}>
              <View style={styles.sceneNumber}>
                <Text style={styles.sceneNumberText}>分镜 {index + 1}</Text>
              </View>
              <Text style={styles.durationText}>{storyboard.duration}秒</Text>
            </View>

            <View style={styles.previewBox}>
              <Text style={styles.previewIcon}>
                {SCENE_ICONS[index % SCENE_ICONS.length]}
              </Text>
              <Text style={styles.previewHint}>点击生成预览图</Text>
            </View>

            <Text style={styles.promptText}>{storyboard.prompt}</Text>

            {storyboard.cameraType && (
              <View style={styles.metaRow}>
                <View style={styles.metaTag}>
                  <Text style={styles.metaTagText}>📷 {storyboard.cameraType}</Text>
                </View>
                {storyboard.movement && (
                  <View style={styles.metaTag}>
                    <Text style={styles.metaTagText}>🎬 {storyboard.movement}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit(index)}
              >
                <Text style={styles.actionButtonText}>✏️ 编辑</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(index)}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  🗑️ 删除
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {storyboards.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎞️</Text>
            <Text style={styles.emptyText}>暂无分镜</Text>
            <Text style={styles.emptySubtext}>请先完成AI增强步骤</Text>
          </Card>
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button
          title="下一步：选择风格 →"
          onPress={handleNext}
          loading={isLoading}
          disabled={storyboards.length === 0}
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  storyboardCard: {
    marginBottom: 16,
  },
  storyboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sceneNumber: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sceneNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  durationText: {
    fontSize: 13,
    color: '#6B7280',
  },
  previewBox: {
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  previewIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  previewHint: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  promptText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metaTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaTagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    color: '#DC2626',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
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

export default StoryboardScreen;
