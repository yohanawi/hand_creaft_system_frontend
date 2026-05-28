import { Feather } from '@expo/vector-icons';
import React from 'react';
import { KeyboardTypeOptions, Text, TextInput, TextInputProps, View } from 'react-native';

import { nativeTheme } from '@/screens/native/theme';

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon?: keyof typeof Feather.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  editable?: boolean;
};

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry,
  keyboardType,
  multiline,
  autoCapitalize = 'none',
  autoComplete,
  editable = true,
}: FormFieldProps) {
  const active = Boolean(value);

  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          color: active ? nativeTheme.colors.primary : nativeTheme.colors.textMuted,
          fontFamily: nativeTheme.fonts.body,
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 1.6,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>

      <View
        style={{
          minHeight: multiline ? 120 : 56,
          borderRadius: nativeTheme.radius.lg,
          borderWidth: 1,
          borderColor: active ? 'rgba(113, 67, 41, 0.18)' : 'rgba(113, 67, 41, 0.08)',
          backgroundColor: 'rgba(255, 253, 251, 0.96)',
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          gap: 10,
          paddingHorizontal: 12,
          paddingVertical: multiline ? 14 : 0,
          ...nativeTheme.shadows.soft,
        }}
      >
        {icon ? (
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: multiline ? 4 : 0,
              backgroundColor: active ? 'rgba(113, 67, 41, 0.12)' : nativeTheme.colors.cardStrong,
            }}
          >
            <Feather name={icon} size={16} color={nativeTheme.colors.primary} />
          </View>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9b897a"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          editable={editable}
          style={{
            flex: 1,
            minHeight: multiline ? 92 : 54,
            textAlignVertical: multiline ? 'top' : 'center',
            color: nativeTheme.colors.text,
            fontFamily: nativeTheme.fonts.body,
            fontSize: 15,
            paddingRight: 6,
          }}
        />
      </View>
    </View>
  );
}