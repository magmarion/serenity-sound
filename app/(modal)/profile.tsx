// app/(modal)/profile.tsx
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    ArrowLeft,
    Camera,
    ChevronRight,
    Image as ImageIcon,
    Mail,
    Phone,
    User,
} from "lucide-react-native";
import { Ionicons } from '@expo/vector-icons'; // Added for auth buttons
import { useRouter } from 'expo-router'; // Added for navigation
import { useAuthStore } from '@/store/auth-store'; // Added for auth state

type FieldKey = "fullName" | "email" | "phone" | "username";

type Field = {
    key: FieldKey;
    label: string;
    value: string;
    icon: React.ComponentType<{ color?: string; size?: number }>;
    keyboardType?: "default" | "email-address" | "phone-pad";
    errorText?: string;
    isError?: boolean;
};

const COLORS = {
    bgTop: "#05070B",
    bgBottom: "#0A0F16",
    cardTop: "rgba(255,255,255,0.07)",
    cardBottom: "rgba(255,255,255,0.03)",
    cardBorder: "rgba(255,255,255,0.10)",
    text: "rgba(255,255,255,0.92)",
    subText: "rgba(255,255,255,0.55)",
    placeholder: "rgba(255,255,255,0.40)",
    inputBg: "rgba(8,12,18,0.35)",
    inputBorder: "rgba(255,255,255,0.16)",
    accent: "#FF8A3D",
    accentSoft: "rgba(255,138,61,0.20)",
    danger: "#FF5A52",
    dangerSoft: "rgba(255,90,82,0.16)",
} as const;

function ProfileScreen() {
    const [focused, setFocused] = useState<FieldKey | null>(null);
    const router = useRouter();

    // Get auth state and actions from store
    const { user, profile, isAuthenticated, signInWithGoogle, signOut, updateProfile } = useAuthStore();

    const fields = useMemo<Field[]>(
        () => [
            {
                key: "fullName",
                label: "Full Name",
                value: profile?.name || "Not set",
                icon: User,
            },
            {
                key: "email",
                label: "Email*",
                value: profile?.email || user?.email || "Not signed in",
                icon: Mail,
                keyboardType: "email-address",
            },
            {
                key: "phone",
                label: "Phone",
                value: "+460709121212", // You can connect this to profile data later
                icon: Phone,
                keyboardType: "phone-pad",
            },
            {
                key: "username",
                label: "Username",
                value: "@crazyfrog-1", // You can connect this to profile data later
                icon: User,
            },
        ],
        [profile, user] // Re-render when profile or user changes
    );

    const handleSaveChanges = async () => {
        if (!isAuthenticated) return;

        try {
            // Get the current value from the fullName field
            const nameField = fields.find(f => f.key === 'fullName');
            if (nameField) {
                await updateProfile({ name: nameField.value });
                console.log('Profile updated successfully');
                // You could add a toast message here
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            // You could show an error message here
        }
    };

    // If user is NOT authenticated, show sign-in UI
    if (!isAuthenticated) {
        return (
            <View style={styles.root} testID="profile/root">
                <LinearGradient
                    colors={[COLORS.bgTop, COLORS.bgBottom]}
                    style={StyleSheet.absoluteFill}
                />

                <SafeAreaView style={styles.safe} edges={["top"]}>
                    <View style={styles.header} testID="profile/header">
                        <Pressable
                            style={({ pressed }) => [
                                styles.headerIconButton,
                                pressed && styles.headerIconButtonPressed,
                            ]}
                            onPress={() => router.back()}
                            testID="profile/back"
                            accessibilityRole="button"
                            accessibilityLabel="Back"
                        >
                            <ArrowLeft color={COLORS.text} size={20} />
                        </Pressable>

                        <Text style={styles.headerTitle} testID="profile/title">
                            Profile
                        </Text>

                        <View style={styles.headerRightSpacer} />
                    </View>
                </SafeAreaView>

                <View style={styles.authContainer}>
                    <View style={styles.avatarBlock} testID="profile/avatarBlock">
                        <View style={styles.avatarOuterGlow} />
                        <View style={styles.avatarCircle} testID="profile/avatar">
                            <View style={styles.avatarInner}>
                                <Ionicons name="person" size={32} color="#1C1208" />
                            </View>
                        </View>
                    </View>

                    <Text style={styles.authTitle}>Sign In to Your Account</Text>
                    <Text style={styles.authSubtitle}>
                        Sign in to save your preferences and access all features.
                    </Text>

                    {/* Google Sign In Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.googleButton,
                            pressed && styles.btnPressed,
                        ]}
                        onPress={signInWithGoogle}
                        testID="profile/google-signin"
                    >
                        <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                    </Pressable>

                    {/* Apple Sign In Button (Optional - for later) */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.appleButton,
                            pressed && styles.btnPressed,
                        ]}
                        onPress={() => { console.log("Apple sign-in not yet implemented"); }}
                        testID="profile/apple-signin"
                    >
                        <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                        <Text style={styles.appleButtonText}>Sign in with Apple</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    // If user IS authenticated, show the regular profile form
    return (
        <View style={styles.root} testID="profile/root">
            <LinearGradient
                colors={[COLORS.bgTop, COLORS.bgBottom]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safe} edges={["top"]}>
                <View style={styles.header} testID="profile/header">
                    <Pressable
                        style={({ pressed }) => [
                            styles.headerIconButton,
                            pressed && styles.headerIconButtonPressed,
                        ]}
                        onPress={() => router.back()}
                        testID="profile/back"
                        accessibilityRole="button"
                        accessibilityLabel="Back"
                    >
                        <ArrowLeft color={COLORS.text} size={20} />
                    </Pressable>

                    <Text style={styles.headerTitle} testID="profile/title">
                        Profile
                    </Text>

                    <View style={styles.headerRightSpacer} />
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                testID="profile/scroll"
            >
                <View style={styles.avatarBlock} testID="profile/avatarBlock">
                    <View style={styles.avatarOuterGlow} />
                    <View style={styles.avatarCircle} testID="profile/avatar">
                        <View style={styles.avatarInner}>
                            {profile?.photoURL ? (
                                // You would use an Image component here for the actual photo
                                <ImageIcon color="#1C1208" size={32} />
                            ) : (
                                <Ionicons name="person" size={32} color="#1C1208" />
                            )}
                        </View>
                        <View style={styles.avatarBadge} testID="profile/avatarBadge">
                            <Camera color="#1C1208" size={14} />
                        </View>
                    </View>

                    <Text style={styles.name} testID="profile/name">
                        {profile?.name || user?.displayName || "User"}
                    </Text>
                    <Text style={styles.email} testID="profile/email">
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

                    {fields.map((f, idx) => {
                        const Icon = f.icon;
                        const isFocused = focused === f.key;
                        const showError = Boolean(f.isError);
                        const borderColor = showError
                            ? COLORS.danger
                            : isFocused
                                ? COLORS.accent
                                : COLORS.inputBorder;

                        return (
                            <View key={f.key} style={styles.fieldBlock}>
                                <Text style={styles.fieldLabel} testID={`profile/fieldLabel/${f.key}`}>
                                    {f.label}
                                </Text>

                                <View
                                    style={[
                                        styles.inputRow,
                                        { borderColor },
                                        showError && styles.inputRowError,
                                        isFocused && styles.inputRowFocused,
                                    ]}
                                    testID={`profile/inputRow/${f.key}`}
                                >
                                    <View
                                        style={[
                                            styles.inputIconWrap,
                                            showError && styles.inputIconWrapError,
                                        ]}
                                        testID={`profile/inputIcon/${f.key}`}
                                    >
                                        <Icon
                                            color={showError ? COLORS.danger : "rgba(255,255,255,0.80)"}
                                            size={16}
                                        />
                                    </View>

                                    <TextInput
                                        style={styles.input}
                                        value={f.value}
                                        placeholder={f.label}
                                        placeholderTextColor={COLORS.placeholder}
                                        keyboardType={f.keyboardType ?? "default"}
                                        onChangeText={(text) => {
                                            // For a real implementation, you'd update state here
                                            console.log(`Changed ${f.key} to: ${text}`);
                                        }}
                                        onFocus={() => {
                                            console.log("Profile: focus", f.key);
                                            setFocused(f.key);
                                        }}
                                        onBlur={() => {
                                            console.log("Profile: blur", f.key);
                                            setFocused((prev) => (prev === f.key ? null : prev));
                                        }}
                                        testID={`profile/input/${f.key}`}
                                    />
                                </View>

                                {showError ? (
                                    <View style={styles.errorRow} testID={`profile/error/${f.key}`}>
                                        <View style={styles.errorDot} />
                                        <Text style={styles.errorText}>{f.errorText ?? ""}</Text>
                                    </View>
                                ) : null}

                                {idx < fields.length - 1 ? <View style={styles.fieldGap} /> : null}
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
                    <View style={styles.securityRow} testID="profile/changePassword">
                        <View style={styles.securityLeft}>
                            <View style={styles.securityIconWrap}>
                                <User color={COLORS.accent} size={16} />
                            </View>
                            <Text style={styles.securityText}>Change Password</Text>
                        </View>
                        <ChevronRight color="rgba(255,255,255,0.45)" size={18} />
                    </View>
                </LinearGradient>

                <Pressable
                    style={({ pressed }) => [styles.primaryButton, pressed && styles.btnPressed]}
                    onPress={handleSaveChanges}
                    testID="profile/save"
                    accessibilityRole="button"
                >
                    <Text style={styles.primaryButtonText}>Save Changes</Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && styles.btnPressed,
                    ]}
                    onPress={signOut}
                    testID="profile/signout"
                    accessibilityRole="button"
                >
                    <Text style={styles.secondaryButtonText}>Sign Out</Text>
                </Pressable>

                <View style={styles.bottomSpacer} />
            </ScrollView>
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
    headerTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    headerRightSpacer: {
        width: 40,
        height: 40,
    },
    authContainer: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    authTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 30,
        marginBottom: 10,
        textAlign: 'center',
    },
    authSubtitle: {
        fontSize: 16,
        color: COLORS.subText,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4285F4",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: "100%",
        marginBottom: 16,
    },
    googleButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 12,
    },
    appleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: "100%",
    },
    appleButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 12,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    avatarBlock: {
        alignItems: "center",
        paddingTop: 8,
        paddingBottom: 18,
    },
    avatarOuterGlow: {
        position: "absolute",
        width: 150,
        height: 150,
        borderRadius: 75,
        top: -6,
        backgroundColor: "rgba(255,138,61,0.06)",
        shadowColor: COLORS.accent,
        shadowOpacity: 0.20,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 10 },
    },
    avatarCircle: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#F7B26B",
        alignItems: "center",
        justifyContent: "center",
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
    name: {
        marginTop: 10,
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "700",
    },
    email: {
        marginTop: 3,
        color: COLORS.subText,
        fontSize: 12,
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
    },
    fieldLabel: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 11,
        marginBottom: 6,
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
    },
    inputRowError: {
        backgroundColor: COLORS.dangerSoft,
    },
    inputIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    inputIconWrapError: {
        backgroundColor: "rgba(255,90,82,0.12)",
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 13,
        paddingVertical: 10,
    },
    errorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 6,
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
        fontSize: 13,
        fontWeight: "600",
    },
    primaryButton: {
        marginTop: 14,
        height: 48,
        borderRadius: 14,
        backgroundColor: COLORS.accent,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: COLORS.accent,
        shadowOpacity: 0.30,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
    },
    primaryButtonText: {
        color: "#141414",
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
    secondaryButton: {
        marginTop: 10,
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
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    btnPressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.90,
    },
    bottomSpacer: {
        height: 28,
    },
});