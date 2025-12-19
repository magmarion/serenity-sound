// components/Avatar.tsx
import React from 'react';
import { Image, View, StyleSheet, Pressable, Text } from 'react-native';
import { useAuthStore, UserProfile } from '@/store/auth-store';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export interface AvatarProps {
    size?: number;
    onPress?: () => void;
    showBadge?: boolean;
    badgeIcon?: keyof typeof Ionicons.glyphMap;
    badgeColor?: string;
    borderWidth?: number;
    borderColor?: string;
    fallbackType?: 'initials' | 'icon' | 'gradient';
    userOverride?: Pick<UserProfile, 'name' | 'email' | 'photoURL'> | null;
    testID?: string;
    borderRadius?: number | 'circle' | 'rounded';
    showContainer?: boolean; // NEW: Add container styling option
    containerColors?: [string, string]; // NEW: Gradient colors for container
}

export const Avatar: React.FC<AvatarProps> = ({ 
    size = 52, 
    onPress,
    showBadge = false,
    badgeIcon = 'camera',
    badgeColor = '#1C1208',
    borderWidth = 0,
    borderColor = 'rgba(255,255,255,0.1)',
    fallbackType = 'initials',
    userOverride = null,
    testID = 'avatar',
    borderRadius = 'circle',
    showContainer = false, // Default to no container
    containerColors = ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'], // Default gradient
}) => {
    const { profile, user } = useAuthStore();
    
    // Calculate border radius
    let borderRadiusValue: number;
    if (borderRadius === 'circle') {
        borderRadiusValue = size / 2;
    } else if (borderRadius === 'rounded') {
        borderRadiusValue = size / 4;
    } else {
        borderRadiusValue = borderRadius;
    }
    
    // Use override if provided, otherwise use store data
    const displayUser = userOverride || profile;
    const displayEmail = user?.email;
    
    // Calculate inner avatar size (smaller when in container)
    const innerSize = showContainer ? size * 0.85 : size;
    const innerBorderRadius = showContainer ? innerSize / 2 : borderRadiusValue;
    
    // Calculate styles
    const avatarStyle = {
        width: innerSize,
        height: innerSize,
        borderRadius: innerBorderRadius,
    };
    
    // Container styles
    const containerStyle = {
        width: size,
        height: size,
        borderRadius: borderRadiusValue,
    };
    
    // Badge size and position
    const badgeSize = size * 0.25;
    const badgeBorderRadius = badgeSize / 2;
    const badgeStyle = {
        width: badgeSize,
        height: badgeSize,
        borderRadius: badgeBorderRadius,
        right: -badgeSize * 0.15,
        bottom: -badgeSize * 0.15,
    };
    
    const badgeIconSize = badgeSize * 0.6;
    const initialsFontSize = innerSize * 0.4;
    
    // Get user initials for fallback
    const getUserInitials = () => {
        if (displayUser?.name) {
            const names = displayUser.name.split(' ');
            if (names.length > 1) {
                return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
            }
            return displayUser.name.charAt(0).toUpperCase();
        }
        if (displayEmail) {
            return displayEmail.charAt(0).toUpperCase();
        }
        return 'U';
    };
    
    // Get gradient colors based on user initials
    const getGradientColors = () => {
        const initial = getUserInitials().charAt(0);
        const colorsMap: Record<string, [string, string]> = {
            'A': ['#FF8A3D', '#FF5A52'], // Orange to Red
            'B': ['#6DA7FF', '#8F7CFF'], // Blue to Purple
            'C': ['#4DE2C3', '#3BD4A2'], // Teal to Green
            'D': ['#FFD166', '#FFB347'], // Yellow to Orange
            'E': ['#A78BFA', '#7C3AED'], // Violet to Purple
            'F': ['#F472B6', '#EC4899'], // Pink to Rose
            'G': ['#60A5FA', '#3B82F6'], // Light Blue to Blue
            'H': ['#34D399', '#10B981'], // Emerald to Green
            'I': ['#FBBF24', '#F59E0B'], // Amber to Yellow
            'J': ['#FB7185', '#F43F5E'], // Rose to Red
            'K': ['#C084FC', '#A855F7'], // Purple to Violet
            'L': ['#2DD4BF', '#14B8A6'], // Teal to Cyan
            'M': ['#FB923C', '#F97316'], // Orange
            'N': ['#A3E635', '#84CC16'], // Lime to Green
            'O': ['#38BDF8', '#0EA5E9'], // Sky Blue
            'P': ['#E879F9', '#D946EF'], // Fuchsia to Pink
            'Q': ['#4ADE80', '#22C55E'], // Green
            'R': ['#F87171', '#EF4444'], // Red
            'S': ['#94A3B8', '#64748B'], // Slate
            'T': ['#FACC15', '#EAB308'], // Yellow
            'U': ['#C4B5FD', '#8B5CF6'], // Violet
            'V': ['#5EEAD4', '#2DD4BF'], // Cyan
            'W': ['#FDBA74', '#FB923C'], // Warm Orange
            'X': ['#BEF264', '#A3E635'], // Lime
            'Y': ['#A5B4FC', '#818CF8'], // Indigo
            'Z': ['#F9A8D4', '#F472B6'], // Pink
        };
        
        return colorsMap[initial] || ['#3A1C09', '#1B1C37'];
    };
    
    const renderAvatarContent = () => {
        // If user has a photo URL, show the image
        if (displayUser?.photoURL) {
            return (
                <Image
                    source={{ uri: displayUser.photoURL }}
                    style={[styles.avatarImage, avatarStyle]}
                    resizeMode="cover"
                />
            );
        }
        
        // Fallback content based on type
        switch (fallbackType) {
            case 'icon':
                return (
                    <View style={[styles.fallbackContainer, avatarStyle]}>
                        <Ionicons 
                            name="person" 
                            size={innerSize * 0.5} 
                            color="#1C1208" 
                        />
                    </View>
                );
                
            case 'gradient':
                return (
                    <LinearGradient
                        colors={getGradientColors()}
                        style={[styles.fallbackContainer, avatarStyle]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={[styles.initialsText, { fontSize: initialsFontSize }]}>
                            {getUserInitials()}
                        </Text>
                    </LinearGradient>
                );
                
            case 'initials':
            default:
                return (
                    <View style={[styles.fallbackContainer, avatarStyle]}>
                        <Text style={[styles.initialsText, { fontSize: initialsFontSize }]}>
                            {getUserInitials()}
                        </Text>
                    </View>
                );
        }
    };
    
    // Render with or without container
    const renderAvatar = () => {
        if (showContainer) {
            return (
                <LinearGradient
                    colors={containerColors}
                    style={[styles.container, containerStyle]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View 
                        style={[
                            styles.avatarBase,
                            avatarStyle,
                            {
                                borderWidth,
                                borderColor,
                                overflow: 'hidden',
                            }
                        ]}
                    >
                        {renderAvatarContent()}
                    </View>
                    
                    {showBadge && (
                        <View style={[styles.badge, badgeStyle]}>
                            <Ionicons 
                                name={badgeIcon} 
                                size={badgeIconSize} 
                                color={badgeColor} 
                            />
                        </View>
                    )}
                </LinearGradient>
            );
        }
        
        // Without container (simple avatar)
        return (
            <View style={[styles.container, containerStyle]}>
                <View 
                    style={[
                        styles.avatarBase,
                        avatarStyle,
                        {
                            borderWidth,
                            borderColor,
                            overflow: 'hidden',
                        }
                    ]}
                >
                    {renderAvatarContent()}
                </View>
                
                {showBadge && (
                    <View style={[styles.badge, badgeStyle]}>
                        <Ionicons 
                            name={badgeIcon} 
                            size={badgeIconSize} 
                            color={badgeColor} 
                        />
                    </View>
                )}
            </View>
        );
    };
    
    const avatarContent = renderAvatar();
    
    if (onPress) {
        return (
            <Pressable 
                onPress={onPress}
                style={({ pressed }) => [
                    styles.pressable,
                    pressed && styles.pressed,
                ]}
                testID={testID}
            >
                {avatarContent}
            </Pressable>
        );
    }
    
    return avatarContent;
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarBase: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        backgroundColor: 'transparent',
    },
    fallbackContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,138,61,0.2)',
    },
    initialsText: {
        color: '#1C1208',
        fontWeight: '700',
    },
    badge: {
        position: 'absolute',
        backgroundColor: '#FF8A3D',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1C1208',
    },
    pressable: {
        alignSelf: 'flex-start',
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
});