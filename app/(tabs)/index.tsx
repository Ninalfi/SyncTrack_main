import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { fetchProjects, getProjectStatus, Project } from "../../data/projects";

const GOOGLE_FORM_URL = "PASTE_YOUR_GOOGLE_FORM_LINK_HERE";

type ProjectWithStatus = Project & {
  status: "Completed" | "On Track" | "Review" | "Attention";
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning ☀️";
  if (hour < 17) return "Good Afternoon 🌤️";
  if (hour < 21) return "Good Evening 🌙";
  return "Good Night 🌌";
}

function getDaysLeft(date: string) {
  const today = new Date();
  const due = new Date(date);
  const diff = due.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
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

  const enhancedProjects: ProjectWithStatus[] = useMemo(() => {
    return projects.map((project) => ({
      ...project,
      status: getProjectStatus(project.progress),
    }));
  }, [projects]);

  const totalProjects = enhancedProjects.length;

  const completedProjects = enhancedProjects.filter(
    (project) => project.status === "Completed"
  ).length;

  const attentionProjects = enhancedProjects.filter(
    (project) => project.status === "Attention"
  ).length;

  const averageProgress =
    totalProjects > 0
      ? Math.round(
          enhancedProjects.reduce(
            (sum, project) => sum + project.progress,
            0
          ) / totalProjects
        )
      : 0;

  const focusProject = enhancedProjects[0];

  const upcomingDeadlines = [...enhancedProjects]
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() -
        new Date(b.dueDate).getTime()
    )
    .slice(0, 3);

  const initials = userName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={styles.loadingText}>Loading SyncTrack...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadProjects();
          }}
          tintColor="#60A5FA"
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.role}>
            {isProfessor ? "Professor Workspace" : "CSE Student"}
          </Text>
        </View>

        <TouchableOpacity style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.overviewCard}>
        <View style={styles.overviewTop}>
          <Text style={styles.overviewTitle}>Overall Progress</Text>
        </View>

        <Text style={styles.overviewPercent}>{averageProgress}%</Text>

        <View style={styles.overviewProgressBg}>
          <View
            style={[
              styles.overviewProgressFill,
              { width: `${averageProgress}%` },
            ]}
          />
        </View>

        <Text style={styles.overviewStats}>
          {totalProjects} Projects • {completedProjects} Completed •{" "}
          {attentionProjects} Alerts
        </Text>

        <TouchableOpacity
  style={styles.dashboardButton}
  onPress={() => router.push("/(tabs)/dashboard")}
>
  <Text style={styles.dashboardButtonText}>
    Open Dashboard ᯓ  ✈︎
  </Text>

</TouchableOpacity>
      </View>

      <View style={styles.focusCard}>
        <View style={styles.focusTop}>
          <View style={styles.focusIcon}>
            <Ionicons name="rocket-outline" size={28} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.focusLabel}>Today’s Focus</Text>
            <Text style={styles.focusTitle}>
              {focusProject?.title || "No active project"}
            </Text>
          </View>
        </View>

        <Text style={styles.focusText}>
          {focusProject
            ? `${focusProject.subject} • ${focusProject.progress}% complete • Due ${focusProject.dueDate}`
            : "Once projects are loaded, your main focus will appear here."}
        </Text>

        {focusProject && (
          <>
            <View style={styles.focusProgressBg}>
              <View
                style={[
                  styles.focusProgressFill,
                  { width: `${focusProject.progress}%` },
                ]}
              />
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push(`/project/${focusProject.id}`)}
            >
              <Text style={styles.continueText}>Continue Project ᯓ ✈︎</Text>
        
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.quickGrid}>
        <QuickCard
          icon="sparkles-outline"
          title="AI"
          color="#7C3AED"
          onPress={() => router.push("/ai")}
        />

        <QuickCard
          icon="chatbubble-ellipses-outline"
          title="Chat"
          color="#22C55E"
          onPress={() => router.push("/(tabs)/explore")}
        />

        <QuickCard
          icon="library-outline"
          title="Docs"
          color="#F59E0B"
          onPress={() => router.push("/(tabs)/explore")}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>

        <TouchableOpacity onPress={() => router.push("/(tabs)/dashboard")}>
          <Text style={styles.sectionLink}>View all ᯓ✈︎</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.deadlineCard}>
        {upcomingDeadlines.length === 0 ? (
          <Text style={styles.emptyText}>No deadlines available.</Text>
        ) : (
          upcomingDeadlines.map((project) => {
            const daysLeft = getDaysLeft(project.dueDate);

            return (
              <TouchableOpacity
                key={project.id}
                style={styles.deadlineItem}
                onPress={() => router.push(`/project/${project.id}`)}
              >
                <View
                  style={[
                    styles.deadlineDot,
                    daysLeft <= 3 && styles.deadlineDotDanger,
                  ]}
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.deadlineTitle}>{project.title}</Text>
                  <Text style={styles.deadlineMeta}>
                    {project.subject} • Due {project.dueDate}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.daysBadge,
                    daysLeft <= 3 && styles.daysBadgeDanger,
                  ]}
                >
                  {daysLeft > 0 ? `${daysLeft}d` : "Due"}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View style={styles.aiBanner}>
        <View style={styles.aiTop}>
          <Ionicons name="sparkles-outline" size={28} color="#DBEAFE" />
          <Text style={styles.aiTitle}>Need help today?</Text>
        </View>

        <Text style={styles.aiText}>
          Generate weekly updates, project summaries, coding explanations, or
          presentation notes with SyncTrack AI.
        </Text>

        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => router.push("/ai")}
        >
          <Text style={styles.aiButtonText}>Open AI Assistant</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
      </View>

      <View style={styles.activityCard}>
        <ActivityItem
          icon="checkmark-circle-outline"
          title="Progress synced"
          text="Latest project progress was loaded successfully."
          color="#22C55E"
        />

        <ActivityItem
          icon="document-text-outline"
          title="Weekly update reminder"
          text="Submit your project update using the Google Form."
          color="#60A5FA"
        />

        <ActivityItem
          icon="notifications-outline"
          title="Deadline tracking active"
          text={`${upcomingDeadlines.length} upcoming deadline(s) found.`}
          color="#F59E0B"
        />
      </View>

      <View style={styles.announcementCard}>
        <View style={styles.announcementIcon}>
          <Ionicons name="megaphone-outline" size={24} color="#F59E0B" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.announcementTitle}>Announcement</Text>
          <Text style={styles.announcementText}>
            Final project evaluation schedule will be shared soon. Keep your
            updates and resources ready.
          </Text>
        </View>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function QuickCard({
  icon,
  title,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.quickCard, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.quickIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <Text style={styles.quickTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

function ActivityItem({
  icon,
  title,
  text,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  color: string;
}) {
  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B1120",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#CBD5E1",
    marginTop: 14,
    fontWeight: "800",
  },
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: "#CBD5E1",
    fontSize: 15,
    fontWeight: "800",
  },
  name: {
    color: "#F8FAFC",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 4,
  },
  role: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  overviewCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
  },
  overviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  overviewTitle: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "800",
  },
  dashboardButton: {
  marginTop: 18,
  backgroundColor: "#2563EB",
  paddingVertical: 14,
  borderRadius: 16,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
},

dashboardButtonText: {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: "900",
},
  dashboardLink: {
    color: "#60A5FA",
    fontWeight: "900",
    fontSize: 13,
  },
  overviewPercent: {
    color: "#F8FAFC",
    fontSize: 42,
    fontWeight: "900",
    marginTop: 12,
  },
  overviewProgressBg: {
    height: 10,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    marginTop: 14,
  },
  overviewProgressFill: {
    height: 10,
    backgroundColor: "#2563EB",
    borderRadius: 20,
  },
  overviewStats: {
    color: "#94A3B8",
    marginTop: 12,
    fontWeight: "700",
  },

  focusCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 30,
    padding: 24,
    marginBottom: 20,
  },
  focusTop: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  focusIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  focusLabel: {
    color: "#60A5FA",
    fontSize: 13,
    fontWeight: "900",
  },
  focusTitle: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 4,
  },
  focusText: {
    color: "#CBD5E1",
    marginTop: 18,
    lineHeight: 22,
  },
  focusProgressBg: {
    height: 11,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    marginTop: 18,
  },
  focusProgressFill: {
    height: 11,
    backgroundColor: "#2563EB",
    borderRadius: 20,
  },
  continueButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  continueText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },

  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  quickCard: {
    width: "32%",
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickTitle: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "900",
  },
  sectionLink: {
    color: "#60A5FA",
    fontWeight: "900",
  },

  deadlineCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },
  deadlineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  deadlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
  },
  deadlineDotDanger: {
    backgroundColor: "#EF4444",
  },
  deadlineTitle: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 15,
  },
  deadlineMeta: {
    color: "#94A3B8",
    marginTop: 4,
    fontSize: 12,
  },
  daysBadge: {
    color: "#22C55E",
    backgroundColor: "#052E16",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    overflow: "hidden",
    fontWeight: "900",
    fontSize: 12,
  },
  daysBadgeDanger: {
    color: "#EF4444",
    backgroundColor: "#450A0A",
  },

  aiBanner: {
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 26,
    padding: 22,
    marginBottom: 20,
  },
  aiTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  aiTitle: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "900",
  },
  aiText: {
    color: "#DBEAFE",
    lineHeight: 23,
    fontWeight: "700",
  },
  aiButton: {
    marginTop: 18,
    backgroundColor: "#DBEAFE",
    paddingVertical: 13,
    borderRadius: 16,
  },
  aiButtonText: {
    color: "#172554",
    textAlign: "center",
    fontWeight: "900",
  },

  activityCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  activityIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  activityTitle: {
    color: "#F8FAFC",
    fontWeight: "900",
  },
  activityText: {
    color: "#94A3B8",
    marginTop: 3,
    lineHeight: 19,
  },

  announcementCard: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  announcementIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#451A03",
    justifyContent: "center",
    alignItems: "center",
  },
  announcementTitle: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "900",
  },
  announcementText: {
    color: "#94A3B8",
    marginTop: 5,
    lineHeight: 21,
  },
  emptyText: {
    color: "#94A3B8",
    textAlign: "center",
    paddingVertical: 20,
  },
});