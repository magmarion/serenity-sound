// app/(modal)/profile.tsx
import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useMemo, useState, useEffect } from "react";
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
import {
    ArrowLeft,
    Camera,
    ChevronRight,
    Image as ImageIcon,
    Mail,
    Phone,
    User,
} from "lucide-react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';


// Initialize WebBrowser for OAuth flows
WebBrowser.maybeCompleteAuthSession();

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
    const [googleSignInLoading, setGoogleSignInLoading] = useState(false);
    const [headerButtonPressed, setHeaderButtonPressed] = useState(false);
    const [googleButtonPressed, setGoogleButtonPressed] = useState(false);
    const [facebookButtonPressed, setfacebookButtonPressed] = useState(false);
    const [primaryButtonPressed, setPrimaryButtonPressed] = useState(false);
    const [secondaryButtonPressed, setSecondaryButtonPressed] = useState(false);
    const [securityRowPressed, setSecurityRowPressed] = useState(false);
    const router = useRouter();

    const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true,
    } as any);


    const { user, profile, isAuthenticated, signInWithGoogleToken, signOut, updateProfile } = useAuthStore();

    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: '1082699719904-4vte5n3u63tdau891vbjej9trcrv8fb9.apps.googleusercontent.com',
        webClientId: '1082699719904-k320pufdgua2dqd9dvn7qb8p8d5m1lnl.apps.googleusercontent.com',
        redirectUri,
        scopes: ['profile', 'email'],
    });

    useEffect(() => {
        console.log('Google OAuth Request ready:', !!request);
    }, [request]);

    useEffect(() => {
        const handleGoogleResponse = async () => {
            if (response?.type === 'success') {
                const { id_token } = response.params;
                console.log('Google OAuth response received, has id_token:', !!id_token);

                if (id_token) {
                    setGoogleSignInLoading(true);
                    try {
                        await signInWithGoogleToken(id_token);
                        console.log('Google sign-in successful via token');
                    } catch (error) {
                        console.error('Google sign-in failed:', error);
                    } finally {
                        setGoogleSignInLoading(false);
                    }
                }
            } else if (response) {
                console.log('Google OAuth response type:', response.type);
                if (response.type === 'error') {
                    console.error('Google OAuth error:', response.error);
                }
            }
        };

        handleGoogleResponse();
    }, [response, signInWithGoogleToken]);

    const handleGoogleButtonPress = async () => {
        if (!request) {
            console.log('Google auth request is not ready yet');
            return;
        }

        setGoogleSignInLoading(true);
        try {
            const result = await promptAsync();
            console.log('Google prompt result type:', result.type);
        } catch (error) {
            console.error('Failed to open Google sign-in:', error);
        }
    };


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
                value: "+460709121212",
                icon: Phone,
                keyboardType: "phone-pad",
            },
            {
                key: "username",
                label: "Username",
                value: "@crazyfrog-1",
                icon: User,
            },
        ],
        [profile, user]
    );

    const handleSaveChanges = async () => {
        if (!isAuthenticated) return;

        try {
            const nameField = fields.find(f => f.key === 'fullName');
            if (nameField) {
                await updateProfile({ name: nameField.value });
                console.log('Profile updated successfully');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
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
                            onPressIn={() => setHeaderButtonPressed(true)}
                            onPressOut={() => setHeaderButtonPressed(false)}
                            onPress={() => router.back()}
                            testID="profile/back"
                            accessibilityRole="button"
                            accessibilityLabel="Back"
                            style={styles.headerIconButtonContainer}
                        >
                            <View style={[
                                styles.headerIconButton,
                                headerButtonPressed && styles.headerIconButtonPressed
                            ]}>
                                <ArrowLeft color={COLORS.text} size={20} />
                            </View>
                        </Pressable>

                        <Text style={styles.headerTitle} testID="profile/title">
                            Profile
                        </Text>

                        <View style={styles.headerRightSpacer} />
                    </View>
                </SafeAreaView>

                <ScrollView
                    contentContainerStyle={styles.authContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.avatarBlock} testID="profile/avatarBlock">
                        <View style={styles.avatarOuterGlow} />
                        <View style={styles.avatarCircle} testID="profile/avatar">
                            <View style={styles.avatarInner}>
                                <Ionicons name="person" size={32} color="#1C1208" />
                            </View>
                        </View>
                    </View>

                    <Text style={styles.authTitle}>Sign in</Text>
                    <Text style={styles.authSubtitle}>
                        Sign in to save your preferences and access more features.
                    </Text>

                    {/* Google Sign In Button */}
                    <Pressable
                        onPressIn={() => setGoogleButtonPressed(true)}
                        onPressOut={() => setGoogleButtonPressed(false)}
                        onPress={handleGoogleButtonPress}
                        disabled={googleSignInLoading || !request}
                        testID="profile/google-signin"
                        style={styles.googleButtonContainer}
                    >
                        <View style={[
                            styles.googleButton,
                            googleButtonPressed && styles.btnPressed,
                            googleSignInLoading && styles.buttonDisabled,
                        ]}>
                            {googleSignInLoading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                            )}
                            <Text style={styles.googleButtonText}>
                                {googleSignInLoading ? 'Signing in...' : 'Sign in with Google'}
                            </Text>
                        </View>
                    </Pressable>

                    {/* facebook Sign In Button */}
                    <Pressable
                        onPressIn={() => setfacebookButtonPressed(true)}
                        onPressOut={() => setfacebookButtonPressed(false)}
                        onPress={() => { console.log("Facebook sign-in not yet implemented"); }}
                        disabled
                        testID="profile/facebook-signin"
                        style={styles.facebookButtonContainer}
                    >
                        <View style={[
                            styles.facebookButton,
                            facebookButtonPressed && styles.btnPressed,
                        ]}>
                            <Ionicons name="logo-facebook" size={20} color="#FFFFFF" />
                            <Text style={styles.facebookButtonText}>Sign in with facebook</Text>
                        </View>
                    </Pressable>
                </ScrollView>
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
                        onPressIn={() => setHeaderButtonPressed(true)}
                        onPressOut={() => setHeaderButtonPressed(false)}
                        onPress={() => router.back()}
                        testID="profile/back"
                        accessibilityRole="button"
                        accessibilityLabel="Back"
                        style={styles.headerIconButtonContainer}
                    >
                        <View style={[
                            styles.headerIconButton,
                            headerButtonPressed && styles.headerIconButtonPressed
                        ]}>
                            <ArrowLeft color={COLORS.text} size={20} />
                        </View>
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
                                    <User color={COLORS.accent} size={16} />
                                </View>
                                <Text style={styles.securityText}>Change Password</Text>
                            </View>
                            <ChevronRight color="rgba(255,255,255,0.45)" size={18} />
                        </View>
                    </Pressable>
                </LinearGradient>

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
    googleButtonContainer: {
        width: '100%',
        marginBottom: 16,
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
        gap: 12,
    },
    googleButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    facebookButtonContainer: {
        width: '100%',
    },
    facebookButton: {
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
    facebookButtonText: {
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
    btnPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.90,
    },
    bottomSpacer: {
        height: Platform.OS === 'ios' ? 40 : 20,
    },
});