import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { UserRound, Wand2 } from "lucide-react-native";

const COLORS = {
    bgTop: "#07090D",
    bgBottom: "#080A0F",
    glow: "rgba(242, 138, 75, 1)",
    glow2: "rgba(255, 176, 122, 0.20)",
    text: "#E9ECF6",
    subtext: "rgba(233, 236, 246, 0.62)",
    faint: "rgba(233, 236, 246, 0.45)",
    panel: "rgba(15, 17, 23, 0.80)",
    panel2: "rgba(12, 14, 19, 0.62)",
    border: "rgba(255, 255, 255, 0.10)",
    orange: "#FF9E66",
    orangeDeep: "#F28A4B",
};

export default function LandingScreen() {
    const pressAnim = useRef<Animated.Value>(new Animated.Value(0)).current;
    const [signInPressed, setSignInPressed] = useState(false);
    const [createAccountPressed, setCreateAccountPressed] = useState(false);

    const signInScale = pressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.985],
    });

    const onSignInPressIn = useCallback(() => {
        console.log("[landing] sign in press in");
        setSignInPressed(true);
        Animated.timing(pressAnim, {
            toValue: 1,
            duration: 110,
            useNativeDriver: true,
        }).start();
    }, [pressAnim]);

    const onSignInPressOut = useCallback(() => {
        console.log("[landing] sign in press out");
        setSignInPressed(false);
        Animated.timing(pressAnim, {
            toValue: 0,
            duration: 140,
            useNativeDriver: true,
        }).start();
    }, [pressAnim]);

    const onCreateAccountPressIn = useCallback(() => {
        console.log("[landing] create account press in");
        setCreateAccountPressed(true);
    }, []);

    const onCreateAccountPressOut = useCallback(() => {
        console.log("[landing] create account press out");
        setCreateAccountPressed(false);
    }, []);

    const onSignIn = useCallback(() => {
        console.log("[landing] sign in");
        router.push("/sign-in");
    }, []);

    const onCreateAccount = useCallback(() => {
        console.log("[landing] create account");
        router.push("/sign-in?mode=signup");
    }, []);

    const icon = useMemo(() => {
        const barHeights = [20, 40, 60, 40, 20];
        return (
            <View style={styles.iconInner} testID="serenityLogo">
                <View style={styles.barsRow}>
                    {barHeights.map((h, i) => (
                        <View key={`bar-${i}`} style={[styles.bar, { height: h }]} />
                    ))}
                </View>
            </View>
        );
    }, []);

    return (
        <View style={styles.root} testID="landingRoot">
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={[COLORS.bgTop, COLORS.bgBottom]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safe} testID="landingSafe">
                <View style={styles.content}>
                    <View style={styles.logoSection}>
                        {icon}
                        <Text style={styles.title} testID="landingTitle">
                            Serenity
                        </Text>
                        <Text style={styles.subtitle} testID="landingSubtitle">
                            Find your calm with soothing
                            {"\n"}
                            sounds and peaceful vibes.
                        </Text>
                    </View>

                    <View style={styles.buttonsSection}>
                        <View style={styles.actions} testID="landingActions">
                            {/* Sign In Button */}
                            <View style={styles.buttonContainer}>
                                <Animated.View style={[{ transform: [{ scale: signInScale }] }, styles.buttonWrapper]}>
                                    <Pressable
                                        onPressIn={onSignInPressIn}
                                        onPressOut={onSignInPressOut}
                                        onPress={onSignIn}
                                        style={styles.buttonPressable}
                                        testID="landingSignIn"
                                    >
                                        <View style={[styles.buttonContent, styles.signInButton, signInPressed && styles.signInPressed]}>
                                            <View style={styles.buttonInner}>
                                                <UserRound color="#1B110C" size={20} />
                                                <Text style={styles.signInText}>Sign In</Text>
                                            </View>
                                        </View>
                                    </Pressable>
                                </Animated.View>
                            </View>

                            {/* Create Account Button */}
                            <View style={styles.buttonContainer}>
                                <Pressable
                                    onPressIn={onCreateAccountPressIn}
                                    onPressOut={onCreateAccountPressOut}
                                    onPress={onCreateAccount}
                                    style={styles.buttonPressable}
                                    testID="landingCreateAccount"
                                >
                                    <View style={[styles.buttonContent, styles.createAccountButton, createAccountPressed && styles.createAccountPressed]}>
                                        <View style={styles.buttonInner}>
                                            <Wand2 color={COLORS.orange} size={20} />
                                            <Text style={styles.createAccountText}>Create Account</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.footer} testID="landingFooter">
                            <Text style={styles.footerText}>
                                By continuing, you agree to our Terms & Privacy
                                {"\n"}
                                Policy
                            </Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.bgTop,
    },
    safe: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 18,
        paddingBottom: 24,
    },
    logoSection: {
        alignItems: "center",
        paddingTop: 80,
    },
    buttonsSection: {
        flex: 0.8,
        justifyContent: "center",
        alignItems: "center",
    },
    iconInner: {
        width: 100,
        height: 100,
        borderRadius: 30,
        backgroundColor: COLORS.panel,
        borderWidth: 1,
        borderColor: COLORS.border, // Added from iconCard
        alignItems: "center",
        justifyContent: "center",
        shadowColor: COLORS.glow, // Added from iconCard
        shadowOpacity: 0.85, // Added from iconCard
        shadowRadius: 22, // Added from iconCard
        shadowOffset: { width: 0, height: 0 },
        elevation: 10,
    },

    barsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
    },
    bar: {
        width: 8,
        borderRadius: 6,
        backgroundColor: COLORS.orange,
    },
    title: {
        marginTop: 24,
        color: COLORS.text,
        fontSize: 32,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    subtitle: {
        marginTop: 10,
        color: COLORS.subtext,
        fontSize: 15,
        lineHeight: 20,
        textAlign: "center",
    },
    actions: {
        gap: 14,
        width: "100%",
        alignItems: "center",
    },
    buttonContainer: {
        width: "100%",
        alignItems: "center",
    },
    buttonWrapper: {
        width: "100%",
        maxWidth: 400,
    },
    buttonPressable: {
        width: "100%",
        maxWidth: 400,
    },
    buttonContent: {
        height: 56,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        width: "100%",
    },
    buttonInner: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    signInButton: {
        backgroundColor: COLORS.orange,
        borderColor: "rgba(255, 255, 255, 0.15)",
    },
    signInPressed: {
        backgroundColor: COLORS.orangeDeep,
        opacity: 0.96,
    },
    signInText: {
        color: "#1B110C",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: -0.2,
    },
    createAccountButton: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderColor: "rgba(255, 255, 255, 0.12)",
    },
    createAccountPressed: {
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        opacity: 0.95,
    },
    createAccountText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: -0.2,
    },
    footer: {
        alignItems: "center",
        paddingTop: 32,
        width: "100%",
    },
    footerText: {
        color: "rgba(233, 236, 246, 0.40)",
        fontSize: 12,
        textAlign: "center",
        lineHeight: 16,
    },
});