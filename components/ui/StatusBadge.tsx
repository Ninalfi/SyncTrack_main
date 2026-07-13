// components/ui/StatusBadge.tsx
import { StyleSheet, Text, View } from "react-native";

import {
  Palette,
  Radius,
  Spacing,
} from "@/constants/theme";

type StatusType =
  | "completed"
  | "running"
  | "overdue"
  | "pending";

type Props = {
  status: StatusType;
};

const statusConfig = {
  completed: {
    label: "Completed",
    color: Palette.success,
    background: Palette.successLight,
  },

  running: {
    label: "Running",
    color: Palette.primaryDark,
    background: Palette.primaryLight,
  },

  overdue: {
    label: "Overdue",
    color: Palette.danger,
    background: Palette.dangerLight,
  },

  pending: {
    label: "Pending",
    color: Palette.warning,
    background: Palette.warningLight,
  },
};

export function StatusBadge({ status }: Props) {
  const config = statusConfig[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.background },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: config.color },
        ]}
      />

      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.round,
    gap: 6,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: Radius.round,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});