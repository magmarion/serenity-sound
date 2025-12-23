import { StyleSheet } from "react-native";

export const categoriesStyles = StyleSheet.create({
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
    header: {
        paddingTop: 10,
        paddingBottom: 10,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "800",
        textAlign: "left",
        maxWidth: 280,
    },
    scrollArea: {
        flex: 1,
        marginTop: 0,
    },
    searchWrap: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    searchInner: {
        height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    searchInput: {
        flex: 1,
        color: "#EAF2FF",
        fontSize: 14,
        paddingVertical: 0,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        gap: 20,
    },
    moodGrid: {
        justifyContent: "space-between",
        rowGap: 16,
    },
    cardWrap: {
        width: "48%",
        borderRadius: 24,
        overflow: "hidden",
    },
    moodGradient: {
        borderRadius: 24,
        padding: 16,
        gap: 8,
    },
    moodIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "rgba(255,255,255,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    moodTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    moodDescription: {
        color: "rgba(255,255,255,0.74)",
        fontSize: 13,
    },
});