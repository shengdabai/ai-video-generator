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
const TEMPLATE_WIDTH = SCREEN_WIDTH * 0.7;

interface DiscoverVideo {
  id: string;
  title: string;
  author: string;
  likes: number;
  views: number;
  thumbnail?: string;
}

interface Template {
  id: string;
  title: string;
  category: string;
  usageCount: number;
  thumbnail?: string;
}

const MOCK_HOT_VIDEOS: DiscoverVideo[] = [
  { id: '1', title: '赛博朋克城市夜景', author: '创作者A', likes: 1234, views: 5678 },
  { id: '2', title: '日落海边浪漫时刻', author: '创作者B', likes: 987, views: 4321 },
  { id: '3', title: '美食探店Vlog', author: '创作者C', likes: 2345, views: 8765 },
  { id: '4', title: '产品广告创意', author: '创作者D', likes: 567, views: 2345 },
];

const MOCK_TEMPLATES: Template[] = [
  { id: '1', title: '电影感预告片', category: '电影', usageCount: 12345 },
  { id: '2', title: '产品展示模板', category: '商业', usageCount: 8765 },
  { id: '3', title: 'Vlog开场动画', category: '生活', usageCount: 6543 },
  { id: '4', title: '教育课程片头', category: '教育', usageCount: 4321 },
];

const CATEGORIES = ['推荐', '电影感', '动画', '商业', '生活', '教育', '游戏'];

export const DiscoverScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('推荐');

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toString();
  };

  const renderHotVideoCard = ({ item }: { item: DiscoverVideo }) => (
    <TouchableOpacity style={styles.videoCard} activeOpacity={0.8}>
      <View style={styles.videoThumbnail}>
        <Text style={styles.thumbnailIcon}>🎬</Text>
        <View style={styles.playBadge}>
          <Text style={styles.playBadgeIcon}>▶</Text>
        </View>
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.videoMeta}>
          <Text style={styles.authorName}>{item.author}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statItem}>❤️ {formatNumber(item.likes)}</Text>
            <Text style={styles.statItem}>👁️ {formatNumber(item.views)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTemplateCard = ({ item }: { item: Template }) => (
    <TouchableOpacity style={styles.templateCard} activeOpacity={0.8}>
      <View style={styles.templateThumbnail}>
        <Text style={styles.templateIcon}>🎨</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.templateInfo}>
        <Text style={styles.templateTitle}>{item.title}</Text>
        <Text style={styles.templateUsage}>{formatNumber(item.usageCount)} 人使用</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>发现</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                activeCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 热门作品</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>查看更多 ›</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={MOCK_HOT_VIDEOS}
            renderItem={renderHotVideoCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.videoRow}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ 模板推荐</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>查看更多 ›</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={MOCK_TEMPLATES}
            renderItem={renderTemplateCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templateList}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📚 创作教程</Text>
          </View>
          <View style={styles.tutorialGrid}>
            {['AI 视频生成入门', '提示词技巧', '分镜设计', '配音配乐'].map((title, index) => (
              <TouchableOpacity key={index} style={styles.tutorialCard} activeOpacity={0.8}>
                <Text style={styles.tutorialIcon}>📖</Text>
                <Text style={styles.tutorialTitle}>{title}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  searchButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#6366F1',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  section: {
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366F1',
  },
  videoRow: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  videoCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  videoThumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  thumbnailIcon: {
    fontSize: 32,
  },
  playBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadgeIcon: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 20,
  },
  videoMeta: {
    gap: 4,
  },
  authorName: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  templateList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  templateCard: {
    width: TEMPLATE_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginRight: 12,
  },
  templateThumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  templateIcon: {
    fontSize: 40,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
  },
  categoryBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  templateInfo: {
    padding: 12,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  templateUsage: {
    fontSize: 12,
    color: '#6B7280',
  },
  tutorialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  tutorialCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tutorialIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  tutorialTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default DiscoverScreen;
