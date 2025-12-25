import { StyleSheet } from 'react-native';

export const notificationStyles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 44, // Match BackButton width
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600' as const,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    notificationItem: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
    },
    notificationContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#2a2a2a',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        marginRight: 16,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: '#fff',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
    },
    footerText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 18,
        marginTop: 8,
        paddingHorizontal: 20,
    },
});