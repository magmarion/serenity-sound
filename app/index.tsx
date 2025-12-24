import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React, { useCallback, useMemo, useRef } from "react";
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
    glow: "rgba(255, 176, 122, 0.65)",
    glow2: "rgba(255, 176, 122, 0.20)",
    text: "#E9ECF6",
    subtext: "rgba(233, 236, 246, 0.62)",
    faint: "rgba(233, 236, 246, 0.45)",
    panel: "rgba(15, 17, 23, 0.80)",
    panel2: "rgba(12, 14, 19, 0.62)",
    border: "rgba(255, 255, 255, 0.10)",
    orange: "#FFB07A",
    orangeDeep: "#F28A4B",
};

export default function LandingScreen() {
    const pressAnim = useRef<Animated.Value>(new Animated.Value(0)).current;

    const primaryScale = pressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.985],
    });

    const onPrimaryPressIn = useCallback(() => {
        console.log("[landing] primary press in");
        Animated.timing(pressAnim, {
            toValue: 1,
            duration: 110,
            useNativeDriver: true,
        }).start();
    }, [pressAnim]);

    const onPrimaryPressOut = useCallback(() => {
        console.log("[landing] primary press out");
        Animated.timing(pressAnim, {
            toValue: 0,
            duration: 140,
            useNativeDriver: true,
        }).start();
    }, [pressAnim]);
    const onSignIn = useCallback(() => {
        console.log("[landing] sign in");
        router.push("/sign-in"); // Navigate to sign-in form
    }, []);

    const onCreateAccount = useCallback(() => {
        console.log("[landing] create account");
        router.push("/sign-in?mode=signup"); // Pass mode as query param
    }, []);

    const icon = useMemo(() => {
        const barHeights = [14, 22, 10, 18, 12];
        return (
            <View style={styles.iconCard} testID="serenityLogo">
                <View style={styles.iconGlow} />
                <View style={styles.iconInner}>
                    <View style={styles.barsRow}>
                        {barHeights.map((h, i) => (
                            <View
                                key={`bar-${i}`}
                                style={[styles.bar, { height: h }]}
                            />
                        ))}
                    </View>
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

            <View pointerEvents="none" style={styles.ambientWrap}>
                <View style={[styles.ambientBlob, styles.blobA]} />
                <View style={[styles.ambientBlob, styles.blobB]} />
                <View style={[styles.ambientBlob, styles.blobC]} />
            </View>

            <SafeAreaView style={styles.safe} testID="landingSafe">
                <View style={styles.content}>
                    <View style={styles.centerBlock}>
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

                    <View style={styles.actions} testID="landingActions">
                        <Animated.View style={{ transform: [{ scale: primaryScale }] }}>
                            <Pressable
                                onPressIn={onPrimaryPressIn}
                                onPressOut={onPrimaryPressOut}
                                onPress={onSignIn}
                                style={({ pressed }) => [
                                    styles.primaryButton,
                                    pressed ? styles.primaryPressed : null,
                                ]}
                                testID="landingSignIn"
                            >
                                <View style={styles.primaryGlow} pointerEvents="none" />
                                <UserRound color="#1B110C" size={16} />
                                <Text style={styles.primaryText}>Sign In</Text>
                            </Pressable>
                        </Animated.View>

                        <Pressable
                            onPress={onCreateAccount}
                            style={({ pressed }) => [
                                styles.secondaryButton,
                                pressed ? styles.secondaryPressed : null,
                            ]}
                            testID="landingCreateAccount"
                        >
                            <Wand2 color={COLORS.orange} size={16} />
                            <Text style={styles.secondaryText}>Create Account</Text>
                        </Pressable>
                    </View>

                    <View style={styles.footer} testID="landingFooter">
                        <Text style={styles.footerText}>
                            By continuing, you agree to our Terms & Privacy
                            {"\n"}
                            Policy
                        </Text>
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
        paddingHorizontal: 22,
        paddingTop: 18,
        paddingBottom: 22,
        justifyContent: "space-between",
    },
    ambientWrap: {
        ...StyleSheet.absoluteFillObject,
    },
    ambientBlob: {
        position: "absolute",
        width: 340,
        height: 340,
        borderRadius: 340,
        backgroundColor: COLORS.glow2,
        opacity: 0.95,
    },
    blobA: {
        top: -180,
        left: -130,
    },
    blobB: {
        bottom: -240,
        left: -180,
        width: 420,
        height: 420,
        borderRadius: 420,
        opacity: 0.85,
    },
    blobC: {
        top: 120,
        right: -210,
        width: 420,
        height: 420,
        borderRadius: 420,
        opacity: 0.22,
    },
    centerBlock: {
        alignItems: "center",
        paddingTop: 22,
    },
    iconCard: {
        width: 78,
        height: 78,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.panel,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: COLORS.glow,
        shadowOpacity: 0.35,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
    },
    iconGlow: {
        position: "absolute",
        width: 140,
        height: 140,
        borderRadius: 140,
        backgroundColor: COLORS.glow2,
        opacity: 0.55,
    },
    iconInner: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: "rgba(10, 12, 16, 0.92)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
        alignItems: "center",
        justifyContent: "center",
    },
    barsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
    },
    bar: {
        width: 4,
        borderRadius: 6,
        backgroundColor: COLORS.orange,
    },
    title: {
        marginTop: 18,
        color: COLORS.text,
        fontSize: 30,
        fontWeight: "800",
        letterSpacing: -0.4,
    },
    subtitle: {
        marginTop: 10,
        color: COLORS.subtext,
        fontSize: 14,
        lineHeight: 19,
        textAlign: "center",
    },
    actions: {
        gap: 12,
    },
    primaryButton: {
        height: 50,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: COLORS.orange,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.15)",
        overflow: "hidden",
    },
    primaryGlow: {
        position: "absolute",
        top: -30,
        left: -30,
        width: 150,
        height: 150,
        borderRadius: 150,
        backgroundColor: "rgba(255, 255, 255, 0.22)",
        opacity: 0.55,
    },
    primaryPressed: {
        opacity: 0.96,
    },
    primaryText: {
        color: "#1B110C",
        fontSize: 15,
        fontWeight: "800",
    },
    secondaryButton: {
        height: 50,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.10)",
    },
    secondaryPressed: {
        opacity: 0.95,
        transform: [{ scale: 0.995 }],
    },
    secondaryText: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: "800",
    },
    footer: {
        alignItems: "center",
        paddingTop: 10,
    },
    footerText: {
        color: "rgba(233, 236, 246, 0.40)",
        fontSize: 11,
        textAlign: "center",
        lineHeight: 15,
    },
});
