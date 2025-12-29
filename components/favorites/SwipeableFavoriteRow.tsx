import { favoritesStyles as styles } from "@/styles/tabs/favorites.styles";
import { getSessionConfig } from "@/utils/favoriteSessionConfig";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

type Props = {
    session: any;
    onToggleFavorite: (session: any) => void;
    onPlay: (session: any) => void;
};

export const SwipeableFavoriteRow = memo(function SwipeableFavoriteRow({
    session,
    onToggleFavorite,
    onPlay,
}: Props) {
    const [isPressed, setIsPressed] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const translateX = useSharedValue(0);
    const deleteWidth = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const rowHeight = useSharedValue(68);

    const config = getSessionConfig(session);
    const IconComponent =
        (config.iconSet === "Feather" ? Feather : Ionicons) as React.ComponentType<any>;

    const onPressPlay = useCallback(() => {
        onPlay(session);
    }, [session, onPlay]);

    const handleDelete = useCallback(() => {
        translateX.value = withTiming(-200, { duration: 400 });
        scale.value = withTiming(0.8, { duration: 400 });
        opacity.value = withTiming(0, { duration: 400 });
        rowHeight.value = withTiming(0, { duration: 400 });

        setTimeout(() => {
            onToggleFavorite(session);
        }, 400);
    }, [session, onToggleFavorite, translateX, scale, opacity, rowHeight]);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            if (event.translationX < 0) {
                translateX.value = Math.max(event.translationX, -100);
                deleteWidth.value = Math.min(Math.abs(event.translationX), 100);
            }
        })
        .onEnd((event) => {
            if (event.translationX < -60) {
                translateX.value = withSpring(-100);
                deleteWidth.value = 100;
                runOnJS(Haptics.selectionAsync)();
                runOnJS(setShowDeleteConfirm)(true);
            } else {
                translateX.value = withSpring(0);
                deleteWidth.value = withSpring(0);
            }
        });

    const animatedRowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }, { scale: scale.value }],
        opacity: opacity.value,
        height: rowHeight.value,
        marginVertical: rowHeight.value === 0 ? 0 : 3.5,
    }));

    const deleteBackgroundStyle = useAnimatedStyle(() => ({
        width: deleteWidth.value,
        opacity: deleteWidth.value > 0 ? 1 : 0,
    }));

    return (
        <View style={styles.swipeableContainer}>
            <Animated.View style={[styles.deleteBackground, deleteBackgroundStyle]}>
                <View style={styles.deleteContent}>
                    <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.deleteText}>Delete</Text>
                </View>
            </Animated.View>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={animatedRowStyle}>
                    <LinearGradient colors={config.gradient} style={styles.card}>
                        <View style={styles.cardInner}>
                            <View style={styles.left}>
                                <View
                                    style={[
                                        styles.iconWrap,
                                        { backgroundColor: config.iconBg },
                                    ]}
                                >
                                    <IconComponent
                                        name={config.iconName}
                                        size={18}
                                        color="#FFFFFF"
                                    />
                                </View>
                                <Text style={styles.cardTitle} numberOfLines={1}>
                                    {session.title}
                                </Text>
                            </View>

                            <View style={styles.actions}>
                                <View
                                    style={[
                                        styles.playContainer,
                                        isPressed && {
                                            transform: [{ scale: 0.9 }],
                                        },
                                    ]}
                                >
                                    <Pressable
                                        onPress={onPressPlay}
                                        onPressIn={() => setIsPressed(true)}
                                        onPressOut={() => setIsPressed(false)}
                                        style={styles.playButton}
                                    >
                                        <Text style={styles.playText}>Play</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </GestureDetector>

            <Modal
                visible={showDeleteConfirm}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteConfirm(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmationBox}>
                        <Ionicons name="trash" size={40} color="#FF3B30" />
                        <Text style={styles.confirmationTitle}>
                            Remove from Favorites
                        </Text>
                        <Text style={styles.confirmationMessage}>
                            {`Are you sure you want to remove '${session.title}'?`}
                        </Text>

                        <View style={styles.confirmationButtons}>
                            <Pressable
                                onPress={() => setShowDeleteConfirm(false)}
                                style={[
                                    styles.confirmationButton,
                                    styles.cancelButton,
                                ]}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={handleDelete}
                                style={[
                                    styles.confirmationButton,
                                    styles.deleteButton,
                                ]}
                            >
                                <Text style={styles.deleteButtonText}>
                                    Remove
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
});
