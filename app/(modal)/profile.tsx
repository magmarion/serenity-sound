import { AuthForm } from "@/components/auth";
import { BackButton } from "@/components/BackButton";
import { useAuthStore } from "@/store/auth-store";
import { profileStyles as styles } from "@/styles/modal/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { memo, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FieldKey = "name" | "email" | "phone" | "username";

const COLORS = {
    bgTop: "#05070B",
    bgBottom: "#0A0F16",
    cardTop: "rgba(255,255,255,0.07)",
    cardBottom: "rgba(255,255,255,0.03)",
    cardBorder: "rgba(255,255,255,0.10)",
    text: "rgba(255,255,255,0.92)",
    subText: "rgba(255,255,255,0.55)",
    inputBg: "rgba(8,12,18,0.35)",
    inputBorder: "rgba(255,255,255,0.16)",
    accent: "#FF8A3D",
    accentSoft: "rgba(255,138,61,0.20)",
    danger: "#FF5A52",
    dangerSoft: "rgba(255,90,82,0.16)",
} as const;

// Add this right after your COLORS object
const localStyles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingContainer: {
        backgroundColor: COLORS.cardTop,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    loadingText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
});

function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
        profile,
        isAuthenticated,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateProfile,
    } = useAuthStore();

    const [secondaryButtonPressed, setSecondaryButtonPressed] = useState(false);
    const [saveButtonPressed, setSaveButtonPressed] = useState(false);
    const [securityRowPressed, setSecurityRowPressed] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const saveButtonOpacity = useRef(new Animated.Value(0)).current;
    const [signOutLoading, setSignOutLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Local state for field values
    const [localFields, setLocalFields] = useState({
        name: "",
        email: "",
        phone: "",
        username: "",
    });

    React.useEffect(() => {
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

    // Field configurations (static, doesn't depend on values)
    const fieldConfigs = React.useMemo(
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

    const handleAuthSubmit = async (
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
        if (mode === "signin") {
            await signInWithEmail(data.email, data.password);
            // Don't navigate away - user stays in modal, will see authenticated view
        } else {
            // Sign up flow
            await signUpWithEmail(data.email, data.password);

            // Update profile with additional info
            if (data.name || data.username || data.phone) {
                await updateProfile({
                    name: data.name || "",
                    username:
                        data.username ||
                        (data.name ? `@${data.name.toLowerCase().replace(/\s/g, "")}` : ""),
                    phone: data.phone || "",
                });
            }
            // Don't navigate away - user stays in modal, will see authenticated view
        }
    };

    const handleChangeAvatar = () => {
        Alert.alert(
            "Change profile photo",
            "Choose how you want to update your photo",
            [
                { text: "Take photo", onPress: openCamera },
                { text: "Choose from library", onPress: openImageLibrary },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };

    // Add this function after your other handlers (like handleSaveChanges, handleAuthSubmit, etc.)
    const handleSignOut = async () => {
        setSignOutLoading(true);
        try {
            await signOut();
            // Dismiss all modals and go to landing
            router.dismissAll();
            router.replace("/");
        } catch (error) {
            console.error("Sign out error:", error);
            setSignOutLoading(false);
        }
    };

    const openCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchCameraAsync({
            cameraType: ImagePicker.CameraType.front,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled) return;

        await updateProfile({
            photoURL: result.assets[0].uri,
        });
    };

    const openImageLibrary = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled) return;

        await updateProfile({
            photoURL: result.assets[0].uri,
        });
    };

    /*
       NOT AUTHENTICATED - USING REUSABLE AuthForm
     */
    if (!isAuthenticated) {
        return (
            <View style={styles.root} testID="profile/root">
                {/* Background */}
                <LinearGradient
                    colors={["#0B0F2E", "#05060A"]}
                    style={StyleSheet.absoluteFill}
                />
                <View
                    style={[styles.header, { paddingTop: insets.top + 10 }]}
                    testID="profile/header"
                >
                    <BackButton
                        onPress={() => router.back()}
                        accessibilityLabel="Go back to settings"
                        iconColor={COLORS.text}
                        iconSize={20}
                    />
                </View>

                <AuthForm
                    mode="signin"
                    onSubmit={handleAuthSubmit}
                    onBack={() => router.back()}
                    showBackButton={false} // We already have our own back button
                    isInModal={true}
                />
            </View>
        );
    }

    /*
      AUTHENTICATED PROFILE UI - UNCHANGED
    */
    return (
        <View style={styles.root} testID="profile/root">
            {signOutLoading && (
                <View style={localStyles.overlay}>
                    <View style={localStyles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.accent} />
                        <Text style={localStyles.loadingText}>Signing you out...</Text>
                    </View>
                </View>
            )}
            {/* Background */}
            <LinearGradient
                colors={["#0B0F2E", "#05060A"]}
                style={StyleSheet.absoluteFill}
            />
            <View
                style={[styles.header, { paddingTop: insets.top + 10 }]}
                testID="profile/header"
            >
                <BackButton
                    onPress={() => router.back()}
                    accessibilityLabel="Go back to settings"
                    iconColor={COLORS.text}
                    iconSize={20}
                />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    testID="profile/scroll"
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                >
                    <View style={styles.avatarBlock}>
                        <Pressable
                            accessibilityLabel="Profile photo"
                            testID="profile/avatar"
                        >
                            <View style={styles.avatarCircle}>
                                <View style={styles.avatarInner}>
                                    {profile?.photoURL ? (
                                        <Image
                                            source={{ uri: profile.photoURL }}
                                            style={{ width: "100%", height: "100%", borderRadius: 28 }}
                                            contentFit="cover"
                                        />
                                    ) : (
                                        <Ionicons name="person" size={100} color="#1C1208" />
                                    )}
                                </View>
                            </View>
                        </Pressable>

                        {/* Edit button BELOW the image */}
                        <Pressable
                            onPress={handleChangeAvatar}
                            accessibilityRole="button"
                            accessibilityLabel="Edit profile"
                            accessibilityHint="Change profile photo and personal information"
                            style={styles.editProfileButton}
                            testID="profile/edit"
                        >
                            <View style={styles.editProfileButtonInner}>
                                <Ionicons
                                    name="create-outline"
                                    size={14}
                                    color={COLORS.accent}
                                />
                                <Text style={styles.editProfileButtonText}>Edit profile</Text>
                            </View>
                        </Pressable>
                    </View>

                    <Text style={styles.sectionTitle} testID="profile/personalInfoTitle">
                        Personal Information
                    </Text>

                    <LinearGradient
                        colors={[COLORS.cardTop, COLORS.cardBottom]}
                        style={styles.card}
                    >
                        <View style={styles.cardTopHighlight} />

                        {fieldConfigs.map((config, idx) => {
                            const showError = false;
                            const borderColor = showError
                                ? COLORS.danger
                                : COLORS.inputBorder;

                            return (
                                <View key={config.key} style={styles.fieldBlock}>
                                    <Text
                                        style={styles.fieldLabel}
                                        testID={`profile/fieldLabel/${config.key}`}
                                    >
                                        {config.label}
                                    </Text>

                                    <View
                                        style={[styles.inputFieldContainer, { borderColor }]}
                                        testID={`profile/inputRow/${config.key}`}
                                    >
                                        <Ionicons
                                            name={config.icon}
                                            color={showError ? COLORS.danger : COLORS.subText}
                                            size={16}
                                            style={styles.inputFieldIcon}
                                        />
                                        <TextInput
                                            editable={true}
                                            style={styles.inputField}
                                            value={localFields[config.key]}
                                            keyboardType={config.keyboardType}
                                            onChangeText={(text) => {
                                                setLocalFields((prev) => ({
                                                    ...prev,
                                                    [config.key]: text,
                                                }));
                                                setHasChanges(true);
                                            }}
                                            testID={`profile/input/${config.key}`}
                                            autoCorrect={false}
                                            autoCapitalize="none"
                                            autoComplete="off"
                                            importantForAutofill="no"
                                        />
                                    </View>

                                    {showError && (
                                        <View style={styles.errorRow} testID={`profile/error/${config.key}`}>
                                            <View style={styles.errorDot} />
                                            <Text style={styles.errorText}>{"Error message"}</Text>
                                        </View>
                                    )}

                                    {idx < fieldConfigs.length - 1 && (
                                        <View style={styles.fieldGap} />
                                    )}
                                </View>
                            );
                        })}
                    </LinearGradient>

                    <Text style={styles.sectionTitle} testID="profile/securityTitle">
                        Security
                    </Text>

                    <LinearGradient
                        colors={[COLORS.cardTop, COLORS.cardBottom]}
                        style={[styles.card, styles.securityCard]}
                    >
                        <Pressable
                            onPressIn={() => setSecurityRowPressed(true)}
                            onPressOut={() => setSecurityRowPressed(false)}
                            onPress={() => console.log("Change password pressed")}
                            style={styles.securityRowContainer}
                            testID="profile/changePassword"
                            accessibilityRole="button"
                            accessibilityLabel="Change password"
                            accessibilityHint="Opens password change screen"
                        >
                            <View
                                style={[
                                    styles.securityRow,
                                    securityRowPressed && styles.btnPressed,
                                ]}
                            >
                                <View style={styles.securityLeft}>
                                    <View style={styles.securityIconWrap}>
                                        <Ionicons name="lock-closed" color={COLORS.accent} size={16} />
                                    </View>
                                    <Text style={styles.securityText}>Change Password</Text>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    color="rgba(255,255,255,0.45)"
                                    size={18}
                                />
                            </View>
                        </Pressable>
                    </LinearGradient>

                    {(hasChanges || saveSuccess) && (
                        <Animated.View
                            style={{
                                opacity: saveButtonOpacity,
                                transform: [
                                    {
                                        translateY: saveButtonOpacity.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [8, 0],
                                        }),
                                    },
                                ],
                            }}
                        >
                            <Pressable
                                onPressIn={() => setSaveButtonPressed(true)}
                                onPressOut={() => setSaveButtonPressed(false)}
                                onPress={handleSaveChanges}
                                style={styles.primaryButtonContainer}
                                accessibilityRole="button"
                                accessibilityLabel="Save profile changes"
                            >
                                <View
                                    style={[
                                        styles.primaryButton,
                                        saveButtonPressed && styles.btnPressed,
                                    ]}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        {saveSuccess ? "Changes saved" : "Save changes"}
                                    </Text>
                                </View>
                            </Pressable>
                        </Animated.View>
                    )}

                    <Pressable
                        onPressIn={() => setSecondaryButtonPressed(true)}
                        onPressOut={() => setSecondaryButtonPressed(false)}
                        onPress={handleSignOut}
                        disabled={signOutLoading}
                        style={styles.secondaryButtonContainer}
                        testID="profile/signout"
                        accessibilityRole="button"
                        accessibilityLabel="Sign out"
                        accessibilityHint="Logs you out of your account"
                    >
                        <View
                            style={[
                                styles.secondaryButton,
                                secondaryButtonPressed && styles.btnPressed,
                                signOutLoading && styles.buttonDisabled,
                            ]}
                        >
                            {signOutLoading ? (
                                <ActivityIndicator color={COLORS.accent} size="small" />
                            ) : (
                                <Text style={styles.secondaryButtonText}>Sign Out</Text>
                            )}
                        </View>
                    </Pressable>

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

export default memo(ProfileScreen);