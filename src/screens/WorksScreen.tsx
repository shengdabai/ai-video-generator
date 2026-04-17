import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  SafeAreaView,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

type FilterTab = 'all' | 'completed' | 'generating' | 'draft';

interface VideoWork {
  id: string;
  title: string;
  duration: string;
  createdAt: string;
  status: 'completed' | 'generating' | 'draft';
  progress?: number;
  thumbnail?: string;
}

const MOCK_WORKS: VideoWork[] = [
  { id: '1', title: '城市夜雨漫步', duration: '0:45', createdAt: '昨天', status: 'completed' },
  { id: '2', title: '海边日落', duration: '1:20', createdAt: '2天前', status: 'completed' },
  { id: '3', title: '产品展示', duration: '0:30', createdAt: '3天前', status: 'completed' },
  { id: '4', title: '新项目', duration: '', createdAt: '', status: 'generating', progress: 65 },
  { id: '5', title: '教学演示', duration: '2:15', createdAt: '1周前', status: 'completed' },
  { id: '6', title: '未完成项目', duration: '', createdAt: '2周前', status: 'draft' },
];

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'completed', label: '已完成' },
  { key: 'generating', label: '生成中' },
  { key: 'draft', label: '草稿' },
];

export const WorksScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filteredWorks = MOCK_WORKS.filter((work) => {
    if (activeFilter === 'all') return true;
    return work.status === activeFilter;
  });

  const renderWorkCard = ({ item }: { item: VideoWork }) => (
    <TouchableOpacity style={styles.workCard} activeOpacity={0.8}>
      <View style={styles.thumbnailContainer}>
        {item.status === 'completed' && (
          <>
            <View style={styles.thumbnail}>
              <Text style={styles.thumbnailIcon}>🎬</Text>
            </View>
            <View style={styles.playOverlay}>
              <Text style={styles.playIcon}>▶️</Text>
            </View>
          </>
        )}
        {item.status === 'generating' && (
          <View style={[styles.thumbnail, styles.generatingThumbnail]}>
            <Text style={styles.generatingText}>生成中</Text>
            <Text style={styles.generatingProgress}>{item.progress}%</Text>
            <View style={styles.loadingDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        )}
        {item.status === 'draft' && (
          <View style={[styles.thumbnail, styles.draftThumbnail]}>
            <Text style={styles.draftIcon}>📝</Text>
            <Text style={styles.draftText}>草稿</Text>
          </View>
        )}
      </View>
      <View style={styles.workInfo}>
        <Text style={styles.workTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.workMeta}>
          {item.status === 'completed' && `${item.duration} | ${item.createdAt}`}
          {item.status === 'generating' && '生成中...'}
          {item.status === 'draft' && `草稿 | ${item.createdAt}`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的作品</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonIcon}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab,
                activeFilter === tab.key && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === tab.key && styles.filterTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredWorks}
        renderItem={renderWorkCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.worksGrid}
        columnWrapperStyle={styles.worksRow}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyText}>暂无作品</Text>
            <Text style={styles.emptySubtext}>开始创作你的第一个视频吧</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonIcon: {
    fontSize: 20,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#6366F1',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  worksGrid: {
    padding: 16,
  },
  worksRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  workCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  thumbnail: {
    flex: 1,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailIcon: {
    fontSize: 32,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  playIcon: {
    fontSize: 24,
  },
  generatingThumbnail: {
    backgroundColor: '#EEF2FF',
  },
  generatingText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  generatingProgress: {
    fontSize: 18,
    color: '#6366F1',
    fontWeight: '600',
    marginTop: 4,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
    opacity: 0.5,
  },
  draftThumbnail: {
    backgroundColor: '#FEF3C7',
  },
  draftIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  draftText: {
    fontSize: 14,
    color: '#92400E',
  },
  workInfo: {
    padding: 12,
  },
  workTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  workMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default WorksScreen;
