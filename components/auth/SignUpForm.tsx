// app/components/auth/SignUpForm.tsx
import { COLORS, profileStyles as styles } from '@/styles/modal/profile.styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

interface SignUpFormProps {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    phone: string;
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
    onPrimaryPressOut
}: SignUpFormProps) {
    return (
        <>
            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <View style={styles.inputLabelRow}>
                        <Text style={styles.inputLabel}>Name*</Text>
                    </View>
                    <View
                        style={[
                            styles.inputFieldContainer,
                            { borderColor: focusedAuth === 'name' ? COLORS.accent : COLORS.inputBorder },
                        ]}
                    >
                        <Ionicons
                            name="person"
                            size={16}
                            color={COLORS.subText}
                            style={styles.inputFieldIcon}
                        />
                        <TextInput
                            editable={true}
                            style={styles.inputField}
                            value={name}
                            onChangeText={onNameChange}
                            autoCapitalize="words"
                            onFocus={() => onFocus('name')}
                            onBlur={onBlur}
                            placeholder="Enter your name"
                            placeholderTextColor={COLORS.subText}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputLabelRow}>
                        <Text style={styles.inputLabel}>Username</Text>
                    </View>
                    <View
                        style={[
                            styles.inputFieldContainer,
                            { borderColor: focusedAuth === 'username' ? COLORS.accent : COLORS.inputBorder },
                        ]}
                    >
                        <Ionicons
                            name="at"
                            size={16}
                            color={COLORS.subText}
                            style={styles.inputFieldIcon}
                        />
                        <TextInput
                            editable={true}
                            style={styles.inputField}
                            value={username}
                            onChangeText={onUsernameChange}
                            autoCapitalize="none"
                            onFocus={() => onFocus('username')}
                            onBlur={onBlur}
                            placeholder="Choose a username"
                            placeholderTextColor={COLORS.subText}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputLabelRow}>
                        <Text style={styles.inputLabel}>Phone</Text>
                    </View>
                    <View
                        style={[
                            styles.inputFieldContainer,
                            { borderColor: focusedAuth === 'phone' ? COLORS.accent : COLORS.inputBorder },
                        ]}
                    >
                        <Ionicons
                            name="call"
                            size={16}
                            color={COLORS.subText}
                            style={styles.inputFieldIcon}
                        />
                        <TextInput
                            editable={true}
                            style={styles.inputField}
                            value={phone}
                            onChangeText={onPhoneChange}
                            keyboardType="phone-pad"
                            onFocus={() => onFocus('phone')}
                            onBlur={onBlur}
                            placeholder="Enter phone number"
                            placeholderTextColor={COLORS.subText}
                        />
                    </View>
                </View>

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
                            placeholder="Create a password"
                            placeholderTextColor={COLORS.subText}
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputLabelRow}>
                        <Text style={styles.inputLabel}>Confirm Password*</Text>
                    </View>
                    <View
                        style={[
                            styles.inputFieldContainer,
                            { borderColor: focusedAuth === 'confirmPassword' ? COLORS.accent : COLORS.inputBorder },
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
                            value={confirmPassword}
                            onChangeText={onConfirmPasswordChange}
                            onFocus={() => onFocus('confirmPassword')}
                            onBlur={onBlur}
                            placeholder="Confirm your password"
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
                            <Text style={styles.primaryButtonText}>Create Account</Text>
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
        </>
    );
}