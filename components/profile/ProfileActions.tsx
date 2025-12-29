import { COLORS, profileStyles as styles } from "@/styles/modal/profile.styles";
import React, { useState } from "react";
import { ActivityIndicator, Animated, Pressable, Text, View } from "react-native";

type Props = {
    hasChanges: boolean;
    saveSuccess: boolean;
    saveButtonOpacity: Animated.Value;
    onSave: () => void;
    onSignOut: () => void;
    signOutLoading: boolean;
};

export function ProfileActions({
    hasChanges,
    saveSuccess,
    saveButtonOpacity,
    onSave,
    onSignOut,
    signOutLoading,
}: Props) {
    const [saveButtonPressed, setSaveButtonPressed] = useState(false);
    const [secondaryButtonPressed, setSecondaryButtonPressed] = useState(false);

    return (
        <>
            {(hasChanges || saveSuccess) && (
                <Animated.View
                    style={{
                        opacity: saveButtonOpacity,
                        transform: [
                            {
                                translateY: saveButtonOpacity.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [8, 0],
                                }),
                            },
                        ],
                    }}
                >
                    <Pressable
                        onPressIn={() => setSaveButtonPressed(true)}
                        onPressOut={() => setSaveButtonPressed(false)}
                        onPress={onSave}
                        style={styles.primaryButtonContainer}
                        accessibilityRole="button"
                        accessibilityLabel="Save profile changes"
                    >
                        <View
                            style={[
                                styles.primaryButton,
                                saveButtonPressed && styles.btnPressed,
                            ]}
                        >
                            <Text style={styles.primaryButtonText}>
                                {saveSuccess ? "Changes saved" : "Save changes"}
                            </Text>
                        </View>
                    </Pressable>
                </Animated.View>
            )}

            <Pressable
                onPressIn={() => setSecondaryButtonPressed(true)}
                onPressOut={() => setSecondaryButtonPressed(false)}
                onPress={onSignOut}
                disabled={signOutLoading}
                style={styles.secondaryButtonContainer}
                testID="profile/signout"
                accessibilityRole="button"
                accessibilityLabel="Sign out"
                accessibilityHint="Logs you out of your account"
            >
                <View
                    style={[
                        styles.secondaryButton,
                        secondaryButtonPressed && styles.btnPressed,
                        signOutLoading && styles.buttonDisabled,
                    ]}
                >
                    {signOutLoading ? (
                        <ActivityIndicator color={COLORS.accent} size="small" />
                    ) : (
                        <Text style={styles.secondaryButtonText}>Sign Out</Text>
                    )}
                </View>
            </Pressable>
        </>
    );
}
