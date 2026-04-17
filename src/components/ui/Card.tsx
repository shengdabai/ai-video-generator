/**
 * VidCraft AI - 卡片组件
 * Reusable card component
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';

interface CardProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 是否可点击 */
  onPress?: () => void;
  /** 自定义样式 */
  style?: ViewStyle;
  /** 是否带阴影 */
  elevated?: boolean;
  /** 内边距 */
  padding?: 'none' | 'small' | 'medium' | 'large';
}

/**
 * 卡片组件
 * Container card with optional press handler and shadow
 */
export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  elevated = false,
  padding = 'medium',
}) => {
  const content = (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        styles[`padding_${padding}`],
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0,
  },
  padding_none: {
    padding: 0,
  },
  padding_small: {
    padding: 12,
  },
  padding_medium: {
    padding: 16,
  },
  padding_large: {
    padding: 24,
  },
});

export default Card;

