import { Tabs } from "expo-router";
import { Grid3X3, Headphones, Home, Settings as SettingsIcon } from "lucide-react-native";
import React from "react";
import Colors from "@/constants/colors";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {    // doesn't support native wind css styles
          backgroundColor: Colors.palette.surface,
          borderTopColor: "transparent",
          height: 74,
        },
        tabBarActiveTintColor: Colors.light.tabIconSelected,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarLabelStyle: {  // doesn't support native wind css styles
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,  // doesn't support native wind css styles
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color, size }) => <Grid3X3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="player"
        options={{
          title: "Player",
          tabBarIcon: ({ color, size }) => <Headphones color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}