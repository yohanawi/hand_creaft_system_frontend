import { BRAND_FONTS, BROWN } from '@/constants/brandTheme';
import { Feather } from '@expo/vector-icons';
import { type ReactNode, useState } from 'react';
import {
    StyleSheet,
    TextInput,
    type TextInputProps,
    View,
} from 'react-native';

const C = {
    text: BROWN.TextPrimary,
    muted: BROWN.TextSecondary,
    border: BROWN.Border,
    card: '#FFFFFF',
    iconBg: BROWN.Background,
    iconBgActive: BROWN.SecondaryBackground,
    accent: BROWN.DarkColor,
};

export type AuthFieldProps = {
    icon: keyof typeof Feather.glyphMap;
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
    right?: ReactNode;
} & Pick<
    TextInputProps,
    | 'secureTextEntry'
    | 'keyboardType'
    | 'autoCapitalize'
    | 'autoComplete'
    | 'textContentType'
    | 'returnKeyType'
    | 'onSubmitEditing'
>;

export default function AuthField({
    icon,
    value,
    placeholder,
    onChange,
    right,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    autoComplete,
    textContentType,
    returnKeyType,
    onSubmitEditing,
}: AuthFieldProps) {
    const [focused, setFocused] = useState(false);

    return (
        <View style={[styles.field, focused && styles.fieldFocused]}>
            <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
                <Feather name={icon} size={16} color={focused ? C.accent : C.muted} />
            </View>
            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor={C.muted}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize ?? 'none'}
                autoComplete={autoComplete}
                textContentType={textContentType}
                returnKeyType={returnKeyType}
                onSubmitEditing={onSubmitEditing}
                style={styles.input}
            />
            {right}
        </View>
    );
}

const styles = StyleSheet.create({
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 56,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: C.border,
        backgroundColor: C.card,
        paddingHorizontal: 14,
    },
    fieldFocused: {
        borderColor: C.accent,
        shadowColor: '#714329',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 2,
    },
    iconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.iconBg,
        marginRight: 12,
    },
    iconWrapFocused: {
        backgroundColor: C.iconBgActive,
    },
    input: {
        flex: 1,
        fontFamily: BRAND_FONTS.body,
        fontSize: 14,
        color: C.text,
        paddingVertical: 14,
    },
});