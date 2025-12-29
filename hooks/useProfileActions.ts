import { useRouter } from "expo-router";
import { useState } from "react";

type AuthData = {
    email: string;
    password: string;
    name?: string;
    username?: string;
    phone?: string;
    confirmPassword?: string;
};

export function useProfileActions({
    signInWithEmail,
    signUpWithEmail,
    updateProfile,
    signOut,
}: {
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
    signOut: () => Promise<void>;
}) {
    const router = useRouter();
    const [signOutLoading, setSignOutLoading] = useState(false);

    const handleAuthSubmit = async (
        mode: "signin" | "signup",
        data: AuthData
    ) => {
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
                            ? `@${data.name.toLowerCase().replace(/\s/g, "")}`
                            : ""),
                    phone: data.phone || "",
                });
            }
        }
    };

    const handleSignOut = async () => {
        setSignOutLoading(true);

        try {
            await signOut();
            router.dismissAll();
            router.replace("/");
        } catch (error) {
            console.error("Sign out error:", error);
            setSignOutLoading(false);
        }
    };

    return {
        handleAuthSubmit,
        handleSignOut,
        signOutLoading,
    };
}
