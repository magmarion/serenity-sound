import { COLORS, profileStyles as styles } from "@/styles/modal/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

interface SignInFormProps {
    email: string;
    password: string;
    errors: Record<string, string>;
    loading: boolean;
    focusedAuth: string | null;
    onEmailChange: (text: string) => void;
    onPasswordChange: (text: string) => void;
    onFocus: (field: string) => void;
    onBlur: () => void;
    onSubmit: () => void;
    onSwitchToSignUp: () => void;
    primaryButtonPressed: boolean;
    onPrimaryPressIn: () => void;
    onPrimaryPressOut: () => void;
}

export function SignInForm({
    email,
    password,
    errors,
    loading,
    focusedAuth,
    onEmailChange,
    onPasswordChange,
    onFocus,
    onBlur,
    onSubmit,
    onSwitchToSignUp,
    primaryButtonPressed,
    onPrimaryPressIn,
    onPrimaryPressOut,
}: SignInFormProps) {
    return (
        <View style={styles.formContainer}>
            {/* EMAIL */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email*</Text>
                <View
                    style={[
                        styles.inputFieldContainer,
                        {
                            borderColor: errors.email
                                ? COLORS.danger
                                : focusedAuth === "email"
                                    ? COLORS.accent
                                    : COLORS.inputBorder,
                        },
                    ]}
                >
                    <Ionicons
                        name="mail"
                        size={16}
                        color={COLORS.subText}
                        style={styles.inputFieldIcon}
                    />
                    <TextInput
                        style={styles.inputField}
                        value={email}
                        onChangeText={onEmailChange}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        onFocus={() => onFocus("email")}
                        onBlur={onBlur}
                        placeholder="Enter your email"
                        placeholderTextColor={COLORS.subText}
                    />
                </View>
                {errors.email && (
                    <View style={styles.errorRow}>
                        <View style={styles.errorDot} />
                        <Text style={styles.errorText}>{errors.email}</Text>
                    </View>
                )}
            </View>

            {/* PASSWORD */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password*</Text>
                <View
                    style={[
                        styles.inputFieldContainer,
                        {
                            borderColor: errors.password
                                ? COLORS.danger
                                : focusedAuth === "password"
                                    ? COLORS.accent
                                    : COLORS.inputBorder,
                        },
                    ]}
                >
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
                        onChangeText={onPasswordChange}
                        onFocus={() => onFocus("password")}
                        onBlur={onBlur}
                        placeholder="Enter your password"
                        placeholderTextColor={COLORS.subText}
                    />
                </View>
                {errors.password && (
                    <View style={styles.errorRow}>
                        <View style={styles.errorDot} />
                        <Text style={styles.errorText}>{errors.password}</Text>
                    </View>
                )}
            </View>

            {/* SUBMIT */}
            <Pressable
                onPressIn={onPrimaryPressIn}
                onPressOut={onPrimaryPressOut}
                onPress={onSubmit}
                disabled={loading}
                style={styles.primaryButtonContainer}
            >
                <View
                    style={[
                        styles.primaryButton,
                        primaryButtonPressed && styles.btnPressed,
                        loading && styles.buttonDisabled,
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator color="#141414" />
                    ) : (
                        <Text style={styles.primaryButtonText}>Sign In</Text>
                    )}
                </View>
            </Pressable>

            <View style={styles.modeSwitchContainer}>
                <Text style={styles.modeSwitchText}>
                    Don&apos;t have an account?
                </Text>
                <Pressable onPress={onSwitchToSignUp}>
                    <Text style={styles.modeSwitchLink}>Sign up</Text>
                </Pressable>
            </View>
        </View>
    );
}
