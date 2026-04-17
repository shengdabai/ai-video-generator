/**
 * VidCraft AI - 输入框组件
 * Reusable text input component
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';

interface InputProps {
  /** 占位符 */
  placeholder?: string;
  /** 输入值 */
  value: string;
  /** 值变化回调 */
  onChangeText: (text: string) => void;
  /** 标签文字 */
  label?: string;
  /** 错误信息 */
  error?: string;
  /** 帮助文字 */
  helper?: string;
  /** 是否密码输入 */
  secureTextEntry?: boolean;
  /** 键盘类型 */
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  /** 是否多行 */
  multiline?: boolean;
  /** 多行时的行数 */
  numberOfLines?: number;
  /** 最大长度 */
  maxLength?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 右侧操作按钮 */
  rightAction?: {
    text: string;
    onPress: () => void;
    disabled?: boolean;
  };
  /** 自定义容器样式 */
  style?: ViewStyle;
  /** 自定义输入框样式 */
  inputStyle?: TextStyle;
  /** 自动聚焦 */
  autoFocus?: boolean;
  /** 提交回调 */
  onSubmitEditing?: () => void;
}

/**
 * 输入框组件
 * Customizable text input with label, error, and helper text
 */
export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  label,
  error,
  helper,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  maxLength,
  disabled = false,
  rightAction,
  style,
  inputStyle,
  autoFocus = false,
  onSubmitEditing,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error ? styles.inputError : undefined,
          disabled && styles.inputDisabled,
          multiline && styles.inputMultiline,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultilineText,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={!disabled}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={onSubmitEditing}
        />
        
        {rightAction && (
          <TouchableOpacity
            style={[
              styles.rightAction,
              rightAction.disabled && styles.rightActionDisabled,
            ]}
            onPress={rightAction.onPress}
            disabled={rightAction.disabled}
          >
            <Text
              style={[
                styles.rightActionText,
                rightAction.disabled && styles.rightActionTextDisabled,
              ]}
            >
              {rightAction.text}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* 字数统计 */}
      {maxLength && multiline && (
        <Text style={styles.charCount}>
          {value.length}/{maxLength}
        </Text>
      )}
      
      {/* 错误或帮助文字 */}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && helper && <Text style={styles.helperText}>{helper}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: '#6366F1',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.7,
  },
  inputMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 14,
  },
  inputMultilineText: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  rightAction: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  rightActionDisabled: {
    backgroundColor: '#E5E7EB',
  },
  rightActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  rightActionTextDisabled: {
    color: '#9CA3AF',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default Input;

