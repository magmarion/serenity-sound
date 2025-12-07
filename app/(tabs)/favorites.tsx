import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

export default function FavoritesScreen() {
    useEffect(() => {
        console.log("[FavoritesScreen] mounted");
    }, []);

    return (
        <View style={styles.container} testID="favorites-screen">
            <Text style={styles.title}>Favorites</Text>
            <Text style={styles.subtitle}>Here will the favorites live soon.</Text>
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
