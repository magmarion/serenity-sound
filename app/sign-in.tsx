import { AuthForm } from "@/components/auth";
import { useAuthStore } from "@/store/auth-store";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function SignInScreen() {
    const params = useLocalSearchParams();
    const initialMode = params.mode === "signup" ? "signup" : "signin";

    const { signInWithEmail, signUpWithEmail, updateProfile } =
        useAuthStore();

    const [authError, setAuthError] = useState<string | null>(null);

    const handleSubmit = async (
        mode: "signin" | "signup",
        data: {
            email: string;
            password: string;
            name?: string;
            username?: string;
            phone?: string;
            confirmPassword?: string;
        }
    ) => {
        setAuthError(null);

        try {
            if (mode === "signin") {
                await signInWithEmail(data.email, data.password);
            } else {
                await signUpWithEmail(data.email, data.password);

                if (data.name || data.username || data.phone) {
                    await updateProfile({
                        name: data.name || "",
                        username:
                            data.username ||
                            (data.name
                                ? `@${data.name
                                    .toLowerCase()
                                    .replace(/\s/g, "")}`
                                : ""),
                        phone: data.phone || "",
                    });
                }
            }

            router.replace("/(tabs)/home");
        } catch (error: any) {
            const code = error?.code;

            if (mode === "signin") {
                if (code === "auth/invalid-credential") {
                    setAuthError(
                        "No account found with this email and password."
                    );
                } else {
                    setAuthError(
                        "Failed to sign in. Please try again."
                    );
                }
            }

            if (mode === "signup") {
                if (code === "auth/email-already-in-use") {
                    setAuthError(
                        "An account with this email already exists. Try signing in instead."
                    );
                } else {
                    setAuthError(
                        "Failed to create account. Please try again."
                    );
                }
            }
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={{ flex: 1 }}>
            <AuthForm
                mode={initialMode}
                onSubmit={handleSubmit}
                authError={authError}
                onModeChange={() => setAuthError(null)}
                onUserInput={() => setAuthError(null)}
                onBack={handleBack}
                showBackButton={true}
                isInModal={false}
            />
        </View>
    );
}
