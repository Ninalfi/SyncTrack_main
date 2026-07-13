// components/ui/SectionHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Palette,
  Spacing,
  Typography,
} from "@/constants/theme";

type Props = {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
};

export function SectionHeader({
  title,
  actionText = "See all",
  onActionPress,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Pressable
        onPress={onActionPress}
        style={styles.action}
      >
        <Text style={styles.actionText}>{actionText}</Text>
        <Ionicons
          name="chevron-forward"
          size={15}
          color={Palette.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },

  title: {
    ...Typography.h3,
  },

  action: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionText: {
    ...Typography.caption,
    color: Palette.primary,
    fontWeight: "600",
  },
});