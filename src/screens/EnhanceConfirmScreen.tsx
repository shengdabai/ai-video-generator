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
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useProjectStore } from '@/store/projectStore';

export const EnhanceConfirmScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    currentProject,
    setEnhancedPrompt,
    generateStoryboard,
    enhancePrompt,
    isLoading,
    error,
  } = useProjectStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(currentProject.enhancedPrompt || '');

  const handleRegenerate = async () => {
    try {
      await enhancePrompt();
      setEditedPrompt(currentProject.enhancedPrompt || '');
    } catch (err: any) {
      Alert.alert('错误', err.message);
    }
  };

  const handleConfirm = async () => {
    if (isEditing) {
      setEnhancedPrompt(editedPrompt);
      setIsEditing(false);
    }

    try {
      await generateStoryboard();
      navigation.navigate('Storyboard' as never);
    } catch (err: any) {
      Alert.alert('错误', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step 2/4</Text>
          <Text style={styles.stepTitle}>确认增强后的描述</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>

        <Card style={styles.originalCard}>
          <Text style={styles.cardLabel}>原始描述</Text>
          <Text style={styles.originalText}>{currentProject.originalPrompt}</Text>
        </Card>

        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>⬇️</Text>
          <Text style={styles.arrowText}>AI 已为您增强</Text>
        </View>

        <Card style={styles.enhancedCard} elevated>
          <View style={styles.enhancedHeader}>
            <Text style={styles.enhancedLabel}>✨ 增强后描述</Text>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? '完成' : '编辑'}
              </Text>
            </TouchableOpacity>
          </View>
          {isEditing ? (
            <View style={styles.editContainer}>
              <Text style={styles.enhancedText}>{editedPrompt}</Text>
            </View>
          ) : (
            <Text style={styles.enhancedText}>
              {currentProject.enhancedPrompt}
            </Text>
          )}
        </Card>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>🎬</Text>
            <Text style={styles.statLabel}>电影质感</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statLabel}>45秒</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statIcon}>🎞️</Text>
            <Text style={styles.statLabel}>3个分镜</Text>
          </Card>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <View style={styles.buttonRow}>
          <Button
            title="🔄 重新生成"
            onPress={handleRegenerate}
            variant="secondary"
            loading={isLoading}
            style={styles.halfButton}
          />
          <Button
            title="✓ 确认并继续"
            onPress={handleConfirm}
            loading={isLoading}
            style={styles.halfButton}
          />
        </View>
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
  originalCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  originalText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  arrowContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  arrow: {
    fontSize: 24,
  },
  arrowText: {
    fontSize: 14,
    color: '#6366F1',
    marginTop: 4,
  },
  enhancedCard: {
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  enhancedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  enhancedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: '#6366F1',
  },
  editContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  enhancedText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 26,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
});

export default EnhanceConfirmScreen;
