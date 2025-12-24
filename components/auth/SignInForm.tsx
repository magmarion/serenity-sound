// app/components/auth/SignInForm.tsx
import { COLORS, profileStyles as styles } from '@/styles/modal/profile.styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

interface SignInFormProps {
    email: string;
    password: string;
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
    onPrimaryPressOut
}: SignInFormProps) {
    return (
        <>
            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <View style={styles.inputLabelRow}>
                        <Text style={styles.inputLabel}>Email*</Text>
                    </View>
                    <View
                        style={[
                            styles.inputFieldContainer,
                            { borderColor: focusedAuth === 'email' ? COLORS.accent : COLORS.inputBorder },
                        ]}
                    >
                        <Ionicons
                            name="mail"
                            size={16}
                            color={COLORS.subText}
                            style={styles.inputFieldIcon}
                        />
                        <TextInput
                            editable={true}
                            style={styles.inputField}
                            value={email}
                            onChangeText={onEmailChange}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            onFocus={() => onFocus('email')}
                            onBlur={onBlur}
                            placeholder="Enter your email"
                            placeholderTextColor={COLORS.subText}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputLabelRow}>
                        <Text style={styles.inputLabel}>Password*</Text>
                    </View>
                    <View
                        style={[
                            styles.inputFieldContainer,
                            { borderColor: focusedAuth === 'password' ? COLORS.accent : COLORS.inputBorder },
                        ]}
                    >
                        <Ionicons
                            name="lock-closed"
                            size={16}
                            color={COLORS.subText}
                            style={styles.inputFieldIcon}
                        />
                        <TextInput
                            editable={true}
                            style={styles.inputField}
                            secureTextEntry
                            value={password}
                            onChangeText={onPasswordChange}
                            onFocus={() => onFocus('password')}
                            onBlur={onBlur}
                            placeholder="Enter your password"
                            placeholderTextColor={COLORS.subText}
                        />
                    </View>
                </View>

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
                            <ActivityIndicator color="#141414" size="small" />
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
        </>
    );
}