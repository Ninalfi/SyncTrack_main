// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, View } from "react-native";

import { Palette, Radius, Shadow } from "@/constants/theme";

type TabIconProps = {
  focused: boolean;
  activeName: keyof typeof Ionicons.glyphMap;
  inactiveName: keyof typeof Ionicons.glyphMap;
};

function TabIcon({
  focused,
  activeName,
  inactiveName,
}: TabIconProps) {
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused
          ? Palette.primaryLight
          : "transparent",
      }}
    >
      <Ionicons
        name={focused ? activeName : inactiveName}
        size={23}
        color={focused ? Palette.primary : Palette.textMuted}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.textMuted,

        tabBarStyle: {
          position: "absolute",
          height: Platform.OS === "ios" ? 82 : 72,
          bottom: Platform.OS === "ios" ? 20 : 16,
          left: 18,
          right: 18,

          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 18 : 10,

          borderRadius: Radius.xxl,
          borderTopWidth: 0,
          backgroundColor: Palette.surface,

          ...Shadow.floating,
        },

        tabBarItemStyle: {
          borderRadius: Radius.lg,
        },

        sceneStyle: {
          backgroundColor: Palette.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              activeName="home"
              inactiveName="home-outline"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Projects",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              activeName="grid"
              inactiveName="grid-outline"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Analytics",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              activeName="bar-chart"
              inactiveName="bar-chart-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
  name="calendar"
  options={{
    title: "Calendar",
    tabBarIcon: ({ color, size }) => (
      <Ionicons
        name="calendar-outline"
        size={size}
        color={color}
      />
    ),
  }}
/>
    </Tabs>
    
  );
}