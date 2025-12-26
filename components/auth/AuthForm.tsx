import { BackButton } from "@/components/BackButton";
import { COLORS } from "@/styles/modal/profile.styles";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
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

    const validate = useCallback(
        (values: any) => {
            const schema = mode === "signin" ? signInSchema : signUpSchema;
            const result = schema.safeParse(values);

            if (result.success) {
                setErrors({});
                return true;
            }

            const nextErrors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const key = issue.path[0];
                if (key) nextErrors[key as string] = issue.message;
            }

            setErrors(nextErrors);
            return false;
        },
        [mode]
    );

    const handleSubmit = useCallback(async () => {
        if (loading) return;

        const isValid = validate({
            email,
            password,
            confirmPassword,
            name,
            username,
            phone,
        });

        if (!isValid) return;

        setLoading(true);
        try {
            await onSubmit(mode, {
                email,
                password,
                name,
                confirmPassword,
                username,
                phone,
            });
        } finally {
            setLoading(false);
        }
    }, [
        validate,
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
                validate({
                    email,
                    password,
                    confirmPassword,
                    name,
                    username,
                    phone,
                    [field]: value,
                });
            };

    return (
        <View style={localStyles.root}>
            <LinearGradient
                colors={["#0B0F2E", "#05060A"]}
                style={StyleSheet.absoluteFill}
            />

            {/* HEADER — RESTORED */}
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
                            onSwitchToSignUp={() => setMode("signup")}
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
                            onSwitchToSignIn={() => setMode("signin")}
                            primaryButtonPressed={primaryButtonPressed}
                            onPrimaryPressIn={() =>
                                setPrimaryButtonPressed(true)
                            }
                            onPrimaryPressOut={() =>
                                setPrimaryButtonPressed(false)
                            }
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
