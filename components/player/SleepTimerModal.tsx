import Colors from "@/constants/colors";
import { playerStyles as styles } from "@/styles/modal/player.styles";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

const SLEEP_TIMER_OPTIONS = [5, 10, 15, 30];

interface Props {
    showOptions: boolean;
    showCustom: boolean;
    customMinutes: string;
    onChangeCustomMinutes: (value: string) => void;
    onSelectDuration: (minutes: number) => void;
    onShowCustom: () => void;
    onHideOptions: () => void;
    onHideCustom: () => void;
    onSubmitCustom: () => void;
}

export function SleepTimerModal({
    showOptions,
    showCustom,
    customMinutes,
    onChangeCustomMinutes,
    onSelectDuration,
    onShowCustom,
    onHideOptions,
    onHideCustom,
    onSubmitCustom,
}: Props) {
    if (!showOptions && !showCustom) return null;

    return (
        <View style={styles.sleepTimerModal}>
            <View style={styles.sleepTimerOptions}>
                {!showCustom && (
                    <>
                        <Text style={styles.sleepTimerTitle}>Sleep Timer</Text>
                        <Text style={styles.sleepTimerSubtitle}>
                            Stop playback after:
                        </Text>

                        <View style={styles.sleepTimerButtons}>
                            {SLEEP_TIMER_OPTIONS.map(minutes => (
                                <Pressable
                                    key={minutes}
                                    onPress={() => onSelectDuration(minutes)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Set sleep timer for ${minutes} minutes`}
                                    accessibilityHint="Stops playback after the selected time"
                                    style={({ pressed }) => [
                                        styles.sleepTimerOption,
                                        pressed && styles.sleepTimerOptionPressed,
                                    ]}
                                >
                                    <Text style={styles.sleepTimerOptionText}>
                                        {minutes} min
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <View style={styles.sleepTimerBottomRow}>
                            <Pressable
                                onPress={onShowCustom}
                                accessibilityRole="button"
                                accessibilityLabel="Set custom sleep timer"
                                accessibilityHint="Enter a custom duration for the sleep timer"
                                style={({ pressed }) => [
                                    styles.sleepTimerOption,
                                    styles.sleepTimerCustomOption,
                                    pressed && styles.sleepTimerOptionPressed,
                                ]}
                            >
                                <View style={styles.sleepTimerCustomText}>
                                    <Ionicons
                                        name="add"
                                        size={20}
                                        color={Colors.light.accent}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={styles.sleepTimerOptionText}>
                                        Custom
                                    </Text>
                                </View>
                            </Pressable>

                            <Pressable onPress={onHideOptions}
                                accessibilityRole="button"
                                accessibilityLabel="Cancel sleep timer"
                                accessibilityHint="Closes the sleep timer menu without setting a timer"
                            >
                                <View style={styles.sleepTimerCancelRight}>
                                    <Text style={styles.sleepTimerCancelText}>
                                        Cancel
                                    </Text>
                                </View>
                            </Pressable>
                        </View>
                    </>
                )}

                {showCustom && (
                    <>
                        <View style={styles.customTimerInputContainer}>
                            <TextInput
                                style={styles.customTimerInput}
                                value={customMinutes}
                                onChangeText={onChangeCustomMinutes}
                                placeholder="00"
                                placeholderTextColor="rgba(59,130,246,0.5)"
                                keyboardType="number-pad"
                                maxLength={3}
                                autoFocus
                                selectionColor={Colors.light.accent}
                            />
                        </View>

                        <View style={styles.customTimerButtonsContainer}>
                            <Pressable
                                onPress={onSubmitCustom}
                                accessibilityRole="button"
                                accessibilityLabel="Set sleep timer"
                                accessibilityHint="Starts the sleep timer with the selected duration"
                            >
                                <View style={styles.sleepTimerCancelRight}>
                                    <Text style={styles.sleepTimerOptionText}>
                                        Set Timer
                                    </Text>
                                </View>
                            </Pressable>

                            <Pressable
                                onPress={onHideCustom}
                                accessibilityRole="button"
                                accessibilityLabel="Go back"
                                accessibilityHint="Returns to sleep timer options"
                            >
                                <View style={styles.sleepTimerCancelRight}>
                                    <Text style={styles.sleepTimerCancelText}>
                                        Back
                                    </Text>
                                </View>
                            </Pressable>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}
