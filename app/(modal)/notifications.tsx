import { BackButton } from '@/components/BackButton';
import { notificationStyles as styles } from '@/styles/modal/notifications.styles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
            <LinearGradient
                colors={["#0B0A2A", "#05060A"]}
                style={StyleSheet.absoluteFill}
            />
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
                            icon={<Ionicons name="notifications" color="#ff6b35" size={24} />}
                            title="Push Notifications"
                            description="Enable all notifications"
                            isEnabled={settings.pushNotifications}
                            onToggle={() => toggleSetting('pushNotifications')}
                        />

                        <NotificationItem
                            icon={<Ionicons name="mail" color="#ff6b35" size={24} />}
                            title="Email Alerts"
                            description="Weekly digests and summaries"
                            isEnabled={settings.emailAlerts}
                            onToggle={() => toggleSetting('emailAlerts')}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Content Updates</Text>

                        <NotificationItem
                            icon={<Ionicons name="play" color="#ff6b35" size={24} />}
                            title="New Episodes"
                            description="Alerts for subscribed shows"
                            isEnabled={settings.newEpisodes}
                            onToggle={() => toggleSetting('newEpisodes')}
                        />

                        <NotificationItem
                            icon={<Ionicons name="star" color="#ff6b35" size={24} />}
                            title="Recommendations"
                            description="Based on your watch history"
                            isEnabled={settings.recommendations}
                            onToggle={() => toggleSetting('recommendations')}
                        />

                        <NotificationItem
                            icon={<Ionicons name="download" color="#ff6b35" size={24} />}
                            title="Downloads Complete"
                            description="Notify when offline content is ready"
                            isEnabled={settings.downloadsComplete}
                            onToggle={() => toggleSetting('downloadsComplete')}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Social & System</Text>

                        <NotificationItem
                            icon={<Ionicons name="chatbubble" color="#ff6b35" size={24} />}
                            title="Comments & Replies"
                            description="Activity on your posts"
                            isEnabled={settings.commentsAndReplies}
                            onToggle={() => toggleSetting('commentsAndReplies')}
                        />

                        <NotificationItem
                            icon={<Ionicons name="phone-portrait" color="#ff6b35" size={24} />}
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
