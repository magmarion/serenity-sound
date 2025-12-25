// app/components/auth/AuthForm.tsx
import { BackButton } from '@/components/BackButton';
import { COLORS } from '@/styles/modal/profile.styles';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

interface AuthFormProps {
    mode: 'signin' | 'signup';
    onSubmit: (mode: 'signin' | 'signup', data: {
        email: string;
        password: string;
        name?: string;
        username?: string;
        phone?: string;
        confirmPassword?: string;
    }) => Promise<void>;
    onBack?: () => void;
    showBackButton?: boolean;
    isInModal?: boolean;
}

export function AuthForm({
    mode: initialMode,
    onSubmit,
    onBack,
    showBackButton = false,
    isInModal = false,
}: AuthFormProps) {
    const insets = useSafeAreaInsets();
    const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
    const [focusedAuth, setFocusedAuth] = useState<string | null>(null);
    const [primaryButtonPressed, setPrimaryButtonPressed] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (loading) return;

        // Basic validation
        if (!email || !password) {
            alert('Please fill in all required fields');
            return;
        }

        if (mode === 'signup') {
            if (!name) {
                alert('Please enter your name');
                return;
            }
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
        }

        setLoading(true);
        try {
            await onSubmit(mode, {
                email,
                password,
                ...(mode === 'signup' && {
                    name,
                    username,
                    phone,
                    confirmPassword,
                }),
            });
        } catch (error) {
            console.error('Auth error:', error);
            // Error handling will be done by the parent component
        } finally {
            setLoading(false);
        }
    }, [mode, email, password, confirmPassword, name, username, phone, loading, onSubmit]);

    const handlePrimaryPressIn = useCallback(() => {
        setPrimaryButtonPressed(true);
    }, []);

    const handlePrimaryPressOut = useCallback(() => {
        setPrimaryButtonPressed(false);
    }, []);

    const handleFocus = useCallback((field: string) => {
        setFocusedAuth(field);
    }, []);

    const handleBlur = useCallback(() => {
        setFocusedAuth(null);
    }, []);

    const handleSwitchMode = useCallback(() => {
        setMode(prev => prev === 'signin' ? 'signup' : 'signin');
    }, []);

    const handleBackPress = useCallback(() => {
        if (onBack) {
            onBack();
        }
    }, [onBack]);

    return (
        <View style={localStyles.root}>
            <LinearGradient
                colors={["#0B0F2E", "#05060A"]}
                style={StyleSheet.absoluteFill}
            />

            {/* Header with Back Button */}
            {showBackButton && (
                <View
                    style={[localStyles.header, { paddingTop: insets.top + 10 }]}
                >
                    <BackButton
                        onPress={handleBackPress}
                        accessibilityLabel="Go back"
                        iconColor={COLORS.text}
                        iconSize={20}
                    />
                </View>
            )}

            <KeyboardAvoidingView
                style={localStyles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={[
                        localStyles.authContainer,
                        {
                            paddingTop: showBackButton
                                ? 20 // Less padding when we have header
                                : insets.top + (isInModal ? 60 : 40)
                        }
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={localStyles.authTitle}>
                        {mode === "signin" ? "Sign in" : "Create Account"}
                    </Text>
                    <Text style={localStyles.authSubtitle}>
                        {mode === "signin"
                            ? "Sign in to save your preferences and access more features."
                            : "Create an account to get started"}
                    </Text>

                    {mode === 'signin' ? (
                        <SignInForm
                            email={email}
                            password={password}
                            loading={loading}
                            focusedAuth={focusedAuth}
                            onEmailChange={setEmail}
                            onPasswordChange={setPassword}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onSubmit={handleSubmit}
                            onSwitchToSignUp={handleSwitchMode}
                            primaryButtonPressed={primaryButtonPressed}
                            onPrimaryPressIn={handlePrimaryPressIn}
                            onPrimaryPressOut={handlePrimaryPressOut}
                        />
                    ) : (
                        <SignUpForm
                            name={name}
                            email={email}
                            password={password}
                            confirmPassword={confirmPassword}
                            username={username}
                            phone={phone}
                            loading={loading}
                            focusedAuth={focusedAuth}
                            onNameChange={setName}
                            onEmailChange={setEmail}
                            onPasswordChange={setPassword}
                            onConfirmPasswordChange={setConfirmPassword}
                            onUsernameChange={setUsername}
                            onPhoneChange={setPhone}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onSubmit={handleSubmit}
                            onSwitchToSignIn={handleSwitchMode}
                            primaryButtonPressed={primaryButtonPressed}
                            onPrimaryPressIn={handlePrimaryPressIn}
                            onPrimaryPressOut={handlePrimaryPressOut}
                        />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const localStyles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.bgBottom,
    },
    header: {
        paddingBottom: 24,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    authContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    authTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    authSubtitle: {
        fontSize: 16,
        color: COLORS.subText,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
        paddingHorizontal: 20,
    },
});