import { AuthForm } from "@/components/auth";
import { BackButton } from "@/components/BackButton";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { ProfileSecurity } from "@/components/profile/Security";
import { UserInfo } from "@/components/profile/UserInfo";
import { useProfileActions } from "@/hooks/useProfileActions";
import { useProfileForm } from "@/hooks/useProfileForm";
import { useAuthStore } from "@/store/auth-store";
import { profileStyles as styles } from "@/styles/modal/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { memo } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
    bgTop: "#05070B",
    bgBottom: "#0A0F16",
    cardTop: "rgba(255,255,255,0.07)",
    cardBottom: "rgba(255,255,255,0.03)",
    cardBorder: "rgba(255,255,255,0.10)",
    text: "rgba(255,255,255,0.92)",
    subText: "rgba(255,255,255,0.55)",
    inputBg: "rgba(8,12,18,0.35)",
    inputBorder: "rgba(255,255,255,0.16)",
    accent: "#FF8A3D",
    accentSoft: "rgba(255,138,61,0.20)",
    danger: "#FF5A52",
    dangerSoft: "rgba(255,90,82,0.16)",
} as const;

// Add this right after your COLORS object
const localStyles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingContainer: {
        backgroundColor: COLORS.cardTop,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    loadingText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
});

function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
        profile,
        isAuthenticated,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateProfile,
    } = useAuthStore();

    const {
        localFields,
        setLocalFields,
        hasChanges,
        setHasChanges,
        saveSuccess,
        saveButtonOpacity,
        fieldConfigs,
        handleSaveChanges,
    } = useProfileForm(profile, updateProfile);

    const {
        handleAuthSubmit,
        handleSignOut,
        signOutLoading,
    } = useProfileActions({
        signInWithEmail,
        signUpWithEmail,
        updateProfile,
        signOut,
    });

    const handleChangeAvatar = () => {
        Alert.alert(
            "Change profile photo",
            "Choose how you want to update your photo",
            [
                { text: "Take photo", onPress: openCamera },
                { text: "Choose from library", onPress: openImageLibrary },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };


    const openCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchCameraAsync({
            cameraType: ImagePicker.CameraType.front,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled) return;

        await updateProfile({
            photoURL: result.assets[0].uri,
        });
    };

    const openImageLibrary = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled) return;

        await updateProfile({
            photoURL: result.assets[0].uri,
        });
    };

    /*
       NOT AUTHENTICATED
     */
    if (!isAuthenticated) {
        return (
            <View style={styles.root} testID="profile/root">
                {/* Background */}
                <LinearGradient
                    colors={["#0B0F2E", "#05060A"]}
                    style={StyleSheet.absoluteFill}
                />
                <View
                    style={[styles.header, { paddingTop: insets.top + 10 }]}
                    testID="profile/header"
                >
                    <BackButton
                        onPress={() => router.back()}
                        accessibilityLabel="Go back to settings"
                    />
                </View>

                <AuthForm
                    mode="signin"
                    onSubmit={handleAuthSubmit}
                    onBack={() => router.back()}
                    showBackButton={false}
                    isInModal={true}
                />
            </View>
        );
    }
    /*
      AUTHENTICATED PROFILE UI
    */
    return (
        <View style={styles.root} testID="profile/root">
            {signOutLoading && (
                <View style={localStyles.overlay}>
                    <View style={localStyles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.accent} />
                        <Text style={localStyles.loadingText}>Signing you out...</Text>
                    </View>
                </View>
            )}
            {/* Background */}
            <LinearGradient
                colors={["#0B0F2E", "#05060A"]}
                style={StyleSheet.absoluteFill}
            />
            <View
                style={[styles.header, { paddingTop: insets.top + 10 }]}
                testID="profile/header"
            >
                <BackButton
                    onPress={() => router.back()}
                    accessibilityLabel="Go back to settings"
                />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    testID="profile/scroll"
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                >
                    <View style={styles.avatarBlock}>
                        <Pressable
                            accessibilityLabel="Profile photo"
                            testID="profile/avatar"
                        >
                            <View style={styles.avatarCircle}>
                                <View style={styles.avatarInner}>
                                    {profile?.photoURL ? (
                                        <Image
                                            source={{ uri: profile.photoURL }}
                                            style={{ width: "100%", height: "100%", borderRadius: 28 }}
                                            contentFit="cover"
                                        />
                                    ) : (
                                        <Ionicons name="person" size={100} color="#1C1208" />
                                    )}
                                </View>
                            </View>
                        </Pressable>

                        {/* Edit button BELOW the image */}
                        <Pressable
                            onPress={handleChangeAvatar}
                            accessibilityRole="button"
                            accessibilityLabel="Edit profile"
                            accessibilityHint="Change profile photo and personal information"
                            style={styles.editProfileButton}
                            testID="profile/edit"
                        >
                            <View style={styles.editProfileButtonInner}>
                                <Ionicons
                                    name="create-outline"
                                    size={14}
                                    color={COLORS.accent}
                                />
                                <Text style={styles.editProfileButtonText}>Edit profile</Text>
                            </View>
                        </Pressable>
                    </View>

                    <UserInfo
                        localFields={localFields}
                        fieldConfigs={fieldConfigs}
                        onChangeField={(key, value) => {
                            setLocalFields((prev) => ({
                                ...prev,
                                [key]: value,
                            }));
                            setHasChanges(true);
                        }}
                    />

                    <ProfileSecurity
                        onChangePassword={() => router.push("/change-password")}
                        onDeleteAccount={() => router.push("/delete-account")}
                    />
                    <ProfileActions
                        hasChanges={hasChanges}
                        saveSuccess={saveSuccess}
                        saveButtonOpacity={saveButtonOpacity}
                        onSave={handleSaveChanges}
                        onSignOut={handleSignOut}
                        signOutLoading={signOutLoading}
                    />

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

export default memo(ProfileScreen);