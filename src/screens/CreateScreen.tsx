/**
 * VidCraft AI - 创作页面
 * Video creation screen with prompt input
 */

import React, { useState } from 'react';
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
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useProjectStore } from '@/store/projectStore';

/** 灵感标签 */
const INSPIRATION_TAGS = [
  { icon: '🌅', label: '自然', category: 'nature' },
  { icon: '🏙️', label: '城市', category: 'city' },
  { icon: '🎬', label: '电影', category: 'cinematic' },
  { icon: '🛍️', label: '产品', category: 'product' },
  { icon: '📚', label: '教育', category: 'education' },
  { icon: '🎭', label: '故事', category: 'story' },
  { icon: '🎨', label: '艺术', category: 'art' },
  { icon: '🎮', label: '游戏', category: 'game' },
];

/** 示例提示词 */
const EXAMPLE_PROMPTS: Record<string, string> = {
  nature: '清晨的山间湖泊，薄雾缭绕，阳光穿透云层洒在水面上，倒映着远处的雪山',
  city: '繁华的东京街头，霓虹灯闪烁，行人匆匆，雨滴从天而降，灯光在水洼中晕染开来',
  cinematic: '一位孤独的旅人走在沙漠中，夕阳西下，他的剪影拉得很长，远处是若隐若现的金字塔',
  product: '一款精致的手表在黑色大理石台面上缓缓旋转，周围有优雅的光影流动',
  education: '地球在太空中缓缓自转，可以看到云层的流动和大陆的轮廓，镜头逐渐拉近',
  story: '古老的城堡在月光下显得神秘而庄严，猫头鹰从塔楼飞过，远处传来钟声',
  art: '梵高星空风格的夜晚，漩涡状的云彩在天空流动，柏树随风摇曳',
  game: '科幻风格的太空站内部，全息屏幕闪烁，机器人穿梭其中，充满未来感',
};

/**
 * 创作页面
 * Main screen for video creation flow
 */
export const CreateScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentProject, setOriginalPrompt, enhancePrompt, isLoading, error } =
    useProjectStore();
  const [prompt, setPrompt] = useState(currentProject.originalPrompt);

  /**
   * 选择灵感标签
   * Select inspiration tag to auto-fill example prompt
   */
  const handleTagPress = (category: string) => {
    const example = EXAMPLE_PROMPTS[category];
    if (example) {
      setPrompt(example);
    }
  };

  /**
   * 提交进行AI增强
   * Submit prompt for AI enhancement
   */
  const handleSubmit = async () => {
    if (prompt.trim().length < 10) {
      Alert.alert('提示', '请输入至少10个字的场景描述');
      return;
    }

    setOriginalPrompt(prompt.trim());

    try {
      await enhancePrompt();
      // Navigate to enhance confirmation screen
      navigation.navigate('EnhanceConfirm' as never);
    } catch (err: any) {
      Alert.alert('错误', err.message || 'AI增强失败，请重试');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 步骤指示器 */}
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step 1/4</Text>
          <Text style={styles.stepTitle}>描述你的视频</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
        </View>

        {/* 输入区域 */}
        <Card style={styles.inputCard} elevated>
          <Input
            placeholder="描述你想要的视频场景..."
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={6}
            maxLength={500}
            helper="描述越详细，生成效果越好"
            inputStyle={styles.promptInput}
          />
        </Card>

        {/* 提示 */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            提示：描述场景、人物、氛围、情绪、镜头运动
          </Text>
        </View>

        {/* 灵感标签 */}
        <Text style={styles.sectionTitle}>快速灵感</Text>
        <View style={styles.tagsContainer}>
          {INSPIRATION_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag.category}
              style={styles.tag}
              onPress={() => handleTagPress(tag.category)}
            >
              <Text style={styles.tagIcon}>{tag.icon}</Text>
              <Text style={styles.tagLabel}>{tag.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 错误提示 */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* 底部按钮 */}
      <View style={styles.bottomContainer}>
        <Button
          title="✨ 智能增强，生成脚本"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={prompt.trim().length < 10}
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
  inputCard: {
    marginBottom: 16,
  },
  promptInput: {
    minHeight: 120,
    fontSize: 16,
    lineHeight: 24,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  tagIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tagLabel: {
    fontSize: 14,
    color: '#374151',
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
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

export default CreateScreen;

