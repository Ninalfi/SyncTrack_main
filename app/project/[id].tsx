import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { getProjectById } from "../../data/projects";

const C = {
  bg: "#F2F1FC",
  card: "#FFFFFF",
  soft: "#F8FAFC",
  primary: "#1BBEE4",
  primaryDark: "#0797BC",
  primaryLight: "#DDF8FF",
  text: "#171A21",
  secondary: "#667085",
  muted: "#98A2B3",
  border: "#E7EAF0",
  divider: "#EEF1F5",
  success: "#63C174",
  successLight: "#EAF8ED",
  warning: "#F5AE2B",
  warningLight: "#FFF5DC",
  danger: "#EF5A5A",
  dangerLight: "#FFF0F0",
  white: "#FFFFFF",
};

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export default function ProjectDetails() {
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isTablet = width >= 700;

  useEffect(() => {
    loadProject();
  }, [id]);

  async function loadProject() {
    try {
      setProject(await getProjectById(String(id)));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function getStatus(progress: number) {
    if (progress >= 90) return "Completed";
    if (progress >= 75) return "On Track";
    if (progress >= 50) return "Review";
    return "Attention";
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loaderText}>Loading Project...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loaderText}>Project not found</Text>
      </View>
    );
  }

  const status = getStatus(project.progress);
  const statusColor =
    status === "Completed" || status === "On Track"
      ? C.success
      : status === "Review"
      ? C.warning
      : C.danger;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isTablet && styles.tabletContent,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <View style={styles.backIcon}>
          <Ionicons name="arrow-back" size={19} color={C.primaryDark} />
        </View>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.category}>
              {project.category || "Project Tracking"}
            </Text>

            <Text
              style={[
                styles.title,
                { fontSize: width < 380 ? 28 : 34 },
              ]}
            >
              {project.title}
            </Text>

            <Text style={styles.description}>
              {project.description || "No description available."}
            </Text>
          </View>

          <View style={styles.heroIcon}>
            <Ionicons
              name="folder-open-outline"
              size={29}
              color={C.primaryDark}
            />
          </View>
        </View>

        <View style={styles.progressHeader}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {status}
            </Text>
          </View>

          <Text style={styles.progressText}>
            {project.progress}% Complete
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${clamp(project.progress)}%`,
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>

        <View style={styles.grid}>
          <InfoCard label="Due Date" value={project.dueDate || "N/A"} />
          <InfoCard label="Professor" value={project.professor || "N/A"} />
          <InfoCard label="Students" value={String(project.students || 0)} />
          <InfoCard label="Priority" value={project.priority || "N/A"} />
          <InfoCard
            label="Milestones"
            value={`${project.completedMilestones || 0}/${
              project.totalMilestones || 0
            }`}
          />
          <InfoCard label="Week" value={project.weekNumber || "N/A"} />
        </View>
      </View>

      <View
        style={[
          styles.twoColumnWrapper,
          isTablet && styles.twoColumnTablet,
        ]}
      >
        <View style={[styles.sectionCard, isTablet && styles.columnCard]}>
          <Text style={styles.sectionTitle}>Latest Update</Text>

          <View style={styles.updateBox}>
            <View style={styles.updateTop}>
              <View style={styles.studentAvatar}>
                <Text style={styles.studentAvatarText}>
                  {(project.studentName || "U")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.updateStudent}>
                  {project.studentName || "Unknown Student"}
                </Text>
                <Text style={styles.updateDate}>
                  {project.timestamp || "No timestamp"}
                </Text>
              </View>
            </View>

            <Text style={styles.updateText}>
              {project.updateDetails || "No latest update available."}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Tasks</Text>

          {(project.tasks || []).map((task: any) => (
            <View key={task.id} style={styles.taskRow}>
              <View
                style={[
                  styles.taskCheck,
                  task.completed && styles.taskCheckDone,
                ]}
              >
                {task.completed && (
                  <Ionicons name="checkmark" size={15} color={C.white} />
                )}
              </View>

              <Text
                style={[
                  styles.taskText,
                  task.completed && styles.taskTextDone,
                ]}
              >
                {task.title}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.sectionCard, isTablet && styles.columnCard]}>
          <Text style={styles.sectionTitle}>Project Resources</Text>

          <ResourceButton title="GitHub Repository" url={project.github} icon="logo-github" />
          <ResourceButton title="Google Drive" url={project.drive} icon="cloud-outline" />
          <ResourceButton title="Figma Design" url={project.figma} icon="color-palette-outline" />
          <ResourceButton title="Demo Video" url={project.demo} icon="play-circle-outline" />

          <View style={styles.noteBox}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={C.primaryDark}
            />
            <Text style={styles.noteText}>
              Project links open only if they were submitted in the update form.
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={styles.infoValue}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {value || "N/A"}
      </Text>
    </View>
  );
}

function ResourceButton({
  title,
  url,
  icon,
}: {
  title: string;
  url?: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const hasUrl = Boolean(url);

  return (
    <TouchableOpacity
      style={[
        styles.resourceButton,
        !hasUrl && styles.resourceButtonDisabled,
      ]}
      disabled={!hasUrl}
      onPress={() => {
        if (url) Linking.openURL(url);
      }}
    >
      <View style={styles.resourceLeft}>
        <View style={styles.resourceIcon}>
          <Ionicons
            name={icon}
            size={20}
            color={hasUrl ? C.primaryDark : C.muted}
          />
        </View>
        <Text
          style={[
            styles.resourceText,
            !hasUrl && styles.resourceTextDisabled,
          ]}
        >
          {title}
        </Text>
      </View>

      <Ionicons
        name="open-outline"
        size={18}
        color={hasUrl ? C.primaryDark : C.muted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
  },
  tabletContent: {
    maxWidth: 900,
    alignSelf: "center",
    width: "100%",
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    color: C.secondary,
    marginTop: 12,
    fontWeight: "800",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 18,
  },
  backIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: C.primaryDark,
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },

  heroCard: {
    backgroundColor: C.card,
    borderRadius: 27,
    padding: 21,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#1D2939",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  heroTop: {
    flexDirection: "row",
    gap: 14,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: C.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  category: {
    color: C.primaryDark,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 7,
  },
  title: {
    color: C.text,
    fontWeight: "900",
    lineHeight: 40,
    flexShrink: 1,
  },
  description: {
    color: C.secondary,
    lineHeight: 22,
    marginTop: 12,
    fontSize: 13,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 11,
  },
  statusBadge: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontWeight: "900",
    fontSize: 11,
  },
  progressText: {
    color: C.text,
    fontWeight: "900",
    fontSize: 12,
  },
  progressBackground: {
    width: "100%",
    height: 9,
    backgroundColor: C.divider,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 22,
  },
  progressFill: {
    height: "100%",
    borderRadius: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 11,
  },
  infoCard: {
    width: "48%",
    backgroundColor: C.soft,
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: C.border,
    minHeight: 90,
  },
  infoLabel: {
    color: C.secondary,
    marginBottom: 7,
    fontSize: 11,
    fontWeight: "800",
  },
  infoValue: {
    color: C.text,
    fontWeight: "900",
    fontSize: 16,
    lineHeight: 21,
  },

  twoColumnWrapper: {
    gap: 18,
  },
  twoColumnTablet: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  columnCard: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: C.card,
    borderRadius: 23,
    padding: 19,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 18,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 15,
  },

  updateBox: {
    backgroundColor: C.soft,
    borderRadius: 17,
    padding: 15,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  updateTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },
  studentAvatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: C.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },
  studentAvatarText: {
    color: C.primaryDark,
    fontWeight: "900",
  },
  updateStudent: {
    color: C.text,
    fontWeight: "900",
    fontSize: 15,
  },
  updateDate: {
    color: C.secondary,
    marginTop: 3,
    fontSize: 11,
  },
  updateText: {
    color: C.secondary,
    lineHeight: 21,
    fontSize: 13,
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.soft,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    padding: 13,
    marginBottom: 9,
  },
  taskCheck: {
    width: 21,
    height: 21,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: C.muted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },
  taskCheckDone: {
    backgroundColor: C.success,
    borderColor: C.success,
  },
  taskText: {
    color: C.text,
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
  },
  taskTextDone: {
    color: C.muted,
    textDecorationLine: "line-through",
  },

  resourceButton: {
    backgroundColor: C.soft,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    padding: 13,
    marginBottom: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resourceButtonDisabled: {
    opacity: 0.55,
  },
  resourceLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  resourceIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  resourceText: {
    color: C.text,
    fontWeight: "900",
    fontSize: 13,
  },
  resourceTextDisabled: {
    color: C.muted,
  },

  noteBox: {
    marginTop: 11,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: "#C5F1FA",
    borderRadius: 15,
    padding: 13,
    flexDirection: "row",
    gap: 10,
  },
  noteText: {
    color: C.primaryDark,
    lineHeight: 19,
    flex: 1,
    fontWeight: "700",
    fontSize: 12,
  },
});