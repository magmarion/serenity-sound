import Colors from "@/constants/colors";
import { playerStyles as styles } from "@/styles/modal/player.styles";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface Props {
    isFavorite: boolean;
    sleepActive: boolean;
    sleepText: string;
    sleepRemaining: number;
    onFavorite: () => void;
    onSleep: () => void;
}

export function ActionButtons({
    isFavorite,
    sleepActive,
    sleepText,
    sleepRemaining,
    onFavorite,
    onSleep,
}: Props) {
    return (
        <View style={styles.actionRow}>
            {/* Favorite */}
            <Pressable onPress={onFavorite}>
                <View
                    style={[
                        styles.actionButton,
                        styles.actionButtonFavorite,
                        isFavorite && styles.actionButtonActive,
                    ]}
                >
                    <Fontisto
                        name="favorite"
                        size={18}
                        color={
                            isFavorite
                                ? Colors.light.favorited
                                : Colors.light.text
                        }
                    />
                    <Text
                        style={[
                            styles.actionLabel,
                            isFavorite && styles.actionLabelActive,
                        ]}
                    >
                        {isFavorite ? "Favorited" : "Favorite"}
                    </Text>
                </View>
            </Pressable>

            {/* Sleep timer */}
            <Pressable onPress={onSleep}>
                <View
                    style={[
                        styles.actionButton,
                        styles.actionButtonSleep,
                        sleepActive && styles.actionButtonActive,
                    ]}
                >
                    <Ionicons
                        name={sleepActive ? "time" : "time-outline"}
                        size={18}
                        color={
                            sleepActive
                                ? Colors.light.accent
                                : Colors.light.text
                        }
                    />
                    <Text
                        style={[
                            styles.actionLabel,
                            sleepActive && styles.actionLabelActive,
                        ]}
                    >
                        {sleepText}
                    </Text>

                    {sleepActive && sleepRemaining > 0 && (
                        <Ionicons
                            name="close-circle"
                            size={16}
                            color={Colors.light.tabIconDefault}
                            style={styles.sleepTimerCancelIcon}
                        />
                    )}
                </View>
            </Pressable>
        </View>
    );
}
