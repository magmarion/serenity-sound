import { playerStyles as styles } from "@/styles/modal/player.styles";
import { formatTime } from "@/utils/formatTime";
import { Animated, PanResponderInstance, Text, View } from "react-native";

interface Props {
    progress: number;
    duration: number;
    progressPercentage: number;
    panHandlers: PanResponderInstance["panHandlers"];
    onLayout: (width: number) => void;
}

export function ProgressBar({
    progress,
    duration,
    progressPercentage,
    panHandlers,
    onLayout,
}: Props) {
    return (
        <View style={styles.progressSection}>
            <View
                style={styles.progressTrack}
                onLayout={(e) => onLayout(e.nativeEvent.layout.width)}
                {...panHandlers}
            >
                <Animated.View
                    style={[styles.progressFill, { width: progressPercentage }]}
                />
                <Animated.View
                    style={[
                        styles.progressThumb,
                        { transform: [{ translateX: progressPercentage }] },
                    ]}
                />
            </View>

            <View style={styles.progressLabels}>
                <Text style={styles.progressText}>
                    {formatTime(progress)}
                </Text>
                <Text style={styles.progressText}>
                    {formatTime(duration)}
                </Text>
            </View>
        </View>
    );
}
