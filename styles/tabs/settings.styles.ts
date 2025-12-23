import { StyleSheet } from "react-native";

export const settingsStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topGradientExtension: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        zIndex: 1,
    },
    safeArea: {
        flex: 1,
        zIndex: 2,
    },
    topBar: {
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        gap: 16,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 18 },
        elevation: 24,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "800",
        lineHeight: 34,
        marginBottom: 6,
    },
    headerSubtitle: {
        color: "rgba(255,255,255,0.75)",
        fontSize: 14,
        fontWeight: "500",
        letterSpacing: 0.3,
    },
    scrollArea: {
        flex: 1,
        marginTop: 0,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        paddingTop: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: "#E2E8F0",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 8,
        marginLeft: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 16,
        overflow: "hidden",
    },
    rowContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    rowPressed: {
        backgroundColor: "rgba(255,255,255,0.04)",
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        borderWidth: 1,
        borderColor: "rgba(255,138,76,0.18)",
    },
    rowLabel: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    separator: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.06)",
        marginLeft: 16,
        marginRight: 16,
    },
    bottomSpacer: {
        height: 20,
    },
});