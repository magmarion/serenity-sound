import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '@/components/BackButton';

export default function SubscriptionScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0F0F23', '#07070B']}
                style={StyleSheet.absoluteFill}
            />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <BackButton accessibilityLabel="Go back" />
                <Text style={styles.headerTitle}>Subscription</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Current Plan Section - Now with gradient like in image */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Current Plan</Text>
                    <LinearGradient
                        colors={['#2A1A6E', '#4A2BA8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.currentPlanCard}
                    >
                        <View style={styles.currentPlanHeader}>
                            <View style={styles.planTitleWithIcon}>
                                <Ionicons name="diamond" size={20} color="#FFFFFF" />
                                <Text style={styles.currentPlanTitle}>Premium</Text>
                            </View>
                            <View style={styles.currentBadge}>
                                <Text style={styles.currentBadgeText}>Active</Text>
                            </View>
                        </View>
                        <Text style={styles.currentPlanDuration}>Valid until Jun 15, 2026</Text>
                        <Text style={styles.currentPlanPrice}>Monthly billing - $5.99/month</Text>
                    </LinearGradient>
                </View>

                {/* Available Plans Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Available Plans</Text>

                    {/* Free Plan */}
                    <View style={styles.planCard}>
                        <View style={styles.planCardHeader}>
                            <View style={styles.planTitleWithIcon}>
                                <Ionicons name="star-outline" size={28} color="rgba(255,255,255,0.7)" />
                                <View>
                                    <Text style={styles.planCardTitle}>Free</Text>
                                    <Text style={styles.planCardSubtitle}>Basic Features</Text>
                                </View>
                            </View>
                            <View>
                                <Text style={styles.planCardPrice}>$0.00</Text>
                                <Text style={styles.planCardPriceSub}>forever</Text>
                            </View>
                        </View>
                        <View style={styles.planFeatures}>
                            <View style={styles.featureRow}>
                                <View style={styles.featureDot} />
                                <Text style={styles.featureText}>Limited access to content</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <View style={styles.featureDot} />
                                <Text style={styles.featureText}>Standard quality streaming</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <View style={styles.featureDot} />
                                <Text style={styles.featureText}>Ad-supported experience</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.activateButton} activeOpacity={0.7}>
                            <Text style={styles.activateButtonText}>Downgrade to Free</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Pro Plan */}
                    <View style={[styles.planCard, styles.popularPlanCard]}>
                        <View style={styles.popularBadge}>
                            <Text style={styles.popularBadgeText}>POPULAR</Text>
                        </View>
                        <View style={styles.planCardHeader}>
                            <View style={styles.planTitleWithIcon}>
                                <Ionicons name="rocket" size={28} color="#FF8A3D" />
                                <View>
                                    <Text style={styles.planCardTitle}>Pro</Text>
                                    <Text style={styles.planCardSubtitle}>Ultimate Access</Text>
                                </View>
                            </View>
                            <View>
                                <Text style={styles.planCardPrice}>$2.99</Text>
                                <Text style={styles.planCardPriceSub}>per month</Text>
                            </View>
                        </View>
                        <View style={styles.planFeatures}>
                            <View style={styles.featureRow}>
                                <View style={[styles.featureDot, styles.popularFeatureDot]} />
                                <Text style={[styles.featureText, styles.popularFeatureText]}>Unlimited content access</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <View style={[styles.featureDot, styles.popularFeatureDot]} />
                                <Text style={[styles.featureText, styles.popularFeatureText]}>HD & 4K quality streaming</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <View style={[styles.featureDot, styles.popularFeatureDot]} />
                                <Text style={[styles.featureText, styles.popularFeatureText]}>No ads, ad-free experience</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <View style={[styles.featureDot, styles.popularFeatureDot]} />
                                <Text style={[styles.featureText, styles.popularFeatureText]}>Download for offline viewing</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.activateButton, styles.popularActivateButton]} activeOpacity={0.7}>
                            <Text style={[styles.activateButtonText, styles.popularActivateButtonText]}>Active Plan</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Premium Plan */}
                    <View style={[styles.planCard, styles.premiumPlanCard]}>
                        <View style={styles.planCardHeader}>
                            <View style={styles.planTitleWithIcon}>
                                <Ionicons name="diamond" size={28} color="#FF8A3D" />
                                <View>
                                    <Text style={styles.planCardTitle}>Premium</Text>
                                    <Text style={styles.planCardSubtitle}>Full Access</Text>
                                </View>
                            </View>
                            <View>
                                <Text style={styles.planCardPrice}>$5.99</Text>
                                <Text style={styles.planCardPriceSub}>per month</Text>
                            </View>
                        </View>
                        <View style={styles.planFeatures}>
                            <View style={styles.featureRow}>
                                <View style={[styles.featureDot, styles.premiumFeatureDot]} />
                                <Text style={[styles.featureText, styles.premiumFeatureText]}>Everything in Pro</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <View style={[styles.featureDot, styles.premiumFeatureDot]} />
                                <Text style={[styles.featureText, styles.premiumFeatureText]}>Early access to new content</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <View style={[styles.featureDot, styles.premiumFeatureDot]} />
                                <Text style={[styles.featureText, styles.premiumFeatureText]}>Exclusive behind-the-scenes</Text>
                            </View>
                            <View style={styles.featureRow}>
                                <View style={[styles.featureDot, styles.premiumFeatureDot]} />
                                <Text style={[styles.featureText, styles.premiumFeatureText]}>Priority support staff</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.activateButton, styles.upgradeButton]} activeOpacity={0.7}>
                            <Text style={[styles.activateButtonText, styles.upgradeButtonText]}>Upgrade to Pro</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Management Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Manage</Text>
                    <View style={styles.managementCard}>
                        <TouchableOpacity style={styles.managementRow} activeOpacity={0.7}>
                            <View style={styles.managementRowContent}>
                                <Ionicons name="card" size={20} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.managementText}>Payment Method</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.managementRow} activeOpacity={0.7}>
                            <View style={styles.managementRowContent}>
                                <Ionicons name="document-text" size={20} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.managementText}>Billing History</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.managementRow} activeOpacity={0.7}>
                            <View style={styles.managementRowContent}>
                                <Ionicons name="close-circle" size={20} color="#FF5A52" />
                                <Text style={[styles.managementText, styles.cancelText]}>Cancel Subscription</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#07070B',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.4,
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 24,
        letterSpacing: -0.2,
    },
    currentPlanCard: {
        borderRadius: 12,
        padding: 16,
    },
    currentPlanHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    planTitleWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    currentPlanTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    currentBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    currentBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.2,
    },
    currentPlanDuration: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    currentPlanPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    planCard: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        position: 'relative',
    },
    popularPlanCard: {
        borderColor: 'rgba(255,138,61,0.3)',
        backgroundColor: 'rgba(255,138,61,0.08)',
        marginBottom: 24,
    },
    premiumPlanCard: {
        borderColor: 'rgba(255,138,61,0.2)',
        backgroundColor: 'rgba(255,138,61,0.04)',
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        left: 16,
        backgroundColor: '#FF8A3D',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    popularBadgeText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#000000',
        letterSpacing: 0.5,
    },
    planCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    planCardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.4,
    },
    planCardSubtitle: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
        letterSpacing: 0.5,
    },
    planCardPrice: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        textAlign: 'right',
    },
    planCardPriceSub: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 2,
        textAlign: 'right',
        letterSpacing: -0.2,
    },
    planFeatures: {
        marginBottom: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    featureDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.4)',
        marginRight: 10,
        marginTop: 2,
    },
    popularFeatureDot: {
        backgroundColor: '#FF8A3D',
    },
    premiumFeatureDot: {
        backgroundColor: 'rgba(255,138,61,0.8)',
    },
    featureText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        flex: 1,
        letterSpacing: -0.2,
    },
    popularFeatureText: {
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    premiumFeatureText: {
        color: 'rgba(255,255,255,0.8)',
    },
    activateButton: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    activateButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: -0.2,
    },
    popularActivateButton: {
        backgroundColor: '#FF8A3D',
        borderColor: '#FA8A3D',
        opacity: 0.7,
    },
    popularActivateButtonText: {
        color: '#000000',
    },
    upgradeButton: {
        backgroundColor: 'rgba(255,138,61,0.15)',
        borderColor: 'rgba(255,138,61,0.25)',
    },
    upgradeButtonText: {
        color: '#FF8A3D',
    },
    managementCard: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
    },
    managementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    managementRowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    managementText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        marginLeft: 12,
        letterSpacing: -0.3,
    },
    cancelText: {
        color: '#FF5A52',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginHorizontal: 16,
    },
    priceContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    price: {
        fontSize: 36,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    pricePeriod: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
        letterSpacing: -0.2,
    },
});