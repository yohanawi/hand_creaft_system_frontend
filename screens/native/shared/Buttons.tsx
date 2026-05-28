import React from 'react';
import { ActivityIndicator, Pressable, Text, ViewStyle } from 'react-native';

import { Feather } from '@expo/vector-icons';

import { nativeTheme } from '@/screens/native/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle;
  icon?: React.ComponentProps<typeof Feather>['name'];
};

const palette: Record<ButtonVariant, { backgroundColor: string; color: string; borderColor: string }> = {
  primary: {
    backgroundColor: nativeTheme.colors.primary,
    color: nativeTheme.colors.white,
    borderColor: nativeTheme.colors.primary,
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    color: nativeTheme.colors.primaryDark,
    borderColor: 'rgba(113, 67, 41, 0.12)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: nativeTheme.colors.primaryDark,
    borderColor: 'rgba(113, 67, 41, 0.12)',
  },
  danger: {
    backgroundColor: '#fff1ef',
    color: nativeTheme.colors.danger,
    borderColor: '#f1c5c0',
  },
};

export function AppButton({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  style,
  icon,
}: ButtonProps) {
  const theme = palette[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        minHeight: 52,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.borderColor,
        backgroundColor: theme.backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
        opacity: pressed || disabled || loading ? 0.78 : 1,
        flexDirection: 'row',
        gap: 8,
        ...nativeTheme.shadows.soft,
        ...style,
      })}
    >
      {loading ? (
        <ActivityIndicator color={theme.color} />
      ) : (
        <>
          <Text style={{ color: theme.color, fontFamily: nativeTheme.fonts.body, fontSize: 14, fontWeight: '700' }}>
            {label}
          </Text>
          {icon ? <Feather name={icon} size={16} color={theme.color} /> : null}
        </>
      )}
    </Pressable>
  );
}