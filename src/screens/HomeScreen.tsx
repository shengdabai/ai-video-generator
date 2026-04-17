/**
 * VidCraft AI - 首页
 * Home screen with quick create and recent works
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';

/** 灵感模板 */
const TEMPLATES = [
  { id: '1', icon: '🎬', title: '电影预告片', description: '电影级叙事' },
  { id: '2', icon: '📱', title: '短视频种草', description: '社交媒体爆款' },
  { id: '3', icon: '📚', title: '教育演示', description: '可视化讲解' },
  { id: '4', icon: '🛍️', title: '产品展示', description: '精美产品视频' },
];

/**
 * 首页
 * Main home screen with quick actions
 */
export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { projects, resetCurrentProject } = useProjectStore();

  /**
   * 开始创作
   * Navigate to create screen
   */
  const handleCreate = () => {
    resetCurrentProject();
    navigation.navigate('Create' as never);
  };

  /**
   * 查看项目详情
   * Navigate to project detail
   */
  const handleProjectPress = (projectId: string) => {
    (navigation as any).navigate('ProjectDetail', { projectId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 头部问候 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.nickname || '创作者'}! 👋</Text>
            <Text style={styles.subtitle}>今天想创作什么视频？</Text>
          </View>
          <TouchableOpacity style={styles.creditsContainer}>
            <Text style={styles.creditsIcon}>💎</Text>
            <Text style={styles.creditsText}>{user?.credits || 0}</Text>
          </TouchableOpacity>
        </View>

        {/* 快速创作卡片 */}
        <Card style={styles.createCard} elevated>
          <View style={styles.createContent}>
            <Text style={styles.createIcon}>✨</Text>
            <Text style={styles.createTitle}>开始创作新视频</Text>
            <Text style={styles.createDescription}>
              输入你的想法，AI 帮你实现
            </Text>
          </View>
          <Button
            title="智能生成"
            onPress={handleCreate}
            fullWidth
            size="large"
          />
        </Card>

        {/* 灵感模板 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📝 灵感模板</Text>
            <TouchableOpacity>
              <Text style={styles.seeMore}>查看更多</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templatesContainer}
          >
            {TEMPLATES.map((template) => (
              <Card
                key={template.id}
                style={styles.templateCard}
                onPress={() => {
                  // TODO: Apply template
                  handleCreate();
                }}
              >
                <Text style={styles.templateIcon}>{template.icon}</Text>
                <Text style={styles.templateTitle}>{template.title}</Text>
                <Text style={styles.templateDescription}>
                  {template.description}
                </Text>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* 最近作品 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎬 最近作品</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Works' as never)}
            >
              <Text style={styles.seeMore}>查看全部</Text>
            </TouchableOpacity>
          </View>

          {projects.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🎥</Text>
              <Text style={styles.emptyText}>还没有作品</Text>
              <Text style={styles.emptySubtext}>开始创作你的第一个视频吧</Text>
            </Card>
          ) : (
            <View style={styles.projectsGrid}>
              {projects.slice(0, 4).map((project) => (
                <Card
                  key={project.id}
                  style={styles.projectCard}
                  onPress={() => handleProjectPress(project.id)}
                  padding="none"
                >
                  <View style={styles.projectThumbnail}>
                    {project.thumbnailUrl ? (
                      <Image
                        source={{ uri: project.thumbnailUrl }}
                        style={styles.thumbnailImage}
                      />
                    ) : (
                      <View style={styles.thumbnailPlaceholder}>
                        <Text style={styles.thumbnailIcon}>
                          {project.status === 'processing' ? '🔄' : '🎬'}
                        </Text>
                      </View>
                    )}
                    {project.status === 'completed' && project.duration && (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>
                          {Math.floor(project.duration / 60)}:
                          {String(project.duration % 60).padStart(2, '0')}
                        </Text>
                      </View>
                    )}
                    {project.status === 'processing' && (
                      <View style={styles.processingBadge}>
                        <Text style={styles.processingText}>生成中...</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectTitle} numberOfLines={1}>
                      {project.title}
                    </Text>
                    <Text style={styles.projectDate}>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  creditsIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  creditsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  createCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#6366F1',
    padding: 20,
  },
  createContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  createIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  createTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  seeMore: {
    fontSize: 14,
    color: '#6366F1',
  },
  templatesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  templateCard: {
    width: 140,
    marginRight: 12,
    alignItems: 'center',
  },
  templateIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  templateDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyCard: {
    marginHorizontal: 16,
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
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  projectCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 12,
    overflow: 'hidden',
  },
  projectThumbnail: {
    height: 100,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailIcon: {
    fontSize: 32,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  processingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#6366F1',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  processingText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  projectInfo: {
    padding: 12,
  },
  projectTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  projectDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default HomeScreen;

