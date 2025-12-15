// app/(tabs)/settings.tsx
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
            id: "profile",
            label: "Profile",
            iconName: "person",
            iconBg: "rgba(255,140,84,0.18)",
            iconSet: "Ionicons",
            onPress: () => { router.push('/(modal)/profile'); },
          },
          {
            id: "subscription",
            label: "Subscription",
            iconName: "crown",
            iconBg: "rgba(255,180,80,0.18)",
            iconSet: "FontAwesome",
            onPress: () => onRowPress("subscription"),
          },
          {
            id: "notifications",
            label: "Notifications",
            iconName: "notifications",
            iconBg: "rgba(255,140,84,0.18)",
            iconSet: "Ionicons",
            onPress: () => onRowPress("notifications"),
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

  const handleRowPress = useCallback(async (rowId: string) => {
    await Haptics.selectionAsync();
    onRowPress(rowId);
  }, [onRowPress]);

  const RowItem: React.FC<{ row: SettingsRow; index: number; totalRows: number; onPress?: () => void }> = ({ row, index, totalRows, onPress }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handlePressIn = useCallback(() => {
      setIsPressed(true);
    }, []);

    const handlePressOut = useCallback(() => {
      setIsPressed(false);
    }, []);

    // EXACT SAME PATTERN AS YOUR FAVORITES SCREEN
    const IconComponent = (row.iconSet === 'FontAwesome' ? FontAwesome6 : Ionicons) as React.ComponentType<any>;

    return (
      <View key={row.id}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: "rgba(255,255,255,0.04)" }}
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
          colors={["#0B0F2E", "#05060A"]}
          style={StyleSheet.absoluteFill}
        />

        {/* EXTRA GRADIENT ABOVE HEADER - matching home screen */}
        <LinearGradient
          colors={["#591A1B", "#591A1B"]}
          style={styles.topGradientExtension}
        />

        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          {/* HEADER - matching home screen style */}
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

const styles = StyleSheet.create({
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