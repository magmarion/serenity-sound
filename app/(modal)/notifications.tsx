import { BackButton } from '@/components/BackButton';
import { useRouter } from 'expo-router';
import { Bell, Download, Mail, MessageSquare, Play, Smartphone, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import { Animated, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NotificationItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    isEnabled: boolean;
    onToggle: () => void;
}

const NotificationItem = ({ icon, title, description, isEnabled, onToggle }: NotificationItemProps) => {
    const [scaleAnim] = React.useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={[styles.notificationItem, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onToggle}
                style={styles.notificationContent}
            >
                <View style={styles.iconContainer}>{icon}</View>
                <View style={styles.textContainer}>
                    <Text style={styles.itemTitle}>{title}</Text>
                    <Text style={styles.itemDescription}>{description}</Text>
                </View>
                <Switch
                    value={isEnabled}
                    onValueChange={onToggle}
                    trackColor={{ false: '#2a2a2a', true: '#ff6b35' }}
                    thumbColor={isEnabled ? '#fff' : '#888'}
                    ios_backgroundColor="#2a2a2a"
                />
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function NotificationsScreen() {
    const router = useRouter();
    const [settings, setSettings] = useState({
        pushNotifications: true,
        emailAlerts: false,
        newEpisodes: true,
        recommendations: true,
        downloadsComplete: true,
        commentsAndReplies: true,
        appUpdates: false,
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <View style={styles.wrapper}>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <BackButton
                        accessibilityLabel="Go back to settings"
                    />

                    <Text style={styles.headerTitle}>Notifications</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>General</Text>

                        <NotificationItem
                            icon={<Bell color="#ff6b35" size={24} />}
                            title="Push Notifications"
                            description="Enable all notifications"
                            isEnabled={settings.pushNotifications}
                            onToggle={() => toggleSetting('pushNotifications')}
                        />

                        <NotificationItem
                            icon={<Mail color="#ff6b35" size={24} />}
                            title="Email Alerts"
                            description="Weekly digests and summaries"
                            isEnabled={settings.emailAlerts}
                            onToggle={() => toggleSetting('emailAlerts')}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Content Updates</Text>

                        <NotificationItem
                            icon={<Play color="#ff6b35" size={24} />}
                            title="New Episodes"
                            description="Alerts for subscribed shows"
                            isEnabled={settings.newEpisodes}
                            onToggle={() => toggleSetting('newEpisodes')}
                        />

                        <NotificationItem
                            icon={<Star color="#ff6b35" size={24} />}
                            title="Recommendations"
                            description="Based on your watch history"
                            isEnabled={settings.recommendations}
                            onToggle={() => toggleSetting('recommendations')}
                        />

                        <NotificationItem
                            icon={<Download color="#ff6b35" size={24} />}
                            title="Downloads Complete"
                            description="Notify when offline content is ready"
                            isEnabled={settings.downloadsComplete}
                            onToggle={() => toggleSetting('downloadsComplete')}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Social & System</Text>

                        <NotificationItem
                            icon={<MessageSquare color="#ff6b35" size={24} />}
                            title="Comments & Replies"
                            description="Activity on your posts"
                            isEnabled={settings.commentsAndReplies}
                            onToggle={() => toggleSetting('commentsAndReplies')}
                        />

                        <NotificationItem
                            icon={<Smartphone color="#ff6b35" size={24} />}
                            title="App Updates"
                            description="New features and improvements"
                            isEnabled={settings.appUpdates}
                            onToggle={() => toggleSetting('appUpdates')}
                        />
                    </View>

                    <Text style={styles.footerText}>
                        Changes to notification settings may take a few minutes to apply across all your devices.
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
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