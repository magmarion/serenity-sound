import { BackButton } from "@/components/BackButton";
import { useAuthStore } from "@/store/auth-store";
import { profileStyles as styles, COLORS } from "@/styles/modal/profile.styles";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ChangePasswordModal() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { changePassword } = useAuthStore();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            await changePassword(currentPassword, newPassword);
            router.back();
        } catch (err: any) {
            setError(err.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <LinearGradient
                colors={["#0B0F2E", "#05060A"]}
                style={{ position: "absolute", inset: 0 }}
            />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <BackButton
                    onPress={() => router.back()}
                    accessibilityLabel="Go back"
                />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <View style={styles.authContainer}>
                    <Text style={styles.authTitle}>Change Password</Text>
                    <Text style={styles.authSubtitle}>
                        Enter your current password and choose a new one.
                    </Text>

                    <View style={styles.formContainer}>
                        {/* CURRENT PASSWORD */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>
                                Current Password
                            </Text>
                            <View style={styles.inputFieldContainer}>
                                <Ionicons
                                    name="lock-closed"
                                    size={16}
                                    color={COLORS.subText}
                                    style={styles.inputFieldIcon}
                                />
                                <TextInput
                                    style={styles.inputField}
                                    secureTextEntry={!showCurrentPassword}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="Current password"
                                    placeholderTextColor={COLORS.subText}
                                />
                                <Pressable
                                    onPress={() =>
                                        setShowCurrentPassword((p) => !p)
                                    }
                                    hitSlop={10}
                                >
                                    <Ionicons
                                        name={
                                            showCurrentPassword
                                                ? "eye-off"
                                                : "eye"
                                        }
                                        size={18}
                                        color={COLORS.subText}
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {/* NEW PASSWORD */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>New Password</Text>
                            <View style={styles.inputFieldContainer}>
                                <Ionicons
                                    name="lock-closed"
                                    size={16}
                                    color={COLORS.subText}
                                    style={styles.inputFieldIcon}
                                />
                                <TextInput
                                    style={styles.inputField}
                                    secureTextEntry={!showNewPassword}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="New password"
                                    placeholderTextColor={COLORS.subText}
                                />
                                <Pressable
                                    onPress={() =>
                                        setShowNewPassword((p) => !p)
                                    }
                                    hitSlop={10}
                                >
                                    <Ionicons
                                        name={
                                            showNewPassword
                                                ? "eye-off"
                                                : "eye"
                                        }
                                        size={18}
                                        color={COLORS.subText}
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {/* CONFIRM PASSWORD */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>
                                Confirm New Password
                            </Text>
                            <View style={styles.inputFieldContainer}>
                                <Ionicons
                                    name="lock-closed"
                                    size={16}
                                    color={COLORS.subText}
                                    style={styles.inputFieldIcon}
                                />
                                <TextInput
                                    style={styles.inputField}
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm new password"
                                    placeholderTextColor={COLORS.subText}
                                />
                                <Pressable
                                    onPress={() =>
                                        setShowConfirmPassword((p) => !p)
                                    }
                                    hitSlop={10}
                                >
                                    <Ionicons
                                        name={
                                            showConfirmPassword
                                                ? "eye-off"
                                                : "eye"
                                        }
                                        size={18}
                                        color={COLORS.subText}
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {error && (
                            <View style={styles.errorRow}>
                                <View style={styles.errorDot} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* SUBMIT */}
                        <Pressable
                            onPress={handleSubmit}
                            disabled={loading}
                            style={styles.primaryButtonContainer}
                        >
                            <View
                                style={[
                                    styles.primaryButton,
                                    loading && styles.buttonDisabled,
                                ]}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#141414" />
                                ) : (
                                    <Text
                                        style={styles.primaryButtonText}
                                    >
                                        Update Password
                                    </Text>
                                )}
                            </View>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
