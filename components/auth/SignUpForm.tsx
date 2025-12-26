import { COLORS, profileStyles as styles } from "@/styles/modal/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View, } from "react-native";

interface SignUpFormProps {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    phone: string;
    errors: Record<string, string>;
    loading: boolean;
    focusedAuth: string | null;
    onNameChange: (text: string) => void;
    onEmailChange: (text: string) => void;
    onPasswordChange: (text: string) => void;
    onConfirmPasswordChange: (text: string) => void;
    onUsernameChange: (text: string) => void;
    onPhoneChange: (text: string) => void;
    onFocus: (field: string) => void;
    onBlur: () => void;
    onSubmit: () => void;
    onSwitchToSignIn: () => void;
    primaryButtonPressed: boolean;
    onPrimaryPressIn: () => void;
    onPrimaryPressOut: () => void;
}

export function SignUpForm({
    name,
    email,
    password,
    confirmPassword,
    username,
    phone,
    errors,
    loading,
    focusedAuth,
    onNameChange,
    onEmailChange,
    onPasswordChange,
    onConfirmPasswordChange,
    onUsernameChange,
    onPhoneChange,
    onFocus,
    onBlur,
    onSubmit,
    onSwitchToSignIn,
    primaryButtonPressed,
    onPrimaryPressIn,
    onPrimaryPressOut,
}: SignUpFormProps) {
    const renderError = (field: string) =>
        errors[field] && (
            <View style={styles.errorRow}>
                <View style={styles.errorDot} />
                <Text style={styles.errorText}>{errors[field]}</Text>
            </View>
        );

    return (
        <View style={styles.formContainer}>
            {/* NAME */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name*</Text>
                <View
                    style={[
                        styles.inputFieldContainer,
                        {
                            borderColor: errors.name
                                ? COLORS.danger
                                : focusedAuth === "name"
                                    ? COLORS.accent
                                    : COLORS.inputBorder,
                        },
                    ]}
                >
                    <Ionicons
                        name="person"
                        size={16}
                        color={COLORS.subText}
                        style={styles.inputFieldIcon}
                    />
                    <TextInput
                        style={styles.inputField}
                        value={name}
                        onChangeText={onNameChange}
                        onFocus={() => onFocus("name")}
                        onBlur={onBlur}
                        placeholder="Enter your name"
                        placeholderTextColor={COLORS.subText}
                    />
                </View>
                {renderError("name")}
            </View>

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
                {renderError("email")}
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
                        placeholder="Create a password"
                        placeholderTextColor={COLORS.subText}
                    />
                </View>
                {renderError("password")}
            </View>

            {/* CONFIRM PASSWORD */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password*</Text>
                <View
                    style={[
                        styles.inputFieldContainer,
                        {
                            borderColor: errors.confirmPassword
                                ? COLORS.danger
                                : focusedAuth === "confirmPassword"
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
                        value={confirmPassword}
                        onChangeText={onConfirmPasswordChange}
                        onFocus={() => onFocus("confirmPassword")}
                        onBlur={onBlur}
                        placeholder="Confirm your password"
                        placeholderTextColor={COLORS.subText}
                    />
                </View>
                {renderError("confirmPassword")}
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
                        <Text style={styles.primaryButtonText}>
                            Create Account
                        </Text>
                    )}
                </View>
            </Pressable>

            <View style={styles.modeSwitchContainer}>
                <Text style={styles.modeSwitchText}>
                    Already have an account?
                </Text>
                <Pressable onPress={onSwitchToSignIn}>
                    <Text style={styles.modeSwitchLink}>Sign in</Text>
                </Pressable>
            </View>
        </View>
    );
}
