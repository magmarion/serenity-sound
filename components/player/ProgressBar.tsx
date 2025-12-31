import { playerStyles as styles } from "@/styles/modal/player.styles";
import { formatTime } from "@/utils/formatTime";
import React from "react";
import {
    Animated,
    PanResponderInstance,
    Text,
    View,
} from "react-native";

const THUMB_SIZE = 12;
const THUMB_RADIUS = THUMB_SIZE / 2;

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
            <View style={styles.progressVisualContainer}>
                {/* TRACK */}
                <View
                    style={styles.progressTrack}
                    onLayout={(e) => onLayout(e.nativeEvent.layout.width)}
                >
                    <Animated.View
                        style={[
                            styles.progressFill,
                            { width: progressPercentage },
                        ]}
                    />
                </View>

                {/* SCRUBBER */}
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.progressThumb,
                        {
                            transform: [
                                {
                                    translateX: Math.max(
                                        progressPercentage - THUMB_RADIUS,
                                        0
                                    ),
                                },
                            ],
                        },
                    ]}
                />

                {/* INVISIBLE TOUCH AREA */}
                <View
                    style={styles.progressTouchArea}
                    {...panHandlers}
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
