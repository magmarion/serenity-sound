import Colors from "@/constants/colors";
import { Session } from "@/services/api";
import { categoryDetailStyles as styles } from "@/styles/category/id.styles";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
    session: Session;
    accentColor: string;
    backgroundColor: string;
    isFavorite: boolean;
    onPlay: (session: Session) => void;
    onToggleFavorite: (session: Session) => void;
};

export function CategorySessionRow({
    session,
    accentColor,
    backgroundColor,
    isFavorite,
    onPlay,
    onToggleFavorite,
}: Props) {
    return (
        <View style={styles.sessionRow}>
            <Pressable
                onPress={() => onPlay(session)}
                accessibilityRole="button"
                accessibilityLabel={`Play ${session.title}`}
                accessibilityHint="Opens the sound player"
            >
                {({ pressed }) => (
                    <View
                        style={[
                            styles.sessionIconWrap,
                            { backgroundColor },
                            pressed && { opacity: 0.8 },
                        ]}
                    >
                        <Ionicons
                            name="play"
                            color={accentColor}
                            size={18}
                        />
                    </View>
                )}
            </Pressable>

            <View style={styles.sessionText}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.sessionMeta}>
                    {session.durationLabel}
                </Text>
            </View>

            <Pressable
                onPress={() => onToggleFavorite(session)}
                accessibilityRole="button"
                accessibilityLabel={
                    isFavorite
                        ? `Remove ${session.title} from favorites`
                        : `Add ${session.title} to favorites`
                }
                accessibilityHint="Toggles favorite status"
                accessibilityState={{ selected: isFavorite }}
            >
                {({ pressed }) => (
                    <View
                        style={[
                            styles.sessionFavoriteButton,
                            isFavorite &&
                            styles.sessionFavoriteButtonFavorited,
                            pressed && {
                                transform: [{ scale: 0.9 }],
                                opacity: 0.8,
                            },
                        ]}
                    >
                        <Fontisto
                            name="favorite"
                            color={
                                isFavorite
                                    ? Colors.light.favorited
                                    : Colors.palette.muted
                            }
                            size={24}
                        />
                    </View>
                )}
            </Pressable>
        </View>
    );
}
