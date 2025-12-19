// app/(modal)/profile.tsx
import type { UserProfile } from "@/store/auth-store";
import { useAuthStore } from "@/store/auth-store";
import { Avatar } from "@/components/Avatar";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { memo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Mode = "signin" | "signup";

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

function ProfileScreen() {
    const router = useRouter();
    const {
        user,
        profile,
        isAuthenticated,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateProfile,
    } = useAuthStore();

    console.log("ProfileScreen render - user:", user);
    console.log("ProfileScreen render - isAuthenticated:", isAuthenticated);
    console.log("ProfileScreen render - isLoading:", isLoading);

    const [mode, setMode] = useState<Mode>("signin");
    const [focused, setFocused] = useState<FieldKey | null>(null);
    const [focusedAuth, setFocusedAuth] = useState<string | null>(null);

    const [headerButtonPressed, setHeaderButtonPressed] = useState(false);
    const [primaryButtonPressed, setPrimaryButtonPressed] = useState(false);
    const [secondaryButtonPressed, setSecondaryButtonPressed] = useState(false);
    const [securityRowPressed, setSecurityRowPressed] = useState(false);
    const [draftProfile, setDraftProfile] = useState<UserProfile | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [signupUsername, setSignupUsername] = useState("");
    const [signupPhone, setSignupPhone] = useState("");

    const [localFields, setLocalFields] = useState({
        name: "",
        email: "",
        phone: "",
        username: "",
    });

    React.useEffect(() => {
        if (profile) {
            setDraftProfile(profile);
            setLocalFields({
                name: profile.name || "",
                email: profile.email || "",
                phone: profile.phone || "",
                username: profile.username || "",
            });
        }
    }, [profile]);

    const fieldConfigs = React.useMemo(() => [
        { key: "name" as FieldKey, label: "Name", icon: "person" as const, keyboardType: "default" as const },
        { key: "email" as FieldKey, label: "Email*", icon: "mail" as const, keyboardType: "email-address" as const },
        { key: "phone" as FieldKey, label: "Phone", icon: "call" as const, keyboardType: "phone-pad" as const },
        { key: "username" as FieldKey, label: "Username", icon: "at" as const, keyboardType: "default" as const },
    ], []);

    const handleFieldFocus = React.useCallback((key: FieldKey) => {
        setFocused(key);
    }, []);

    const handleFieldBlurWithSave = React.useCallback((key: FieldKey) => {
        setFocused(null);
        if (draftProfile) {
            setDraftProfile(prev =>
                prev ? {
                    ...prev,
                    [key]: localFields[key as keyof typeof localFields]
                } : prev
            );
        }
    }, [draftProfile, localFields]);

    const handleSaveChanges = async () => {
        if (!draftProfile || !profile) return;

        try {
            const { uid, createdAt, updatedAt, ...changes } = draftProfile;
            await updateProfile(changes);
            setSaveSuccess(true);

            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (error) {
            console.error("Error saving profile", error);
        }
    };

    const handleSignIn = async () => {
        if (!email || !password) return;
        setLoading(true);
        try {
            await signInWithEmail(email.trim(), password);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!email || !password || password !== confirmPassword) return;

        setLoading(true);
        try {
            await signUpWithEmail(email.trim(), password);

            await updateProfile({
                name,
                email: email.trim(),
                username:
                    signupUsername ||
                    (name ? `@${name.toLowerCase().replace(/\s/g, "")}` : ""),
                phone: signupPhone || "",
            });
        } finally {
            setLoading(false);
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

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    /*
       NOT AUTHENTICATED
     */
    if (!user) {
        return (
            <View style={styles.root} testID="profile/root">
                {/* Background */}
                <LinearGradient
                    colors={["#0B0F2E", "#05060A"]}
                    style={StyleSheet.absoluteFill}
                />
                <SafeAreaView style={styles.safe} edges={["top"]}>
                    <View style={styles.header} testID="profile/header">
                        <Pressable
                            onPressIn={() => setHeaderButtonPressed(true)}
                            onPressOut={() => setHeaderButtonPressed(false)}
                            onPress={() => router.back()}
                            testID="profile/back"
                            accessibilityRole="button"
                            accessibilityLabel="Back"
                        >
                            <View
                                style={[
                                    styles.headerBackButton,
                                    headerButtonPressed && styles.headerIconButtonPressed
                                ]}
                            >
                                <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                                <Text style={styles.backText}>Back</Text>
                            </View>
                        </Pressable>
                    </View>
                </SafeAreaView>

                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <ScrollView
                        contentContainerStyle={styles.authContainer}
                        showsVerticalScrollIndicator={false}
                    >

                        <Text style={styles.authTitle}>
                            {mode === "signin" ? "Sign in" : "Create Account"}
                        </Text>
                        <Text style={styles.authSubtitle}>
                            {mode === "signin"
                                ? "Sign in to save your preferences and access more features."
                                : "Create an account to get started"}
                        </Text>

                        <View style={styles.formContainer}>
                            {mode === "signup" && (
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputLabelRow}>
                                        <Text style={styles.inputLabel}>Name*</Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.inputFieldContainer,
                                            { borderColor: focusedAuth === "name" ? COLORS.accent : COLORS.inputBorder },
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
                                            onChangeText={setName}
                                            autoCapitalize="words"
                                            onFocus={() => setFocusedAuth("name")}
                                            onBlur={() => setFocusedAuth(null)}
                                        />
                                    </View>
                                </View>
                            )}

                            {mode === "signup" && (
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputLabelRow}>
                                        <Text style={styles.inputLabel}>Username</Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.inputFieldContainer,
                                            { borderColor: focusedAuth === "username" ? COLORS.accent : COLORS.inputBorder },
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
                                            value={signupUsername}
                                            onChangeText={setSignupUsername}
                                            autoCapitalize="none"
                                            onFocus={() => setFocusedAuth("username")}
                                            onBlur={() => setFocusedAuth(null)}
                                        />
                                    </View>
                                </View>
                            )}

                            {mode === "signup" && (
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputLabelRow}>
                                        <Text style={styles.inputLabel}>Phone</Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.inputFieldContainer,
                                            { borderColor: focusedAuth === "phone" ? COLORS.accent : COLORS.inputBorder },
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
                                            value={signupPhone}
                                            onChangeText={setSignupPhone}
                                            keyboardType="phone-pad"
                                            onFocus={() => setFocusedAuth("phone")}
                                            onBlur={() => setFocusedAuth(null)}
                                        />
                                    </View>
                                </View>
                            )}

                            <View style={styles.inputContainer}>
                                <View style={styles.inputLabelRow}>
                                    <Text style={styles.inputLabel}>Email*</Text>
                                </View>

                                <View
                                    style={[
                                        styles.inputFieldContainer,
                                        { borderColor: focusedAuth === "email" ? COLORS.accent : COLORS.inputBorder },
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
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        onFocus={() => setFocusedAuth("email")}
                                        onBlur={() => setFocusedAuth(null)}
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
                                        { borderColor: focusedAuth === "password" ? COLORS.accent : COLORS.inputBorder },
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
                                        onChangeText={setPassword}
                                        onFocus={() => setFocusedAuth("password")}
                                        onBlur={() => setFocusedAuth(null)}
                                    />
                                </View>
                            </View>

                            {mode === "signup" && (
                                <View style={styles.inputContainer}>
                                    <View style={styles.inputLabelRow}>
                                        <Text style={styles.inputLabel}>Confirm Password*</Text>
                                    </View>

                                    <View
                                        style={[
                                            styles.inputFieldContainer,
                                            { borderColor: focusedAuth === "confirmPassword" ? COLORS.accent : COLORS.inputBorder },
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
                                            onChangeText={setConfirmPassword}
                                            onFocus={() => setFocusedAuth("confirmPassword")}
                                            onBlur={() => setFocusedAuth(null)}
                                        />
                                    </View>
                                </View>
                            )}

                            <Pressable
                                onPressIn={() => setPrimaryButtonPressed(true)}
                                onPressOut={() => setPrimaryButtonPressed(false)}
                                onPress={mode === "signin" ? handleSignIn : handleSignUp}
                                disabled={loading}
                                style={styles.primaryButtonContainer}
                            >
                                <View style={[
                                    styles.primaryButton,
                                    primaryButtonPressed && styles.btnPressed,
                                    loading && styles.buttonDisabled
                                ]}>
                                    {loading ? (
                                        <ActivityIndicator color="#141414" size="small" />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>
                                            {mode === "signin" ? "Sign in" : "Create Account"}
                                        </Text>
                                    )}
                                </View>
                            </Pressable>

                            <View style={styles.modeSwitchContainer}>
                                <Text style={styles.modeSwitchText}>
                                    {mode === "signin"
                                        ? "Don't have an account?"
                                        : "Already have an account?"}
                                </Text>
                                <Pressable
                                    onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
                                >
                                    <Text style={styles.modeSwitchLink}>
                                        {mode === "signin" ? "Sign up" : "Sign in"}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        );
    }

    /*
      AUTHENTICATED PROFILE UI
    */
    return (
        <View style={styles.root} testID="profile/root">
            {/* Background */}
            <LinearGradient
                colors={["#0B0F2E", "#05060A"]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safe} edges={["top"]}>
                <View style={styles.header} testID="profile/header">
                    <Pressable
                        onPressIn={() => setHeaderButtonPressed(true)}
                        onPressOut={() => setHeaderButtonPressed(false)}
                        onPress={() => router.back()}
                        testID="profile/back"
                        accessibilityRole="button"
                        accessibilityLabel="Back"
                    >
                        <View
                            style={[
                                styles.headerBackButton,
                                headerButtonPressed && styles.headerIconButtonPressed
                            ]}
                        >
                            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                            <Text style={styles.backText}>Back</Text>
                        </View>
                    </Pressable>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
                        <Pressable onPress={handleChangeAvatar}>
                            <View style={styles.avatarCircle}>
                                <View style={styles.avatarInner}></View>
                                <Avatar
                                    size={56} // Matches your avatarInner dimensions
                                    fallbackType="gradient"
                                    borderRadius="circle"
                                    showContainer={false} // IMPORTANT: No container styling
                                    borderWidth={0} // No border
                                    testID="profile-avatar-inner"
                                />
                            </View>
                        </Pressable>

                        <Text style={styles.name}>
                            {profile?.name || user?.displayName || "User"}
                        </Text>

                        <Text style={styles.email}>
                            {profile?.email || user?.email || ""}
                        </Text>
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
                            const isFocused = focused === config.key;
                            const showError = false;
                            const borderColor = showError
                                ? COLORS.danger
                                : isFocused
                                    ? COLORS.accent
                                    : COLORS.inputBorder;

                            return (
                                <View key={config.key} style={styles.fieldBlock}>
                                    <Text style={styles.fieldLabel} testID={`profile/fieldLabel/${config.key}`}>
                                        {config.label}
                                    </Text>

                                    <View
                                        style={[
                                            styles.inputFieldContainer,
                                            { borderColor },
                                        ]}
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
                                            onChangeText={(text) =>
                                                setLocalFields(prev => ({
                                                    ...prev,
                                                    [config.key]: text
                                                }))
                                            }
                                            onFocus={() => {
                                                console.log("Focus on:", config.key);
                                                handleFieldFocus(config.key);
                                            }}
                                            onBlur={() => {
                                                console.log("Blur from:", config.key);
                                                handleFieldBlurWithSave(config.key);
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

                                    {idx < fieldConfigs.length - 1 && <View style={styles.fieldGap} />}
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
                        >
                            <View style={[
                                styles.securityRow,
                                securityRowPressed && styles.btnPressed
                            ]}>
                                <View style={styles.securityLeft}>
                                    <View style={styles.securityIconWrap}>
                                        <Ionicons name="lock-closed" color={COLORS.accent} size={16} />
                                    </View>
                                    <Text style={styles.securityText}>Change Password</Text>
                                </View>
                                <Ionicons name="chevron-forward" color="rgba(255,255,255,0.45)" size={18} />
                            </View>
                        </Pressable>
                    </LinearGradient>

                    {saveSuccess && (
                        <View
                            style={{
                                backgroundColor: "rgba(0,0,0,0.6)",
                                paddingVertical: 10,
                                paddingHorizontal: 14,
                                borderRadius: 10,
                                alignItems: "center",
                                marginBottom: 10,
                            }}
                        >
                            <Text style={{ color: "#fff", fontSize: 13 }}>
                                Profile updated successfully
                            </Text>
                        </View>
                    )}

                    <Pressable
                        onPressIn={() => setPrimaryButtonPressed(true)}
                        onPressOut={() => setPrimaryButtonPressed(false)}
                        onPress={handleSaveChanges}
                        style={styles.primaryButtonContainer}
                        testID="profile/save"
                        accessibilityRole="button"
                    >
                        <View style={[
                            styles.primaryButton,
                            primaryButtonPressed && styles.btnPressed
                        ]}>
                            <Text style={styles.primaryButtonText}>Save Changes</Text>
                        </View>
                    </Pressable>

                    <Pressable
                        onPressIn={() => setSecondaryButtonPressed(true)}
                        onPressOut={() => setSecondaryButtonPressed(false)}
                        onPress={signOut}
                        style={styles.secondaryButtonContainer}
                        testID="profile/signout"
                        accessibilityRole="button"
                    >
                        <View style={[
                            styles.secondaryButton,
                            secondaryButtonPressed && styles.btnPressed
                        ]}>
                            <Text style={styles.secondaryButtonText}>Sign Out</Text>
                        </View>
                    </Pressable>

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

export default memo(ProfileScreen);

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.bgBottom,
    },
    safe: {
        backgroundColor: "transparent",
    },
    header: {
        height: 52,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerIconButtonContainer: {
    },
    headerBackButton: {
        height: 40,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
    },

    backText: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "600",
    },

    headerIconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
    },

    headerIconButtonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.85,
    },
    authContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },

    keyboardAvoidingView: {
        flex: 1,
    },
    avatarBlock: {
        alignItems: "center",
        paddingTop: 32,
        paddingBottom: 18,
        marginBottom: 10,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    avatarInner: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: "#F7B26B",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    avatarBadge: {
        position: "absolute",
        right: -2,
        bottom: -2,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#F7B26B",
        borderWidth: 2,
        borderColor: COLORS.bgBottom,
        alignItems: "center",
        justifyContent: "center",
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
    formContainer: {
        gap: 20,
    },
    inputContainer: {
        gap: 8,
    },
    inputLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginLeft: 4,
    },
    inputLabel: {
        color: COLORS.subText,
        fontSize: 13,
        fontWeight: "500",
    },
    inputFieldContainer: {
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        backgroundColor: COLORS.inputBg,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    inputField: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        paddingVertical: 0,
        paddingHorizontal: 0,
        minHeight: 52,
    },
    modeSwitchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: 16,
    },
    modeSwitchText: {
        color: COLORS.subText,
        fontSize: 14,
    },
    modeSwitchLink: {
        color: COLORS.accent,
        fontSize: 14,
        fontWeight: "600",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    name: {
        marginTop: 10,
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "700",
        textAlign: 'center',
    },
    email: {
        marginTop: 3,
        color: COLORS.subText,
        fontSize: 12,
        textAlign: 'center',
    },
    sectionTitle: {
        marginTop: 10,
        marginBottom: 8,
        color: "rgba(255,255,255,0.60)",
        fontSize: 12,
        letterSpacing: 0.2,
    },
    card: {
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        overflow: "hidden",
        marginBottom: 10,
    },
    cardTopHighlight: {
        position: "absolute",
        left: -40,
        right: -40,
        top: -80,
        height: 140,
        backgroundColor: "rgba(255,255,255,0.06)",
        transform: [{ rotate: "-8deg" }],
    },
    fieldBlock: {
        width: "100%",
        marginBottom: 40,
    },
    fieldLabel: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 11,
        marginBottom: 6,
        marginLeft: 4,
    },
    inputRow: {
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: COLORS.inputBg,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    inputRowFocused: {
        shadowColor: COLORS.accent,
        shadowOpacity: 0.18,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    inputRowError: {
        backgroundColor: COLORS.dangerSoft,
    },
    inputIcon: {
        marginRight: 12,
        color: "rgba(255,255,255,0.80)",
    },
    inputFieldIcon: {
        marginRight: 12,
        color: COLORS.subText,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 14,
        paddingVertical: 10,
        paddingHorizontal: 0,
        minHeight: 44,
    },
    errorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 6,
        marginLeft: 4,
    },
    errorDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.danger,
    },
    errorText: {
        color: COLORS.danger,
        fontSize: 11,
    },
    fieldGap: {
        height: 10,
    },
    securityCard: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    securityRowContainer: {
        width: '100%',
    },
    securityRow: {
        height: 44,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        backgroundColor: "rgba(8,12,18,0.22)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
    },
    securityLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    securityIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.accentSoft,
    },
    securityText: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: "600",
    },
    primaryButtonContainer: {
        width: '100%',
        marginTop: 14,
    },
    primaryButton: {
        height: 48,
        borderRadius: 14,
        backgroundColor: COLORS.accent,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: COLORS.accent,
        shadowOpacity: 0.30,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
    },
    primaryButtonText: {
        color: "#141414",
        fontSize: 15,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
    secondaryButtonContainer: {
        width: '100%',
        marginTop: 10,
    },
    secondaryButton: {
        height: 48,
        borderRadius: 14,
        backgroundColor: "rgba(0,0,0,0.00)",
        borderWidth: 1,
        borderColor: "rgba(255,138,61,0.65)",
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        color: COLORS.accent,
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    btnPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.90,
    },
    bottomSpacer: {
        height: Platform.OS === 'ios' ? 40 : 20,
    },
});
