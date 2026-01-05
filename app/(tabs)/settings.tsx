import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { memo, useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { settingsStyles as styles } from "@/styles/tabs/settings.styles";

type SettingsRow = {
  id: string;
  label: string;
  iconName: React.ComponentProps<typeof Ionicons>["name"] | React.ComponentProps<typeof FontAwesome6>["name"];
  iconBg: string;
  iconSet: "Ionicons" | "FontAwesome";
  onPress?: () => void;
};

type SettingsSection = {
  id: string;
  title: string;
  rows: SettingsRow[];
};

function SettingsScreen() {
  const router = useRouter();
  const onRowPress = useCallback((id: string) => {
    console.log("[Settings] pressed row", { id });
  }, []);

  const sections = useMemo<SettingsSection[]>(() => {
    return [
      {
        id: "account",
        title: "Account",
        rows: [
          {
            id: "account",
            label: "Account",
            iconName: "person",
            iconBg: "rgba(255,140,84,0.18)",
            iconSet: "Ionicons",
            onPress: () => { router.push('/(settings)/profile'); },
          },
          {
            id: "subscription",
            label: "Subscription",
            iconName: "crown",
            iconBg: "rgba(255,180,80,0.18)",
            iconSet: "FontAwesome",
            onPress: () => { router.push('/(settings)/subscription'); },
          },
          {
            id: "notifications",
            label: "Notifications",
            iconName: "notifications",
            iconBg: "rgba(255,140,84,0.18)",
            iconSet: "Ionicons",
            onPress: () => { router.push('/(settings)/notifications'); },
          },
        ],
      },
      {
        id: "prefs",
        title: "App Preferences",
        rows: [
          {
            id: "sound_quality",
            label: "Sound Quality",
            iconName: "musical-notes",
            iconBg: "rgba(255,140,84,0.18)",
            iconSet: "Ionicons",
            onPress: () => onRowPress("sound_quality"),
          },
          {
            id: "download_settings",
            label: "Download Settings",
            iconName: "download",
            iconBg: "rgba(255,140,84,0.18)",
            iconSet: "Ionicons",
            onPress: () => onRowPress("download_settings"),
          },
          {
            id: "autoplay",
            label: "Auto-play",
            iconName: "play-circle",
            iconBg: "rgba(255,140,84,0.18)",
            iconSet: "Ionicons",
            onPress: () => onRowPress("autoplay"),
          },
        ],
      },
      {
        id: "support",
        title: "Support",
        rows: [
          {
            id: "help_center",
            label: "Help Center",
            iconName: "help-circle",
            iconBg: "rgba(255,140,84,0.18)",
            iconSet: "Ionicons",
            onPress: () => onRowPress("help_center"),
          },
          {
            id: "contact",
            label: "Contact",
            iconName: "mail",
            iconBg: "rgba(255,140,84,0.18)",
            iconSet: "Ionicons",
            onPress: () => onRowPress("contact_us"),
          },
          {
            id: "rate_app",
            label: "Rate App",
            iconName: "star",
            iconBg: "rgba(255,140,84,0.18)",
            iconSet: "Ionicons",
            onPress: () => onRowPress("rate_app"),
          },
        ],
      },
      {
        id: "legal",
        title: "Legal",
        rows: [
          {
            id: "privacy_policy",
            label: "Privacy Policy",
            iconName: "shield-checkmark",
            iconBg: "rgba(255,140,84,0.18)",
            iconSet: "Ionicons",
            onPress: () => onRowPress("privacy_policy"),
          },
          {
            id: "terms",
            label: "Terms of Service",
            iconName: "document-text",
            iconBg: "rgba(255,140,84,0.18)",
            iconSet: "Ionicons",
            onPress: () => onRowPress("terms"),
          },
        ],
      },
    ];
  }, [onRowPress, router]);

  const RowItem: React.FC<{ row: SettingsRow; index: number; totalRows: number; onPress?: () => void }> = ({ row, index, totalRows, onPress }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handlePressIn = useCallback(() => {
      setIsPressed(true);
    }, []);

    const handlePressOut = useCallback(() => {
      setIsPressed(false);
    }, []);

    const IconComponent = (row.iconSet === 'FontAwesome' ? FontAwesome6 : Ionicons) as React.ComponentType<any>;

    return (
      <View key={row.id}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: "rgba(255,255,255,0.04)" }}
          accessibilityRole="button"
          accessibilityLabel={row.label}
          accessibilityHint={`Opens ${row.label.toLowerCase()} settings`}
        >
          <View style={[
            styles.rowContent,
            isPressed && styles.rowPressed,
          ]}>
            <View style={[styles.iconWrap, { backgroundColor: row.iconBg }]}>
              <IconComponent name={row.iconName} size={20} color="#FF8A4C" />
            </View>

            <Text style={styles.rowLabel}>
              {row.label}
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="rgba(255,255,255,0.45)"
            />
          </View>
        </Pressable>

        {index < totalRows - 1 && (
          <View style={styles.separator} />
        )}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#0B0F2E" />

      <View style={styles.container}>
        {/* Background */}
        <LinearGradient
          colors={["#0B0A2A", "#05060A"]}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={["#591A1B", "#591A1B"]}
          style={styles.topGradientExtension}
        />

        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <LinearGradient
            colors={["#591A1B", "#0F172B", "#0B0E14"]}
            locations={[0, 0.4, 1]}
            style={styles.topBar}
          >
            <View style={styles.headerRow}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Settings</Text>
                <Text style={styles.headerSubtitle}>
                  Customize your experience
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* SCROLL AREA */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {sections.map((section) => (
              <View key={section.id} style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {section.title}
                </Text>

                <View style={styles.card}>
                  {section.rows.map((row, index) => (
                    <RowItem
                      key={row.id}
                      row={row}
                      index={index}
                      totalRows={section.rows.length}
                      onPress={row.onPress}
                    />
                  ))}
                </View>
              </View>
            ))}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
}

export default memo(SettingsScreen);