import { COLORS, landingStyles as styles } from "@/styles/landing/index.styles";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { UserRound, Wand2 } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Animated, Pressable, SafeAreaView, StyleSheet, Text, View, } from "react-native";


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
                            </Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}
