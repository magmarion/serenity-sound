// home.styles.ts
import { StyleSheet } from "react-native";
import Colors from "@/constants/colors";

export const homeStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    
    // Header container that holds both gradient and content
    headerContainer: {
        position: 'relative',
        zIndex: 2,
    },
    
    // Gradient that fills the entire header area
    headerGradientBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 18 },
        elevation: 24,
    },
    
    safeArea: {
        // Safe area manages content positioning
    },
    
    topBar: {
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 16,
    },
    
    scrollArea: {
        flex: 1,
        marginTop: 0,
        zIndex: 1, // Ensure it's below header
    },
    
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    greetingLabel: {
        color: Colors.palette.text,
        fontSize: 14,
    },
    greetingName: {
        color: Colors.light.text,
        fontSize: 18,
        fontWeight: "700",
    },
    
    topPrompt: {
        color: Colors.light.text,
        fontSize: 28,
        fontWeight: "800",
        lineHeight: 34,
        maxWidth: 280,
    },
    titlePrompt: {
        color: Colors.palette.accent,
    },
    
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        paddingTop: 20,
        gap: 20,
    },
    
    /* MOODS SECTION */
    sectionTitle: {
        color: Colors.light.text,
        fontSize: 20,
        fontWeight: "700",
    },
    moodGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 16,
    },
    moodTile: {
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
        color: Colors.light.text,
        fontSize: 16,
        fontWeight: "700",
    },
    moodDescription: {
        color: Colors.palette.under_text,
        fontSize: 13,
    },
    
    /* SESSION LIST */
    sessionList: {
        gap: 12,
    },
    sessionRow: {
        backgroundColor: Colors.palette.surface,
        borderRadius: 20,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    sessionIconWrap: {
        width: 60,
        height: 50,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    sessionText: {
        flex: 1,
    },
    sessionTitle: {
        color: Colors.light.text,
        fontSize: 16,
        fontWeight: "600",
    },
    sessionMeta: {
        color: Colors.palette.muted,
        fontSize: 13,
        marginTop: 2,
    },
    sessionFavoriteButton: {
        minWidth: 44,
        minHeight: 44,
        padding: 10,
        marginRight: 4,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sessionFavoriteButtonFavorited: {
        shadowColor: Colors.light.favorited,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 6,
    },
    errorContainer: {
        flex: 1,
        backgroundColor: Colors.palette.background,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    errorTitle: {
        color: Colors.light.text,
        fontSize: 20,
        fontWeight: "700",
    },
    errorSubtitle: {
        color: Colors.palette.muted,
        marginTop: 8,
        fontSize: 16,
        textAlign: "center",
    },
    
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: Colors.palette.muted,
        fontSize: 16,
    },
    errorMessage: {
        padding: 20,
        alignItems: 'center',
        gap: 10,
    },
    errorText: {
        color: Colors.palette.muted,
        fontSize: 14,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.light.accent,
        borderRadius: 8,
    },
    retryText: {
        color: Colors.light.surface,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.palette.muted,
        fontSize: 16,
    },
});