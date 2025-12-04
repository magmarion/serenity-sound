import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

export default function SettingsScreen() {
    useEffect(() => {
        console.log("[SettingsScreen] mounted");
    }, []);

    return (
        <View style={styles.container} testID="settings-screen">
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Profile controls are in progress.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.palette.background,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    title: {
        color: Colors.light.text,
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
    },
    subtitle: {
        color: Colors.palette.muted,
        fontSize: 16,
        textAlign: "center",
    },
});
