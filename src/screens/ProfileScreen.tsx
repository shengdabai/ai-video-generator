import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
  showArrow?: boolean;
}

export const ProfileScreen: React.FC = () => {
  const userData = {
    nickname: '用户昵称',
    phone: '138****8888',
    avatar: '👤',
    remainingCredits: 12,
    worksCount: 28,
  };

  const handleMenuItem = (item: string) => {
    Alert.alert(item, `${item}功能开发中...`);
  };

  const primaryMenuItems: MenuItem[] = [
    {
      id: 'upgrade',
      icon: '👑',
      label: '升级会员',
      onPress: () => handleMenuItem('升级会员'),
      showArrow: true,
    },
  ];

  const secondaryMenuItems: MenuItem[] = [
    { id: 'invite', icon: '🎁', label: '邀请好友', onPress: () => handleMenuItem('邀请好友'), showArrow: true },
    { id: 'favorites', icon: '⭐', label: '我的收藏', onPress: () => handleMenuItem('我的收藏'), showArrow: true },
    { id: 'history', icon: '📜', label: '历史记录', onPress: () => handleMenuItem('历史记录'), showArrow: true },
  ];

  const tertiaryMenuItems: MenuItem[] = [
    { id: 'help', icon: '❓', label: '帮助与反馈', onPress: () => handleMenuItem('帮助与反馈'), showArrow: true },
    { id: 'about', icon: '📋', label: '关于我们', onPress: () => handleMenuItem('关于我们'), showArrow: true },
    { id: 'terms', icon: '📄', label: '用户协议', onPress: () => handleMenuItem('用户协议'), showArrow: true },
  ];

  const renderMenuSection = (items: MenuItem[]) => (
    <View style={styles.menuSection}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.menuItem,
            index < items.length - 1 && styles.menuItemBorder,
          ]}
          onPress={item.onPress}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <Text style={styles.menuItemIcon}>{item.icon}</Text>
            <Text style={styles.menuItemLabel}>{item.label}</Text>
          </View>
          {item.showArrow && (
            <Text style={styles.menuItemArrow}>›</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{userData.avatar}</Text>
          </View>
          <Text style={styles.nickname}>{userData.nickname}</Text>
          <Text style={styles.phone}>{userData.phone}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💎</Text>
            <Text style={styles.statValue}>{userData.remainingCredits}次</Text>
            <Text style={styles.statLabel}>剩余次数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🎬</Text>
            <Text style={styles.statValue}>{userData.worksCount}个</Text>
            <Text style={styles.statLabel}>作品数</Text>
          </View>
        </View>

        <View style={styles.upgradeSection}>
          <TouchableOpacity 
            style={styles.upgradeCard}
            onPress={() => handleMenuItem('升级会员')}
            activeOpacity={0.8}
          >
            <View style={styles.upgradeLeft}>
              <Text style={styles.upgradeIcon}>👑</Text>
              <View>
                <Text style={styles.upgradeTitle}>升级会员</Text>
                <Text style={styles.upgradeSubtitle}>解锁更多高级功能</Text>
              </View>
            </View>
            <Text style={styles.upgradeArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {renderMenuSection(secondaryMenuItems)}
        {renderMenuSection(tertiaryMenuItems)}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 40,
  },
  nickname: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    marginTop: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
  },
  upgradeSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
  },
  upgradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  upgradeSubtitle: {
    fontSize: 12,
    color: '#B45309',
  },
  upgradeArrow: {
    fontSize: 24,
    color: '#92400E',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#374151',
  },
  menuItemArrow: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default ProfileScreen;
