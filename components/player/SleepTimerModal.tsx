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

                            <Pressable onPress={onHideOptions}>
                                <Text style={styles.sleepTimerCancelText}>
                                    Cancel
                                </Text>
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
                                disabled={
                                    !customMinutes ||
                                    parseInt(customMinutes) <= 0 ||
                                    parseInt(customMinutes) > 240
                                }
                                style={({ pressed }) => [
                                    styles.sleepTimerOption,
                                    styles.sleepTimerCustomSubmit,
                                    pressed && styles.sleepTimerOptionPressed,
                                    (!customMinutes ||
                                        parseInt(customMinutes) <= 0 ||
                                        parseInt(customMinutes) > 240) &&
                                    styles.sleepTimerCustomSubmitDisabled,
                                ]}
                            >
                                <Text style={styles.sleepTimerOptionText}>
                                    Set Timer
                                </Text>
                            </Pressable>

                            <Pressable onPress={onHideCustom}>
                                <Text style={styles.sleepTimerCancelText}>
                                    Back
                                </Text>
                            </Pressable>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}
