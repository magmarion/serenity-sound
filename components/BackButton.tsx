import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface BackButtonProps {
    onPress?: () => void;
    accessibilityLabel?: string;
    style?: ViewStyle;
    iconColor?: string;
    iconSize?: number;
    showLabel?: boolean;
}

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

export const BackButton: React.FC<BackButtonProps> = ({
    onPress,
    accessibilityLabel = "Go back",
    style,
    iconColor = "#fff",
    iconSize = 24,
    showLabel = false,
}) => {
    const router = useRouter();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.back();
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={[styles.button, style]}
            hitSlop={HIT_SLOP}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
            accessibilityHint="Returns to the previous screen"
            activeOpacity={0.7}
        >
            <ArrowLeft color={iconColor} size={iconSize} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        minWidth: 44,
        minHeight: 44,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.10)',
    },
});