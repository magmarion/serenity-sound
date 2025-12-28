import Colors from "@/constants/colors";
import { playerStyles as styles } from "@/styles/modal/player.styles";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface RepeatIcon {
    type: "material" | "ion";
    name: string;
}

interface Props {
    isPlaying: boolean;
    repeatMode: "off" | "all" | "one";
    isShuffled: boolean;
    repeatIcon: RepeatIcon;
    repeatColor: string;
    shuffleColor: string;
    onRepeat: () => void;
    onSkipBack: () => void;
    onPlayToggle: () => void;
    onSkipForward: () => void;
    onShuffle: () => void;
}

export function PlaybackControls({
    isPlaying,
    repeatMode,
    isShuffled,
    repeatIcon,
    repeatColor,
    shuffleColor,
    onRepeat,
    onSkipBack,
    onPlayToggle,
    onSkipForward,
    onShuffle,
}: Props) {
    return (
        <View style={styles.controlsRow}>
            {/* Repeat */}
            <Pressable onPress={onRepeat}>
                <View style={styles.iconButton}>
                    {repeatIcon.type === "material" ? (
                        <MaterialIcons
                            name="repeat-one"
                            size={24}
                            color={repeatColor}
                        />
                    ) : (
                        <Ionicons
                            name={repeatIcon.name as any}
                            size={24}
                            color={repeatColor}
                        />
                    )}
                    <Text
                        style={[
                            styles.iconLabel,
                            repeatMode !== "off" && { color: Colors.light.accent },
                        ]}
                    >
                        Repeat
                    </Text>
                </View>
            </Pressable>

            {/* Skip back */}
            <Pressable onPress={onSkipBack}>
                <View style={styles.skipButton}>
                    <Ionicons
                        name="play-skip-back"
                        size={28}
                        color={Colors.light.text}
                    />
                </View>
            </Pressable>

            {/* Play pause */}
            <Pressable onPress={onPlayToggle}>
                <View style={styles.playButton}>
                    <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={32}
                        color={Colors.light.surface}
                    />
                </View>
            </Pressable>

            {/* Skip forward */}
            <Pressable onPress={onSkipForward}>
                <View style={styles.skipButton}>
                    <Ionicons
                        name="play-skip-forward"
                        size={28}
                        color={Colors.light.text}
                    />
                </View>
            </Pressable>

            {/* Shuffle */}
            <Pressable onPress={onShuffle}>
                <View style={styles.iconButton}>
                    <Ionicons
                        name={isShuffled ? "shuffle" : "shuffle-outline"}
                        size={24}
                        color={shuffleColor}
                    />
                    <Text
                        style={[
                            styles.iconLabel,
                            isShuffled && { color: Colors.light.accent },
                        ]}
                    >
                        Shuffle
                    </Text>
                </View>
            </Pressable>
        </View>
    );
}
