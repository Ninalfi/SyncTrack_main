import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../../context/AuthContext";
import { fetchProjects, getProjectStatus, Project } from "../../data/projects";

type ProjectWithStatus = Project & {
  status: "Completed" | "On Track" | "Review" | "Attention";
};

const C = {
  bg: "#F4F5FB",
  card: "#FFFFFF",
  soft: "#F8FAFC",
  primary: "#18BDE3",
  primaryDark: "#078FB3",
  primaryLight: "#DDF8FF",
  text: "#151821",
  secondary: "#697386",
  muted: "#9AA4B2",
  border: "#E8ECF2",
  divider: "#EEF1F5",
  success: "#65C07B",
  successLight: "#EAF8EE",
  warning: "#F3AE3D",
  warningLight: "#FFF4DE",
  danger: "#EF6262",
  dangerLight: "#FFF0F0",
  purple: "#7D67F8",
  purpleLight: "#EEEAFE",
  navy: "#18213A",
  white: "#FFFFFF",
};

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function getDaysLeft(date: string) {
  const now = new Date();
  const due = new Date(date);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDay(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return { day: "--", month: "--" };
  }

  return {
    day: parsed.getDate().toString().padStart(2, "0"),
    month: parsed.toLocaleString("en-US", { month: "short" }).toUpperCase(),
  };
}

export default function HomeScreen() {
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userName = user?.name || user?.email?.split("@")[0] || "Student";
  const isProfessor = user?.role === "professor";

  async function loadProjects() {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      console.log("Home fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const enhancedProjects: ProjectWithStatus[] = useMemo(
    () =>
      projects.map((project) => ({
        ...project,
        status: getProjectStatus(project.progress),
      })),
    [projects],
  );

  const totalProjects = enhancedProjects.length;

  const completedProjects = enhancedProjects.filter(
    (project) => project.status === "Completed",
  ).length;

  const attentionProjects = enhancedProjects.filter(
    (project) => project.status === "Attention",
  ).length;

  const averageProgress =
    totalProjects > 0
      ? Math.round(
          enhancedProjects.reduce((sum, project) => sum + project.progress, 0) /
            totalProjects,
        )
      : 0;

  const focusProject = [...enhancedProjects].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  )[0];

  const upcomingDeadlines = [...enhancedProjects]
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )
    .slice(0, 3);

  const totalTasks = enhancedProjects.reduce(
    (sum, project) => sum + project.tasks.length,
    0,
  );

  const completedTasks = enhancedProjects.reduce(
    (sum, project) =>
      sum + project.tasks.filter((task) => task.completed).length,
    0,
  );

  const weeklyBars = useMemo(() => {
    const seed = [
      Math.max(18, averageProgress - 20),
      Math.max(25, averageProgress - 12),
      Math.max(32, averageProgress - 6),
      Math.max(40, averageProgress),
      Math.min(100, averageProgress + 6),
      Math.min(100, averageProgress + 12),
      Math.min(100, averageProgress + 18),
    ];

    return seed.map((value) => clamp(value));
  }, [averageProgress]);

  const initials = userName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingLogo}>
          <Ionicons name="sparkles-outline" size={30} color={C.primary} />
        </View>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Preparing your workspace...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadProjects();
            }}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
      >
        <View style={styles.topBar}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>SyncTrack</Text>
            <Text style={styles.brandTag}>Your academic command center</Text>
          </View>

          <TouchableOpacity style={styles.avatar} activeOpacity={0.86}>
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeGlowOne} />
          <View style={styles.welcomeGlowTwo} />

          <Text style={styles.welcomeEyebrow}>
            {getGreeting().toUpperCase()}
          </Text>

          <Text style={styles.welcomeTitle}>
            {isProfessor
              ? "Ready to guide your teams?"
              : `Ready for today, ${userName.split(" ")[0]}?`}
          </Text>

          <Text style={styles.welcomeText}>
            {attentionProjects > 0
              ? `${attentionProjects} project${attentionProjects > 1 ? "s need" : " needs"} your attention today.`
              : "Everything looks on track. Keep the momentum going."}
          </Text>

          <View style={styles.welcomeActions}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => router.push("/(tabs)/dashboard")}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryActionText}>Open Dashboard</Text>
              <Ionicons name="arrow-forward" size={17} color={C.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => router.push("/ai")}
              activeOpacity={0.85}
            >
              <Ionicons name="sparkles-outline" size={17} color={C.purple} />
              <Text style={styles.secondaryActionText}>Ask AI</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.snapshotRow}>
          <SnapshotCard
            icon="layers-outline"
            value={totalProjects}
            label="Projects"
            color={C.primary}
            background={C.primaryLight}
          />
          <SnapshotCard
            icon="checkmark-done-outline"
            value={completedProjects}
            label="Completed"
            color={C.success}
            background={C.successLight}
          />
          <SnapshotCard
            icon="alert-circle-outline"
            value={attentionProjects}
            label="Alerts"
            color={C.danger}
            background={C.dangerLight}
          />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>SMART BRIEFING</Text>
            <Text style={styles.sectionTitle}>Your day at a glance</Text>
          </View>
        </View>

        <View style={styles.briefingCard}>
          <View style={styles.briefingTop}>
            <View style={styles.briefingIcon}>
              <Ionicons name="bulb-outline" size={24} color={C.warning} />
            </View>

            <View style={styles.briefingContent}>
              <Text style={styles.briefingTitle}>Today’s recommendation</Text>
              <Text style={styles.briefingText}>
                {focusProject
                  ? `Spend your first focused session on “${focusProject.title}”. It is your nearest upcoming deadline.`
                  : "Add your first project to receive a personalised daily recommendation."}
              </Text>
            </View>
          </View>

          <View style={styles.briefingDivider} />

          <View style={styles.briefingStats}>
            <View>
              <Text style={styles.briefingStatValue}>{averageProgress}%</Text>
              <Text style={styles.briefingStatLabel}>Average progress</Text>
            </View>

            <View>
              <Text style={styles.briefingStatValue}>
                {completedTasks}/{totalTasks}
              </Text>
              <Text style={styles.briefingStatLabel}>Tasks complete</Text>
            </View>

            <View>
              <Text style={styles.briefingStatValue}>
                {upcomingDeadlines.length}
              </Text>
              <Text style={styles.briefingStatLabel}>Upcoming</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>FOCUS MODE</Text>
            <Text style={styles.sectionTitle}>Next priority</Text>
          </View>

          {focusProject ? (
            <TouchableOpacity
              onPress={() => router.push(`/project/${focusProject.id}`)}
            >
              <Text style={styles.sectionLink}>Open</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.focusCard}>
          <View style={styles.focusAccent} />

          <View style={styles.focusHeader}>
            <View style={styles.focusIcon}>
              <Ionicons name="flag-outline" size={23} color={C.primaryDark} />
            </View>

            <View style={styles.focusTitleBlock}>
              <Text style={styles.focusLabel}>CURRENT PRIORITY</Text>
              <Text style={styles.focusTitle} numberOfLines={1}>
                {focusProject?.title || "No active project"}
              </Text>
              <Text style={styles.focusMeta} numberOfLines={1}>
                {focusProject
                  ? `${focusProject.subject} · Due ${focusProject.dueDate}`
                  : "Your most important project will appear here."}
              </Text>
            </View>

            {focusProject ? (
              <View style={styles.focusPercent}>
                <Text style={styles.focusPercentText}>
                  {focusProject.progress}%
                </Text>
              </View>
            ) : null}
          </View>

          {focusProject ? (
            <>
              <View style={styles.focusProgressBg}>
                <View
                  style={[
                    styles.focusProgressFill,
                    { width: `${clamp(focusProject.progress)}%` },
                  ]}
                />
              </View>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => router.push(`/project/${focusProject.id}`)}
              >
                <Text style={styles.continueText}>Continue working</Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={C.primaryDark}
                />
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>UPCOMING</Text>
            <Text style={styles.sectionTitle}>Deadline timeline</Text>
          </View>

          <TouchableOpacity onPress={() => router.push("/(tabs)/dashboard")}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timelineCard}>
          {upcomingDeadlines.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-clear-outline"
                size={31}
                color={C.muted}
              />
              <Text style={styles.emptyText}>No deadlines available.</Text>
            </View>
          ) : (
            upcomingDeadlines.map((project, index) => {
              const { day, month } = formatDay(project.dueDate);
              const daysLeft = getDaysLeft(project.dueDate);
              const urgent = daysLeft <= 3;

              return (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.timelineItem,
                    index === upcomingDeadlines.length - 1 &&
                      styles.timelineItemLast,
                  ]}
                  onPress={() => router.push(`/project/${project.id}`)}
                  activeOpacity={0.78}
                >
                  <View
                    style={[styles.dateBadge, urgent && styles.dateBadgeUrgent]}
                  >
                    <Text
                      style={[styles.dateDay, urgent && styles.dateDayUrgent]}
                    >
                      {day}
                    </Text>
                    <Text
                      style={[
                        styles.dateMonth,
                        urgent && styles.dateMonthUrgent,
                      ]}
                    >
                      {month}
                    </Text>
                  </View>

                  <View style={styles.timelineBody}>
                    <Text style={styles.timelineTitle} numberOfLines={1}>
                      {project.title}
                    </Text>
                    <Text style={styles.timelineMeta} numberOfLines={1}>
                      {project.subject}
                    </Text>
                  </View>

                  <View
                    style={[styles.daysPill, urgent && styles.daysPillUrgent]}
                  >
                    <Text
                      style={[
                        styles.daysPillText,
                        urgent && styles.daysPillTextUrgent,
                      ]}
                    >
                      {daysLeft > 0 ? `${daysLeft}d` : "Due"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>MOMENTUM</Text>
            <Text style={styles.sectionTitle}>Weekly pulse</Text>
          </View>
        </View>

        <View style={styles.pulseCard}>
          <View style={styles.pulseHeader}>
            <View>
              <Text style={styles.pulseValue}>{averageProgress}%</Text>
              <Text style={styles.pulseLabel}>Current momentum</Text>
            </View>

            <View style={styles.pulseBadge}>
              <Ionicons name="trending-up" size={15} color={C.success} />
              <Text style={styles.pulseBadgeText}>Improving</Text>
            </View>
          </View>

          <View style={styles.chart}>
            {weeklyBars.map((height, index) => (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.chartTrack}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: `${height}%`,
                        backgroundColor:
                          index === weeklyBars.length - 1
                            ? C.primary
                            : C.primaryLight,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>
                  {["M", "T", "W", "T", "F", "S", "S"][index]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>SHORTCUTS</Text>
            <Text style={styles.sectionTitle}>Quick access</Text>
          </View>
        </View>

        <View style={styles.quickGrid}>
          <QuickAction
            icon="sparkles-outline"
            title="AI Assistant"
            subtitle="Get instant support"
            color={C.purple}
            background={C.purpleLight}
            onPress={() => router.push("/ai")}
          />

          <QuickAction
            icon="chatbubble-ellipses-outline"
            title="Messages"
            subtitle="Talk with professors"
            color={C.success}
            background={C.successLight}
            onPress={() => router.push("/(tabs)/explore")}
          />

          <QuickAction
            icon="library-outline"
            title="Resources"
            subtitle="Open study materials"
            color={C.warning}
            background={C.warningLight}
            onPress={() => router.push("/(tabs)/explore")}
          />

          <QuickAction
            icon="grid-outline"
            title="Dashboard"
            subtitle="Manage all projects"
            color={C.primary}
            background={C.primaryLight}
            onPress={() => router.push("/(tabs)/dashboard")}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SnapshotCard({
  icon,
  value,
  label,
  color,
  background,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number | string;
  label: string;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.snapshotCard}>
      <View style={[styles.snapshotIcon, { backgroundColor: background }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.snapshotValue}>{value}</Text>
      <Text style={styles.snapshotLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
  color,
  background,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.quickCard}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={[styles.quickIcon, { backgroundColor: background }]}>
        <Ionicons name={icon} size={23} color={color} />
      </View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },

  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingLogo: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: C.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#1D2939",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  loadingText: {
    color: C.secondary,
    marginTop: 14,
    fontWeight: "700",
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  brandBlock: {
    flex: 1,
    paddingRight: 12,
  },

  brandName: {
    color: C.text,
    fontSize: 24,
    fontWeight: "900",
  },

  brandTag: {
    color: C.secondary,
    marginTop: 2,
    fontSize: 11,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: C.primaryDark,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },

  avatarText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "900",
  },

  welcomeCard: {
    backgroundColor: C.navy,
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    overflow: "hidden",
  },

  welcomeGlowOne: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(24, 189, 227, 0.16)",
    right: -50,
    top: -70,
  },

  welcomeGlowTwo: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(125, 103, 248, 0.12)",
    left: -30,
    bottom: -50,
  },

  welcomeEyebrow: {
    color: "#7EE5F7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  welcomeTitle: {
    color: C.white,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "900",
    marginTop: 8,
    maxWidth: "88%",
  },

  welcomeText: {
    color: "#D6DEED",
    marginTop: 10,
    lineHeight: 20,
    fontSize: 13,
    maxWidth: "90%",
  },

  welcomeActions: {
    flexDirection: "row",
    marginTop: 18,
    gap: 10,
  },

  primaryAction: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  primaryActionText: {
    color: C.white,
    fontWeight: "900",
    fontSize: 12,
  },

  secondaryAction: {
    backgroundColor: C.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  secondaryActionText: {
    color: C.purple,
    fontWeight: "900",
    fontSize: 12,
  },

  snapshotRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },

  snapshotCard: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 19,
    padding: 13,
    alignItems: "center",
  },

  snapshotIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  snapshotValue: {
    color: C.text,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 8,
  },

  snapshotLabel: {
    color: C.secondary,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },

  sectionEyebrow: {
    color: C.primaryDark,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  sectionTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
  },

  sectionLink: {
    color: C.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },

  briefingCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 23,
    padding: 18,
    marginBottom: 24,
  },

  briefingTop: {
    flexDirection: "row",
  },

  briefingIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: C.warningLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  briefingContent: {
    flex: 1,
  },

  briefingTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "900",
  },

  briefingText: {
    color: C.secondary,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 4,
  },

  briefingDivider: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: 15,
  },

  briefingStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  briefingStatValue: {
    color: C.text,
    fontSize: 18,
    fontWeight: "900",
  },

  briefingStatLabel: {
    color: C.secondary,
    fontSize: 9,
    marginTop: 2,
  },

  focusCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    overflow: "hidden",
  },

  focusAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: C.primary,
  },

  focusHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  focusIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },

  focusTitleBlock: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },

  focusLabel: {
    color: C.primaryDark,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  focusTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 3,
  },

  focusMeta: {
    color: C.secondary,
    fontSize: 11,
    marginTop: 3,
  },

  focusPercent: {
    minWidth: 48,
    height: 31,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },

  focusPercentText: {
    color: C.primaryDark,
    fontSize: 11,
    fontWeight: "900",
  },

  focusProgressBg: {
    height: 7,
    backgroundColor: C.divider,
    borderRadius: 20,
    marginTop: 16,
    overflow: "hidden",
  },

  focusProgressFill: {
    height: 7,
    backgroundColor: C.primary,
    borderRadius: 20,
  },

  continueButton: {
    alignSelf: "flex-start",
    marginTop: 14,
    backgroundColor: C.primaryLight,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  continueText: {
    color: C.primaryDark,
    fontWeight: "900",
    fontSize: 12,
  },

  timelineCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 23,
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },

  timelineItemLast: {
    borderBottomWidth: 0,
  },

  dateBadge: {
    width: 46,
    height: 50,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  dateBadgeUrgent: {
    backgroundColor: C.dangerLight,
  },

  dateDay: {
    color: C.primaryDark,
    fontSize: 16,
    fontWeight: "900",
  },

  dateDayUrgent: {
    color: C.danger,
  },

  dateMonth: {
    color: C.primaryDark,
    fontSize: 8,
    fontWeight: "900",
    marginTop: 1,
  },

  dateMonthUrgent: {
    color: C.danger,
  },

  timelineBody: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  timelineTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "900",
  },

  timelineMeta: {
    color: C.secondary,
    fontSize: 10,
    marginTop: 3,
  },

  daysPill: {
    backgroundColor: C.successLight,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  daysPillUrgent: {
    backgroundColor: C.dangerLight,
  },

  daysPillText: {
    color: C.success,
    fontSize: 10,
    fontWeight: "900",
  },

  daysPillTextUrgent: {
    color: C.danger,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },

  emptyText: {
    color: C.secondary,
    fontSize: 12,
    marginTop: 8,
  },

  pulseCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 23,
    padding: 18,
    marginBottom: 24,
  },

  pulseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  pulseValue: {
    color: C.text,
    fontSize: 29,
    fontWeight: "900",
  },

  pulseLabel: {
    color: C.secondary,
    fontSize: 11,
    marginTop: 2,
  },

  pulseBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.successLight,
    borderRadius: 13,
    paddingHorizontal: 9,
    paddingVertical: 6,
    gap: 4,
  },

  pulseBadgeText: {
    color: C.success,
    fontSize: 10,
    fontWeight: "900",
  },

  chart: {
    height: 120,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 18,
  },

  chartColumn: {
    flex: 1,
    alignItems: "center",
  },

  chartTrack: {
    height: 92,
    width: 18,
    backgroundColor: C.soft,
    borderRadius: 10,
    justifyContent: "flex-end",
    overflow: "hidden",
  },

  chartBar: {
    width: "100%",
    borderRadius: 10,
  },

  chartLabel: {
    color: C.muted,
    fontSize: 9,
    marginTop: 6,
    fontWeight: "700",
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  quickCard: {
    width: "48.5%",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 15,
    marginBottom: 11,
  },

  quickIcon: {
    width: 41,
    height: 41,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  quickTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 10,
  },

  quickSubtitle: {
    color: C.secondary,
    fontSize: 10,
    marginTop: 3,
    lineHeight: 15,
  },
});
