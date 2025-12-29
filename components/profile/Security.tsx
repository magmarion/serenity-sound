import { COLORS, profileStyles as styles } from "@/styles/modal/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
    onChangePassword: () => void;
    onDeleteAccount: () => void;
};

export function ProfileSecurity({
    onChangePassword,
    onDeleteAccount,
}: Props) {
    const [passwordPressed, setPasswordPressed] = useState(false);
    const [deletePressed, setDeletePressed] = useState(false);

    return (
        <>
            <Text style={styles.sectionTitle} testID="profile/securityTitle">
                Security
            </Text>

            <LinearGradient
                colors={[COLORS.cardTop, COLORS.cardBottom]}
                style={[styles.card, styles.securityCard]}
            >
                <Pressable
                    onPressIn={() => setPasswordPressed(true)}
                    onPressOut={() => setPasswordPressed(false)}
                    onPress={onChangePassword}
                    style={styles.securityRowContainer}
                    testID="profile/changePassword"
                    accessibilityRole="button"
                    accessibilityLabel="Change password"
                    accessibilityHint="Opens password change screen"
                >
                    <View
                        style={[
                            styles.securityRow,
                            passwordPressed && styles.btnPressed,
                        ]}
                    >
                        <View style={styles.securityLeft}>
                            <View style={styles.securityIconWrap}>
                                <Ionicons
                                    name="lock-closed"
                                    color={COLORS.accent}
                                    size={16}
                                />
                            </View>
                            <Text style={styles.securityText}>
                                Change Password
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            color="rgba(255,255,255,0.45)"
                            size={18}
                        />
                    </View>
                </Pressable>

                <Pressable
                    onPressIn={() => setDeletePressed(true)}
                    onPressOut={() => setDeletePressed(false)}
                    onPress={onDeleteAccount}
                    accessibilityRole="button"
                    accessibilityLabel="Delete account"
                    accessibilityHint="Permanently deletes your account"
                >
                    <View
                        style={[
                            styles.securityRow,
                            styles.securityRowSpacer,
                            deletePressed && styles.btnPressed,
                        ]}
                    >
                        <View style={styles.securityLeft}>
                            <View
                                style={[
                                    styles.securityIconWrap,
                                    { backgroundColor: COLORS.dangerSoft },
                                ]}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    color={COLORS.danger}
                                    size={16}
                                />
                            </View>
                            <Text
                                style={[
                                    styles.securityText,
                                    { color: COLORS.danger },
                                ]}
                            >
                                Delete account
                            </Text>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            color="rgba(255,255,255,0.35)"
                            size={18}
                        />
                    </View>
                </Pressable>
            </LinearGradient>
        </>
    );
}
