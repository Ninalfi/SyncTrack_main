import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../../context/AuthContext";
import {
  fetchProjects,
  getProjectStatus,
  Project,
} from "../../data/projects";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSd59MAxyyTne1lu0Lih_QBaUhwK4Yf-FwkZhFIf9JTbQmM0vg/viewform?pli=1";

type ProjectWithStatus = Project & {
  status: "Completed" | "On Track" | "Review" | "Attention";
};

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
  purple: "#7B61FF",
  purpleLight: "#EEEAFE",
  white: "#FFFFFF",
};

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning ☀️";
  if (hour < 17) return "Good Afternoon 🌤️";
  if (hour < 21) return "Good Evening 🌙";
  return "Good Night 🌌";
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setProjects(await fetchProjects());
    } catch (error) {
      console.log("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  const enhancedProjects: ProjectWithStatus[] = useMemo(
    () =>
      projects.map((project) => ({
        ...project,
        status: getProjectStatus(project.progress),
      })),
    [projects]
  );

  const averageProgress =
    enhancedProjects.length > 0
      ? Math.round(
          enhancedProjects.reduce(
            (sum, project) => sum + project.progress,
            0
          ) / enhancedProjects.length
        )
      : 0;

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const name =
    user?.name || user?.email?.split("@")[0] || "Student";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {user?.role === "professor" ? (
          <ProfessorView
            projects={enhancedProjects}
            averageProgress={averageProgress}
            logout={logout}
            userName={name}
          />
        ) : (
          <StudentView
            projects={enhancedProjects}
            averageProgress={averageProgress}
            logout={logout}
            userName={name}
          />
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StudentView({
  projects,
  averageProgress,
  logout,
  userName,
}: {
  projects: ProjectWithStatus[];
  averageProgress: number;
  logout: () => void;
  userName: string;
}) {
  const completed = projects.filter((p) => p.status === "Completed").length;
  const alerts = projects.filter((p) => p.status === "Attention").length;
  const pendingTasks = projects.reduce(
    (sum, p) => sum + p.tasks.filter((t) => !t.completed).length,
    0
  );
  const completedTasks = projects.reduce(
    (sum, p) => sum + p.tasks.filter((t) => t.completed).length,
    0
  );

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const nextProject = [...projects].sort(
    (a, b) =>
      new Date(a.dueDate).getTime() -
      new Date(b.dueDate).getTime()
  )[0];

  return (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{greeting()}</Text>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.role}>CSE Student</Text>
        </View>

        <TouchableOpacity style={styles.avatar} onPress={logout}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.smallLabel}>MY PROGRESS</Text>
            <Text style={styles.heroValue}>{averageProgress}%</Text>
          </View>

          <View style={styles.circle}>
            <Text style={styles.circleText}>{averageProgress}%</Text>
          </View>
        </View>

        <Text style={styles.heroSub}>
          {nextProject
            ? `${nextProject.title} · Due ${nextProject.dueDate}`
            : "No active project found"}
        </Text>

        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${clamp(averageProgress)}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.grid}>
        <Stat icon="folder-outline" value={projects.length} label="Projects" color={C.primary} />
        <Stat icon="checkmark-circle-outline" value={completed} label="Completed" color={C.success} />
        <Stat icon="list-outline" value={pendingTasks} label="Pending Tasks" color={C.warning} />
        <Stat icon="warning-outline" value={alerts} label="Alerts" color={C.danger} />
      </View>

      <View style={styles.insightCard}>
        <View style={styles.insightIcon}>
          <Ionicons name="sparkles-outline" size={25} color={C.purple} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.insightTitle}>Smart Insight</Text>
          <Text style={styles.insightText}>
            You completed {completedTasks} tasks and have {pendingTasks} remaining.
            Focus on your next deadline and submit your weekly update on time.
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <ActionButton
          icon="cloud-upload-outline"
          text="Submit Update"
          color={C.primary}
          background={C.primaryLight}
          onPress={() => Linking.openURL(GOOGLE_FORM_URL)}
        />
        <ActionButton
          icon="sparkles-outline"
          text="Ask AI"
          color={C.purple}
          background={C.purpleLight}
          onPress={() => router.push("/ai")}
        />
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>My Projects</Text>
        <Text style={styles.countText}>{projects.length} shown</Text>
      </View>

      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </>
  );
}

function ProfessorView({
  projects,
  averageProgress,
  logout,
  userName,
}: {
  projects: ProjectWithStatus[];
  averageProgress: number;
  logout: () => void;
  userName: string;
}) {
  const totalStudents = projects.reduce(
    (sum, project) => sum + Number(project.students || 0),
    0
  );
  const pending = projects.filter(
    (p) => p.status === "Review" || p.status === "Attention"
  ).length;
  const courses = new Set(projects.map((p) => p.subject)).size || projects.length;

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <View style={styles.header}>
        <View style={styles.profProfile}>
          <View style={[styles.avatar, { backgroundColor: C.purpleLight }]}>
            <Text style={[styles.avatarText, { color: C.purple }]}>
              {initials}
            </Text>
          </View>
          <View>
            <Text style={styles.nameSmall}>{userName}</Text>
            <Text style={styles.role}>Department of CSE</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={21} color={C.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <Stat icon="book-outline" value={courses} label="Active courses" color={C.purple} />
        <Stat icon="people-outline" value={totalStudents} label="Students" color={C.primary} />
        <Stat icon="document-text-outline" value={pending} label="Pending review" color={C.danger} />
        <Stat icon="bar-chart-outline" value={`${averageProgress}%`} label="Avg progress" color={C.success} />
      </View>

      <ProfessorSection title="My courses" icon="library-outline">
        {projects.length === 0 ? (
          <Empty />
        ) : (
          projects.map((p) => (
            <View key={p.id} style={styles.listRow}>
              <View style={[styles.dot, { backgroundColor: statusColor(p.status) }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{p.subject}</Text>
                <Text style={styles.listMeta}>{p.title}</Text>
              </View>
              <Text style={styles.listValue}>{p.progress}%</Text>
            </View>
          ))
        )}
      </ProfessorSection>

      <ProfessorSection title="To-do & deadlines" icon="checkbox-outline">
        {projects.flatMap((p) => p.tasks).length === 0 ? (
          <Empty />
        ) : (
          projects
            .flatMap((project) =>
              project.tasks.map((task) => ({
                ...task,
                dueDate: project.dueDate,
              }))
            )
            .slice(0, 6)
            .map((task, index) => (
              <View key={`${task.title}-${index}`} style={styles.listRow}>
                <View
                  style={[
                    styles.checkbox,
                    task.completed && styles.checkboxDone,
                  ]}
                >
                  {task.completed ? (
                    <Ionicons name="checkmark" size={13} color={C.white} />
                  ) : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.listTitle,
                      task.completed && styles.doneText,
                    ]}
                  >
                    {task.title}
                  </Text>
                  <Text style={styles.listMeta}>Due {task.dueDate}</Text>
                </View>
              </View>
            ))
        )}
      </ProfessorSection>

      <ProfessorSection title="Recent performance" icon="people-outline">
        {projects.length === 0 ? (
          <Empty />
        ) : (
          projects.slice(0, 6).map((p) => (
            <View key={p.id} style={styles.listRow}>
              <View style={styles.studentBadge}>
                <Text style={styles.studentBadgeText}>
                  {(p.studentName || "ST").slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>
                  {p.studentName || "Unknown Student"}
                </Text>
                <Text style={styles.listMeta}>
                  {p.subject} · {p.title}
                </Text>
              </View>
              <Text style={styles.grade}>{gradeFor(p.progress)}</Text>
            </View>
          ))
        )}
      </ProfessorSection>
    </>
  );
}

function ProjectCard({ project }: { project: ProjectWithStatus }) {
  const color = statusColor(project.status);

  return (
    <View style={styles.projectCard}>
      <View style={styles.projectTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectMeta}>
            {project.subject} · {project.professor}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: `${color}18` }]}>
          <Text style={[styles.statusText, { color }]}>{project.status}</Text>
        </View>
      </View>

      <View style={styles.pillRow}>
        <InfoPill icon="calendar-outline" text={`Due ${project.dueDate}`} />
        <InfoPill icon="flag-outline" text={project.priority} />
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Progress</Text>
        <Text style={styles.progressValue}>{project.progress}%</Text>
      </View>

      <View style={styles.projectProgressBg}>
        <View
          style={[
            styles.projectProgressFill,
            {
              width: `${clamp(project.progress)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <View style={styles.projectBottom}>
        <Text style={styles.milestoneText}>
          {project.completedMilestones}/{project.totalMilestones} milestones
        </Text>

        <TouchableOpacity onPress={() => router.push(`/project/${project.id}`)}>
          <Text style={styles.detailsText}>View Details →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Stat({
  icon,
  value,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number | string;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionButton({
  icon,
  text,
  color,
  background,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: background }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={25} color={color} />
      <Text style={[styles.actionText, { color }]}>{text}</Text>
    </TouchableOpacity>
  );
}

function InfoPill({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.infoPill}>
      <Ionicons name={icon} size={15} color={C.secondary} />
      <Text style={styles.infoPillText}>{text}</Text>
    </View>
  );
}

function ProfessorSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.profSection}>
      <View style={styles.profSectionHeader}>
        <View style={styles.profTitleRow}>
          <Ionicons name={icon} size={19} color={C.primaryDark} />
          <Text style={styles.profSectionTitle}>{title}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function Empty() {
  return <Text style={styles.emptyText}>No data found.</Text>;
}

function statusColor(status: ProjectWithStatus["status"]) {
  if (status === "Completed" || status === "On Track") return C.success;
  if (status === "Review") return C.warning;
  return C.danger;
}

function gradeFor(progress: number) {
  if (progress >= 90) return "A";
  if (progress >= 75) return "B+";
  if (progress >= 60) return "B";
  if (progress >= 50) return "C+";
  return "D";
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  screen: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingTop: 16 },

  loading: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: C.secondary,
    marginTop: 14,
    fontWeight: "700",
  },

  header: {
    marginBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyebrow: { color: C.primaryDark, fontSize: 13, fontWeight: "800" },
  name: {
    color: C.text,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "900",
    marginTop: 3,
  },
  nameSmall: { color: C.text, fontSize: 21, fontWeight: "900" },
  role: { color: C.secondary, fontSize: 13, fontWeight: "600", marginTop: 2 },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: C.white, fontSize: 17, fontWeight: "900" },

  heroCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#1D2939",
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  smallLabel: {
    color: C.primaryDark,
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: "900",
  },
  heroValue: { color: C.text, fontSize: 43, fontWeight: "900", marginTop: 4 },
  heroSub: { color: C.secondary, marginTop: 9, fontSize: 13 },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 7,
    borderColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: { color: C.text, fontSize: 15, fontWeight: "900" },
  progressBg: {
    height: 8,
    backgroundColor: C.divider,
    borderRadius: 20,
    marginTop: 18,
    overflow: "hidden",
  },
  progressFill: { height: 8, backgroundColor: C.primary, borderRadius: 20 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48.5%",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 21,
    padding: 16,
    marginBottom: 10,
  },
  statIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 27, fontWeight: "900", marginTop: 10 },
  statLabel: { color: C.secondary, fontSize: 12, fontWeight: "700", marginTop: 3 },

  insightCard: {
    backgroundColor: C.purpleLight,
    borderWidth: 1,
    borderColor: "#DED7FF",
    borderRadius: 23,
    padding: 18,
    marginBottom: 20,
    flexDirection: "row",
  },
  insightIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  insightTitle: { color: C.text, fontSize: 17, fontWeight: "900" },
  insightText: { color: C.secondary, marginTop: 5, lineHeight: 19, fontSize: 12 },

  actionRow: { flexDirection: "row", gap: 11, marginBottom: 24 },
  actionButton: {
    flex: 1,
    borderRadius: 20,
    minHeight: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { fontWeight: "900", fontSize: 13, marginTop: 8 },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  sectionTitle: { color: C.text, fontSize: 21, fontWeight: "900" },
  countText: { color: C.primaryDark, fontSize: 12, fontWeight: "800" },

  projectCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 23,
    padding: 18,
    marginBottom: 14,
  },
  projectTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  projectTitle: { color: C.text, fontSize: 17, fontWeight: "900" },
  projectMeta: { color: C.secondary, marginTop: 5, fontSize: 12 },
  statusBadge: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 },
  statusText: { fontSize: 11, fontWeight: "900" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 15 },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.soft,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
  },
  infoPillText: { color: C.secondary, fontSize: 11, fontWeight: "700" },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 17,
  },
  progressLabel: { color: C.secondary, fontSize: 12, fontWeight: "700" },
  progressValue: { color: C.text, fontSize: 12, fontWeight: "900" },
  projectProgressBg: {
    height: 7,
    backgroundColor: C.divider,
    borderRadius: 20,
    marginTop: 8,
    overflow: "hidden",
  },
  projectProgressFill: { height: 7, borderRadius: 20 },
  projectBottom: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  milestoneText: { color: C.secondary, fontSize: 11, fontWeight: "700" },
  detailsText: { color: C.primaryDark, fontSize: 11, fontWeight: "900" },

  profProfile: { flexDirection: "row", alignItems: "center", gap: 11 },
  logoutButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: C.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  profSection: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 23,
    paddingHorizontal: 17,
    paddingTop: 17,
    marginBottom: 17,
  },
  profSectionHeader: { marginBottom: 7 },
  profTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  profSectionTitle: { color: C.text, fontSize: 17, fontWeight: "900" },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
    paddingVertical: 13,
    gap: 10,
  },
  dot: { width: 9, height: 9, borderRadius: 5 },
  listTitle: { color: C.text, fontSize: 13, fontWeight: "800" },
  listMeta: { color: C.secondary, marginTop: 3, fontSize: 11 },
  listValue: { color: C.primaryDark, fontSize: 12, fontWeight: "900" },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: C.success, borderColor: C.success },
  doneText: { color: C.muted, textDecorationLine: "line-through" },
  studentBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  studentBadgeText: { color: C.purple, fontSize: 11, fontWeight: "900" },
  grade: {
    color: C.success,
    backgroundColor: C.successLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: "hidden",
    fontWeight: "900",
  },
  emptyText: { color: C.secondary, paddingVertical: 16, textAlign: "center" },
});