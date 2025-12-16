import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    ActivityIndicator,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";

type Mode = "signin" | "signup";

type FieldKey = "fullName" | "email" | "phone" | "username";

type Field = {
    key: FieldKey;
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    keyboardType?: "default" | "email-address" | "phone-pad";
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

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const fields = useMemo<Field[]>(
        () => [
            {
                key: "fullName",
                label: "Full Name",
                value: profile?.name || "",
                icon: "person",
            },
            {
                key: "email",
                label: "Email",
                value: profile?.email || user?.email || "",
                icon: "mail",
                keyboardType: "email-address",
            },
            {
                key: "phone",
                label: "Phone",
                value: "+460709121212",
                icon: "call",
                keyboardType: "phone-pad",
            },
            {
                key: "username",
                label: "Username",
                value: "@crazyfrog-1",
                icon: "person",
            },
        ],
        [profile, user]
    );

    const handleSaveChanges = async () => {
        const nameField = fields.find(f => f.key === "fullName");
        if (nameField) {
            await updateProfile({ name: nameField.value });
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
            if (name) await updateProfile({ name });
        } finally {
            setLoading(false);
        }
    };

    /* -------------------------
       NOT AUTHENTICATED
    -------------------------- */

    if (!isAuthenticated) {
        return (
            <View style={styles.root}>
                <LinearGradient
                    colors={[COLORS.bgTop, COLORS.bgBottom]}
                    style={StyleSheet.absoluteFill}
                />

                <SafeAreaView style={styles.safe}>
                    <View style={styles.header}>
                        <Pressable onPress={() => router.back()}>
                            <View style={styles.headerIconButton}>
                                <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                            </View>
                        </Pressable>
                        <Text style={styles.headerTitle}>
                            {mode === "signin" ? "Sign in" : "Create account"}
                        </Text>
                        <View style={styles.headerRightSpacer} />
                    </View>
                </SafeAreaView>

                <ScrollView contentContainerStyle={styles.authContainer}>
                    {mode === "signup" && (
                        <View style={styles.inputRow}>
                            <Ionicons name="person" size={16} color={COLORS.text} />
                            <TextInput
                                style={styles.input}
                                placeholder="Name"
                                placeholderTextColor={COLORS.placeholder}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    )}

                    <View style={[styles.inputRow, { marginTop: 12 }]}>
                        <Ionicons name="mail" size={16} color={COLORS.text} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={COLORS.placeholder}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={[styles.inputRow, { marginTop: 12 }]}>
                        <Ionicons name="lock-closed" size={16} color={COLORS.text} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={COLORS.placeholder}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    {mode === "signup" && (
                        <View style={[styles.inputRow, { marginTop: 12 }]}>
                            <Ionicons name="lock-closed" size={16} color={COLORS.text} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm password"
                                placeholderTextColor={COLORS.placeholder}
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>
                    )}

                    <Pressable
                        style={styles.primaryButton}
                        onPress={mode === "signin" ? handleSignIn : handleSignUp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#141414" />
                        ) : (
                            <Text style={styles.primaryButtonText}>
                                {mode === "signin" ? "Sign in" : "Create account"}
                            </Text>
                        )}
                    </Pressable>

                    <Pressable onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
                        <Text style={styles.secondaryButtonText}>
                            {mode === "signin"
                                ? "Create an account"
                                : "Already have an account? Sign in"}
                        </Text>
                    </Pressable>
                </ScrollView>
            </View>
        );
    }

    /* -------------------------
       AUTHENTICATED PROFILE UI
    -------------------------- */

    return (
        <View style={styles.root}>
            <LinearGradient
                colors={[COLORS.bgTop, COLORS.bgBottom]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safe}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()}>
                        <View style={styles.headerIconButton}>
                            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                        </View>
                    </Pressable>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={styles.headerRightSpacer} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {fields.map(f => (
                    <View key={f.key} style={styles.fieldBlock}>
                        <Text style={styles.fieldLabel}>{f.label}</Text>
                        <View style={styles.inputRow}>
                            <Ionicons name={f.icon} size={16} color={COLORS.text} />
                            <TextInput
                                style={styles.input}
                                value={f.value}
                                keyboardType={f.keyboardType}
                            />
                        </View>
                    </View>
                ))}

                <Pressable style={styles.primaryButton} onPress={handleSaveChanges}>
                    <Text style={styles.primaryButtonText}>Save Changes</Text>
                </Pressable>

                <Pressable style={styles.secondaryButton} onPress={signOut}>
                    <Text style={styles.secondaryButtonText}>Sign Out</Text>
                </Pressable>
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
    headerIconButtonContainer: {
        // Container for proper touch handling
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
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
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
    siginButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4285F4",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: "100%",
        gap: 12,
    },
    signinButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    createAccountButtonContainer: {
        width: '100%',
    },
    createAccountButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00A9E0",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: "100%",
        gap: 12,
        opacity: 0.7,
    },
    createAccountButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    avatarBlock: {
        alignItems: "center",
        paddingTop: 8,
        paddingBottom: 18,
        marginBottom: 10,
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
        marginBottom: 10,
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
        borderColor: COLORS.inputBorder,
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
    switchText: {
        color: COLORS.accent,
        fontSize: 14,
        textDecorationLine: "underline",
    },
    pressable: {
        borderRadius: 12,
    },
    btnPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.90,
    },
    bottomSpacer: {
        height: Platform.OS === 'ios' ? 40 : 20,
    },
});