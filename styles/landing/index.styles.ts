import { StyleSheet } from "react-native";

export const COLORS = {
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

export const landingStyles = StyleSheet.create({
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

    logoShadowWrap: {
        width: 96,
        height: 96,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",

        shadowColor: COLORS.orange,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 28,

        elevation: 18,
    },

    logo: {
        width: 96,
        height: 96,
        borderRadius: 16,
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