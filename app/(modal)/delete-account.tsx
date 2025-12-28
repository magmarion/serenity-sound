import { BackButton } from "@/components/BackButton";
import { useAuthStore } from "@/store/auth-store";
import { COLORS, profileStyles as styles } from "@/styles/modal/profile.styles";
import { Ionicons } from "@expo/vector-icons";
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

export default function DeleteAccountModal() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { deleteAccount } = useAuthStore();

    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canDelete =
        password.length > 0 && confirmation.trim().toUpperCase() === "DELETE";

    const handleDelete = async () => {
        setError(null);

        if (!canDelete) return;

        try {
            setLoading(true);
            await deleteAccount(password);
            router.replace("/sign-in");
        } catch (err: any) {
            setError(err.message || "Failed to delete account");
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

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <BackButton onPress={() => router.back()} />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.authContainer}>
                    <Text style={styles.authTitle}>Delete Account</Text>
                    <Text style={styles.authSubtitle}>
                        This action is permanent. All your data will be removed
                        and cannot be recovered.
                    </Text>

                    <View style={styles.formContainer}>
                        {/* PASSWORD */}
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
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter your password"
                                    placeholderTextColor={COLORS.subText}
                                />
                            </View>
                        </View>

                        {/* CONFIRM DELETE */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>
                                Type DELETE to confirm
                            </Text>
                            <View style={styles.inputFieldContainer}>
                                <TextInput
                                    style={styles.inputField}
                                    value={confirmation}
                                    onChangeText={setConfirmation}
                                    autoCapitalize="characters"
                                    placeholder="DELETE"
                                    placeholderTextColor={COLORS.subText}
                                />
                            </View>
                        </View>

                        {error && (
                            <View style={styles.errorRow}>
                                <View style={styles.errorAsterisk} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <Pressable
                            onPress={handleDelete}
                            disabled={!canDelete || loading}
                            style={styles.primaryButtonContainer}
                        >
                            <View
                                style={[
                                    styles.primaryButton,
                                    {
                                        backgroundColor: COLORS.danger,
                                        shadowColor: COLORS.danger,
                                    },
                                    (!canDelete || loading) &&
                                    styles.buttonDisabled,
                                ]}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#141414" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>
                                        Permanently Delete Account
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
