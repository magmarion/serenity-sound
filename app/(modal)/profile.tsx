import type { UserProfile } from "@/store/auth-store";
import { useAuthStore } from "@/store/auth-store";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { memo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { profileStyles as styles } from "./styles/profile.styles";

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
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateProfile,
    } = useAuthStore();

    const [mode, setMode] = useState<Mode>("signin");
    const [focused, setFocused] = useState<FieldKey | null>(null);
    const [focusedAuth, setFocusedAuth] = useState<string | null>(null);

    // State for pressable buttons
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

    // Local state for field values (separate from draftProfile to prevent focus loss)
    const [localFields, setLocalFields] = useState({
        name: "",
        email: "",
        phone: "",
        username: "",
    });

    React.useEffect(() => {
        if (!isAuthenticated) {
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setName("");
            setMode("signin");
        }
    }, [isAuthenticated]);

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

    // Field configurations (static, doesn't depend on values)
    const fieldConfigs = React.useMemo(() => [
        { key: "name" as FieldKey, label: "Name", icon: "person" as const, keyboardType: "default" as const },
        { key: "email" as FieldKey, label: "Email*", icon: "mail" as const, keyboardType: "email-address" as const },
        { key: "phone" as FieldKey, label: "Phone", icon: "call" as const, keyboardType: "phone-pad" as const },
        { key: "username" as FieldKey, label: "Username", icon: "at" as const, keyboardType: "default" as const },
    ], []);

    const handleFieldFocus = React.useCallback((key: FieldKey) => {
        setFocused(key);
    }, []);

    // Update draftProfile when a field loses focus
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

    /*
       NOT AUTHENTICATED
     */

    if (!isAuthenticated) {
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
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        mode === "signin"
                                            ? "Switch to sign up"
                                            : "Switch to sign in"
                                    }
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
                        <Pressable
                            onPress={handleChangeAvatar}
                            accessibilityRole="button"
                            accessibilityLabel="Change profile photo"
                            accessibilityHint="Opens options to update your profile picture"
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

                                <View style={styles.avatarBadge}>
                                    <Ionicons name="camera" size={32} color="#1C1208" />
                                </View>
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
                                            // Important: Add these props for better focus handling
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
                            accessibilityRole="button"
                            accessibilityLabel="Change password"
                            accessibilityHint="Opens password change screen"
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
                        accessibilityLabel="Save profile changes"
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
                        accessibilityLabel="Sign out"
                        accessibilityHint="Logs you out of your account"
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