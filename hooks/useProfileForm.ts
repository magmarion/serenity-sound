import { useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";

type FieldKey = "name" | "email" | "phone" | "username";

export function useProfileForm(
    profile: any,
    updateProfile: (data: any) => Promise<void>
) {
    const [hasChanges, setHasChanges] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const saveButtonOpacity = useRef(new Animated.Value(0)).current;

    const [localFields, setLocalFields] = useState({
        name: "",
        email: "",
        phone: "",
        username: "",
    });

    useEffect(() => {
        if (profile) {
            setLocalFields({
                name: profile.name || "",
                email: profile.email || "",
                phone: profile.phone || "",
                username: profile.username || "",
            });
        }
    }, [profile]);

    useEffect(() => {
        if (hasChanges) {
            Animated.timing(saveButtonOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [hasChanges, saveButtonOpacity]);

    const fieldConfigs = useMemo(
        () => [
            {
                key: "name" as FieldKey,
                label: "Name",
                icon: "person" as const,
                keyboardType: "default" as const,
            },
            {
                key: "email" as FieldKey,
                label: "Email*",
                icon: "mail" as const,
                keyboardType: "email-address" as const,
            },
            {
                key: "phone" as FieldKey,
                label: "Phone",
                icon: "call" as const,
                keyboardType: "phone-pad" as const,
            },
            {
                key: "username" as FieldKey,
                label: "Username",
                icon: "at" as const,
                keyboardType: "default" as const,
            },
        ],
        []
    );

    const handleSaveChanges = async () => {
        if (!profile) return;

        try {
            const updatedProfile = {
                ...profile,
                ...localFields,
            };

            const { uid, createdAt, updatedAt, ...changes } = updatedProfile;
            await updateProfile(changes);

            setSaveSuccess(true);

            setTimeout(() => {
                Animated.timing(saveButtonOpacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }).start(() => {
                    setSaveSuccess(false);
                    setHasChanges(false);
                });
            }, 1200);
        } catch (error) {
            console.error("Failed to save profile", error);
        }
    };

    return {
        localFields,
        setLocalFields,
        hasChanges,
        setHasChanges,
        saveSuccess,
        saveButtonOpacity,
        fieldConfigs,
        handleSaveChanges,
    };
}
