import { BackButton } from "@/components/BackButton";
import { COLORS, profileStyles as styles } from "@/styles/modal/profile.styles";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { signInSchema, signUpSchema } from "./auth.schema";

interface AuthFormProps {
    mode: "signin" | "signup";
    onSubmit: (mode: "signin" | "signup", data: any) => Promise<void>;
    authError?: string | null;
    onModeChange?: () => void;
    onBack?: () => void;
    showBackButton?: boolean;
    isInModal?: boolean;
    onUserInput?: () => void;
}

export function AuthForm({
    mode: initialMode,
    onSubmit,
    authError,
    onModeChange,
    onUserInput,
    onBack,
    showBackButton = false,
    isInModal = false,
}: AuthFormProps) {
    const insets = useSafeAreaInsets();

    const [mode, setMode] = useState<"signin" | "signup">(initialMode);
    const [focusedAuth, setFocusedAuth] = useState<string | null>(null);
    const [primaryButtonPressed, setPrimaryButtonPressed] = useState(false);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
        setUsername("");
        setPhone("");
        setErrors({});
        setTouched({});
        setFocusedAuth(null);
    }, [mode]);

    const switchToSignUp = () => {
        setMode("signup");
        onModeChange?.();
    };

    const switchToSignIn = () => {
        setMode("signin");
        onModeChange?.();
    };

    const validateInline = useCallback(
        (values: any, touchedSnapshot = touched) => {
            const schema = mode === "signin" ? signInSchema : signUpSchema;
            const result = schema.safeParse(values);

            if (result.success) {
                setErrors({});
                return;
            }
            const nextErrors: Record<string, string> = {};

            for (const issue of result.error.issues) {
                const field = issue.path[0] as string;

                if (!touchedSnapshot[field]) continue;

                const value = values[field];

                if (typeof value === "string" && value.length === 0) {
                    continue;
                }

                if (field === "email") {
                    const value = values.email as string;
                    if (value.length === 0) continue;
                    if (value.includes("@")) continue;
                }
                nextErrors[field] = issue.message;
            }
            setErrors(nextErrors);
        },
        [mode, touched]
    );

    const handleSubmit = useCallback(async () => {
        if (loading) return;

        const schema = mode === "signin" ? signInSchema : signUpSchema;
        const result = schema.safeParse({
            email,
            password,
            confirmPassword,
            name,
            username,
            phone,
        });

        if (!result.success) {
            const submitErrors: Record<string, string> = {};
            const submitTouched: Record<string, boolean> = {};

            for (const issue of result.error.issues) {
                const field = issue.path[0] as string;
                submitErrors[field] = issue.message;
                submitTouched[field] = true;
            }

            setErrors(submitErrors);
            setTouched(submitTouched);
            return;
        }

        setLoading(true);
        try {
            await onSubmit(mode, result.data);
        } finally {
            setLoading(false);
        }
    }, [
        loading,
        mode,
        email,
        password,
        confirmPassword,
        name,
        username,
        phone,
        onSubmit,
    ]);

    const onChange =
        (field: string, setter: (v: string) => void) =>
            (value: string) => {
                setter(value);
                onUserInput?.();
                const nextTouched = { ...touched, [field]: true };
                setTouched(nextTouched);

                validateInline(
                    {
                        email,
                        password,
                        confirmPassword,
                        name,
                        username,
                        phone,
                        [field]: value,
                    },
                    nextTouched
                );
            };

    return (
        <View style={localStyles.root}>
            <LinearGradient
                colors={["#0B0F2E", "#05060A"]}
                style={StyleSheet.absoluteFill}
            />

            {showBackButton && (
                <View
                    style={[
                        localStyles.header,
                        { paddingTop: insets.top + 10 },
                    ]}
                >
                    <BackButton
                        onPress={onBack}
                        accessibilityLabel="Go back"
                        iconColor={COLORS.text}
                        iconSize={20}
                    />
                </View>
            )}

            <KeyboardAvoidingView
                style={localStyles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={[
                        localStyles.authContainer,
                        {
                            paddingTop: showBackButton
                                ? 20
                                : insets.top + (isInModal ? 60 : 40),
                        },
                    ]}
                    keyboardShouldPersistTaps="handled"
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

                    {mode === "signin" ? (
                        <SignInForm
                            email={email}
                            password={password}
                            errors={errors}
                            loading={loading}
                            focusedAuth={focusedAuth}
                            onEmailChange={onChange("email", setEmail)}
                            onPasswordChange={onChange("password", setPassword)}
                            onFocus={setFocusedAuth}
                            onBlur={() => setFocusedAuth(null)}
                            onSubmit={handleSubmit}
                            onSwitchToSignUp={switchToSignUp}
                            primaryButtonPressed={primaryButtonPressed}
                            onPrimaryPressIn={() =>
                                setPrimaryButtonPressed(true)
                            }
                            onPrimaryPressOut={() =>
                                setPrimaryButtonPressed(false)
                            }
                        />
                    ) : (
                        <SignUpForm
                            name={name}
                            email={email}
                            password={password}
                            confirmPassword={confirmPassword}
                            username={username}
                            phone={phone}
                            errors={errors}
                            loading={loading}
                            focusedAuth={focusedAuth}
                            onNameChange={onChange("name", setName)}
                            onEmailChange={onChange("email", setEmail)}
                            onPasswordChange={onChange("password", setPassword)}
                            onConfirmPasswordChange={onChange(
                                "confirmPassword",
                                setConfirmPassword
                            )}
                            onUsernameChange={onChange(
                                "username",
                                setUsername
                            )}
                            onPhoneChange={onChange("phone", setPhone)}
                            onFocus={setFocusedAuth}
                            onBlur={() => setFocusedAuth(null)}
                            onSubmit={handleSubmit}
                            onSwitchToSignIn={switchToSignIn}
                            primaryButtonPressed={primaryButtonPressed}
                            onPrimaryPressIn={() =>
                                setPrimaryButtonPressed(true)
                            }
                            onPrimaryPressOut={() =>
                                setPrimaryButtonPressed(false)
                            }
                        />
                    )}

                    {authError && (
                        <View style={styles.authErrorContainer}>
                            <Text style={styles.authErrorText}>{authError}</Text>
                        </View>
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
        fontWeight: "800",
        color: COLORS.text,
        marginBottom: 8,
        textAlign: "center",
    },
    authSubtitle: {
        fontSize: 16,
        color: COLORS.subText,
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 22,
        paddingHorizontal: 20,
    },
});
