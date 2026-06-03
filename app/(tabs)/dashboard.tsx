import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
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

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const isProfessor = user?.role === "professor";

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      console.log("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  const enhancedProjects: ProjectWithStatus[] = useMemo(() => {
    return projects.map((project) => ({
      ...project,
      status: getProjectStatus(project.progress),
    }));
  }, [projects]);

  const averageProgress =
    enhancedProjects.length > 0
      ? Math.round(
          enhancedProjects.reduce((sum, project) => sum + project.progress, 0) /
            enhancedProjects.length
        )
      : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {isProfessor ? (
<ProfessorDashboard
  projects={enhancedProjects}
  averageProgress={averageProgress}
  logout={logout}
  userName={user?.name || user?.email?.split("@")[0] || "Professor"}
/>
      ) : (
<StudentDashboard
  projects={enhancedProjects}
  averageProgress={averageProgress}
  logout={logout}
  userName={user?.name || user?.email?.split("@")[0] || "Student"}
/>
      )}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function StudentDashboard({
  projects,
  averageProgress,
  logout,
  userName = "Student",
}: {
  projects: ProjectWithStatus[];
  averageProgress: number;
  logout: () => void;
  userName?: string;
}) {
  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const attentionProjects = projects.filter((p) => p.status === "Attention").length;

  const pendingTasks = projects.reduce(
    (sum, project) => sum + project.tasks.filter((task) => !task.completed).length,
    0
  );

  const completedTasks = projects.reduce(
    (sum, project) => sum + project.tasks.filter((task) => task.completed).length,
    0
  );

  const nextProject = [...projects].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )[0];

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const currentHour = new Date().getHours();

const greeting =
  currentHour < 12
    ? "Good Morning ☀️"
    : currentHour < 17
    ? "Good Afternoon 🌤️"
    : currentHour < 21
    ? "Good Evening 🌙"
    : "Good Night 🌌";

  return (
    <>
      <View style={styles.premiumHeader}>
        <View>
          <Text style={styles.premiumWelcome}>{greeting}</Text>
          <Text style={styles.premiumName}>{userName}</Text>
          <Text style={styles.premiumRole}>CSE Student</Text>
        </View>

        <TouchableOpacity style={styles.premiumAvatar} onPress={logout}>
          <Text style={styles.premiumAvatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.premiumHero}>
        <View>
          <Text style={styles.premiumHeroLabel}>My Progress</Text>
          <Text style={styles.premiumHeroPercent}>{averageProgress}%</Text>
          <Text style={styles.premiumHeroText}>
            {nextProject
              ? `${nextProject.title} • Due ${nextProject.dueDate}`
              : "No active project found"}
          </Text>
        </View>

        <View style={styles.circleProgress}>
          <Text style={styles.circleText}>{averageProgress}%</Text>
        </View>

        <View style={styles.premiumProgressBg}>
          <View style={[styles.premiumProgressFill, { width: `${averageProgress}%` }]} />
        </View>
      </View>

      <View style={styles.premiumGrid}>
        <StudentStat icon="folder-outline" value={projects.length} label="Projects" color="#60A5FA" />
        <StudentStat icon="checkmark-circle-outline" value={completedProjects} label="Completed" color="#22C55E" />
        <StudentStat icon="list-outline" value={pendingTasks} label="Pending Tasks" color="#F59E0B" />
        <StudentStat icon="warning-outline" value={attentionProjects} label="Alerts" color="#EF4444" />
      </View>

      <View style={styles.premiumInsight}>
        <View style={styles.premiumInsightTop}>
          <Ionicons name="sparkles-outline" size={24} color="#DBEAFE" />
          <Text style={styles.premiumInsightTitle}>Smart Insight</Text>
        </View>

        <Text style={styles.premiumInsightText}>
          You completed {completedTasks} tasks and have {pendingTasks} tasks remaining.
          Focus on your next deadline and submit your weekly update on time.
        </Text>
      </View>

      <View style={styles.premiumActionRow}>
        <TouchableOpacity
          style={styles.premiumAction}
          onPress={() => Linking.openURL(GOOGLE_FORM_URL)}
        >
          <Ionicons name="cloud-upload-outline" size={28} color="#60A5FA" />
          <Text style={styles.premiumActionText}>Submit Update</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.premiumAction} onPress={() => router.push("/ai")}>
          <Ionicons name="sparkles-outline" size={28} color="#A78BFA" />
          <Text style={styles.premiumActionText}>Ask AI</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.bigSectionTitle}>My Projects</Text>
        <Text style={styles.countText}>{projects.length} shown</Text>
      </View>

      {projects.map((project) => (
        <StudentProjectCard key={project.id} project={project} />
      ))}
    </>
  );
}

function ProfessorDashboard({
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

  const activeCourses = new Set(projects.map((p) => p.subject)).size || projects.length;

  const courses = projects.map((project, index) => ({
    code: project.subject || `COURSE ${index + 1}`,
    title: project.title || "Untitled Project",
    students: Number(project.students || 0),
    progress: project.progress || 0,
    color:
      project.status === "Completed"
        ? "#22C55E"
        : project.status === "On Track"
        ? "#7C3AED"
        : project.status === "Review"
        ? "#F59E0B"
        : "#EF4444",
  }));

  const todos = projects
    .flatMap((project) =>
      project.tasks.map((task) => ({
        title: task.title,
        date: project.dueDate,
        done: task.completed,
        tag: task.completed
          ? "Done"
          : project.status === "Attention"
          ? "Urgent"
          : project.status === "Review"
          ? "High"
          : "Medium",
      }))
    )
    .slice(0, 6);

  const performance = projects.map((project) => ({
    name: project.studentName || "Unknown Student",
    detail: `${project.subject} · ${project.title}`,
    grade:
      project.progress >= 90
        ? "A"
        : project.progress >= 75
        ? "B+"
        : project.progress >= 60
        ? "B"
        : project.progress >= 50
        ? "C+"
        : "D",
  }));

  const schedule = projects.slice(0, 6).map((project, index) => ({
    time:
      index === 0
        ? "9:00 AM"
        : index === 1
        ? "11:00 AM"
        : index === 2
        ? "1:00 PM"
        : index === 3
        ? "3:30 PM"
        : index === 4
        ? "5:00 PM"
        : "6:00 PM",
    title: project.title,
    place: `${project.subject} · Due ${project.dueDate}`,
    color:
      project.status === "Completed"
        ? "#22C55E"
        : project.status === "On Track"
        ? "#7C3AED"
        : project.status === "Review"
        ? "#F59E0B"
        : "#EF4444",
  }));

  return (
    <>
      <View style={styles.professorHeader}>
        <View style={styles.professorProfile}>
          <View style={styles.professorAvatar}>
            <Text style={styles.professorAvatarText}>
  {userName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()}
</Text>
          </View>

          <View>
            <Text style={styles.professorName}>{userName}</Text>
            <Text style={styles.professorDept}>Department of Computer Science and Engineering</Text>

            <View style={styles.universityBadge}>
              <Ionicons name="business-outline" size={12} color="#6D5DF7" />
              <Text style={styles.universityText}>Jagannath University</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.professorLogout} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.professorControls}>
        <SmallButton icon="calendar-outline" text="Today" />
        <IconButton icon="notifications-outline" />
        <IconButton icon="settings-outline" />
      </View>

      <View style={styles.professorStatsGrid}>
        <ProfessorStat
          title="Active courses"
          value={activeCourses}
          footer="From live project data"
          icon="book-outline"
          good
        />
        <ProfessorStat
          title="Total students"
          value={totalStudents}
          footer="Across all projects"
          icon="people-outline"
          good
        />
        <ProfessorStat
          title="Pending review"
          value={pending}
          footer="Needs attention"
          icon="document-text-outline"
          danger
        />
        <ProfessorStat
          title="Avg progress"
          value={`${averageProgress}%`}
          footer="Live class average"
          icon="bar-chart-outline"
          good
        />
      </View>

      <View style={styles.professorCard}>
        <CardHeader title="My courses" link="See all →" icon="library-outline" />

        {courses.length === 0 ? (
          <Text style={styles.emptyText}>No course data found.</Text>
        ) : (
          courses.map((course, index) => (
            <View key={`${course.code}-${index}`} style={styles.courseRow}>
              <View style={[styles.courseDot, { backgroundColor: course.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.courseTitle}>
                  {course.code} — {course.title}
                </Text>
                <Text style={styles.courseMeta}>Project progress tracking</Text>
              </View>
              <View style={styles.courseStudents}>
                <Ionicons name="person-outline" size={13} color="#999" />
                <Text style={styles.courseStudentsText}>{course.students}</Text>
              </View>
              <View style={styles.courseProgressBox}>
                <View style={styles.courseProgressBg}>
                  <View
                    style={[
                      styles.courseProgressFill,
                      { width: `${course.progress}%`, backgroundColor: course.color },
                    ]}
                  />
                </View>
                <Text style={styles.courseProgressText}>{course.progress}%</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.professorCard}>
        <CardHeader title="To-do & deadlines" link="Plan week →" icon="checkbox-outline" />

        {todos.length === 0 ? (
          <Text style={styles.emptyText}>No task data found.</Text>
        ) : (
          todos.map((todo, index) => (
            <View key={index} style={styles.todoRow}>
              <View style={[styles.todoCheck, todo.done && styles.todoCheckDone]}>
                {todo.done && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.todoTitle, todo.done && styles.todoDoneText]}>
                  {todo.title}
                </Text>
                <Text style={styles.todoDate}>Due {todo.date}</Text>
              </View>

              <Text
                style={[
                  styles.todoTag,
                  todo.tag === "Done" && styles.tagLow,
                  todo.tag === "Urgent" && styles.tagUrgent,
                  todo.tag === "High" && styles.tagHigh,
                  todo.tag === "Medium" && styles.tagMedium,
                ]}
              >
                {todo.tag}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.professorCard}>
        <CardHeader title="Recent student performance" link="Full report →" icon="person-add-outline" />

        {performance.length === 0 ? (
          <Text style={styles.emptyText}>No student data found.</Text>
        ) : (
          performance.slice(0, 6).map((student, index) => (
            <View key={`${student.name}-${index}`} style={styles.performanceRow}>
              <View style={styles.studentInitial}>
                <Text style={styles.studentInitialText}>
                  {student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.performanceName}>{student.name}</Text>
                <Text style={styles.performanceDetail}>{student.detail}</Text>
              </View>

              <Text style={styles.gradeBadge}>{student.grade}</Text>
            </View>
          ))
        )}

        <Text style={styles.chartTitle}>Progress distribution</Text>
        <View style={styles.gradeChart}>
          <ChartBar label="90+" height={projects.filter((p) => p.progress >= 90).length * 18 + 10} color="#65A30D" />
          <ChartBar label="75+" height={projects.filter((p) => p.progress >= 75 && p.progress < 90).length * 18 + 10} color="#3B82F6" />
          <ChartBar label="50+" height={projects.filter((p) => p.progress >= 50 && p.progress < 75).length * 18 + 10} color="#D97706" />
          <ChartBar label="<50" height={projects.filter((p) => p.progress < 50).length * 18 + 10} color="#EF4444" />
        </View>
      </View>

      <View style={styles.professorCard}>
        <CardHeader title="Today's schedule" link="Full week →" icon="calendar-outline" />

        {schedule.length === 0 ? (
          <Text style={styles.emptyText}>No schedule data found.</Text>
        ) : (
          schedule.map((item) => (
            <View key={`${item.time}-${item.title}`} style={styles.scheduleRow}>
              <Text style={styles.scheduleTime}>{item.time}</Text>
              <View style={[styles.scheduleLine, { backgroundColor: item.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.scheduleTitle}>{item.title}</Text>
                <Text style={styles.schedulePlace}>{item.place}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </>
  );
}

function StudentStat({
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
    <View style={styles.premiumStatCard}>
      <Ionicons name={icon} size={26} color={color} />
      <Text style={[styles.premiumStatValue, { color }]}>{value}</Text>
      <Text style={styles.premiumStatLabel}>{label}</Text>
    </View>
  );
}

function StudentProjectCard({ project }: { project: ProjectWithStatus }) {
  return (
    <View style={styles.premiumProjectCard}>
      <View style={styles.projectTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.premiumProjectTitle}>{project.title}</Text>
          <Text style={styles.premiumProjectMeta}>
            {project.subject} • {project.professor}
          </Text>
        </View>

        <Text
          style={[
            styles.premiumBadge,
            project.status === "Completed" && styles.statusGreen,
            project.status === "On Track" && styles.statusGreen,
            project.status === "Review" && styles.statusOrange,
            project.status === "Attention" && styles.statusRed,
          ]}
        >
          {project.status}
        </Text>
      </View>

      <View style={styles.pillRow}>
        <InfoPill icon="calendar-outline" text={`Due ${project.dueDate}`} />
        <InfoPill icon="flag-outline" text={project.priority} />
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Progress</Text>
        <Text style={styles.progressValue}>{project.progress}%</Text>
      </View>

      <View style={styles.studentProgressBg}>
        <View
          style={[
            styles.studentProgressFill,
            { width: `${project.progress}%` },
            project.status === "Completed" && styles.greenFill,
            project.status === "On Track" && styles.greenFill,
            project.status === "Review" && styles.blueFill,
            project.status === "Attention" && styles.redFill,
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

function InfoPill({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.infoPill}>
      <Ionicons name={icon} size={16} color="#A7B4CC" />
      <Text style={styles.infoPillText}>{text}</Text>
    </View>
  );
}

function ProfessorStat({
  title,
  value,
  footer,
  icon,
  good,
  danger,
}: {
  title: string;
  value: number | string;
  footer: string;
  icon: keyof typeof Ionicons.glyphMap;
  good?: boolean;
  danger?: boolean;
}) {
  return (
    <View style={styles.professorStatCard}>
      <View style={styles.professorStatHeader}>
        <Ionicons name={icon} size={16} color="#999" />
        <Text style={styles.professorStatTitle}>{title}</Text>
      </View>
      <Text style={styles.professorStatValue}>{value}</Text>
      <Text
        style={[
          styles.professorStatFooter,
          danger ? styles.dangerText : good ? styles.goodText : null,
        ]}
      >
        {footer}
      </Text>
    </View>
  );
}

function SmallButton({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.smallButton}>
      <Ionicons name={icon} size={15} color="#999" />
      <Text style={styles.smallButtonText}>{text}</Text>
    </View>
  );
}

function IconButton({ icon }: { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.iconButton}>
      <Ionicons name={icon} size={20} color="#999" />
    </View>
  );
}

function CardHeader({
  title,
  link,
  icon,
}: {
  title: string;
  link: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.cardHeader}>
      <View style={styles.cardTitleRow}>
        <Ionicons name={icon} size={18} color="#999" />
        <Text style={styles.professorCardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardLink}>{link}</Text>
    </View>
  );
}

function ChartBar({ label, height, color }: { label: string; height: number; color: string }) {
  return (
    <View style={styles.chartBarWrapper}>
      <View style={[styles.chartBar, { height: Math.min(height, 80), backgroundColor: color }]} />
      <Text style={styles.chartLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  premiumHeader: {
  marginTop: 10,
  marginBottom: 22,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},
premiumWelcome: {
  color: "#94A3B8",
  fontSize: 15,
  fontWeight: "700",
},
premiumName: {
  color: "#F8FAFC",
  fontSize: 34,
  fontWeight: "900",
  marginTop: 4,
},
premiumRole: {
  color: "#64748B",
  fontSize: 14,
  fontWeight: "800",
  marginTop: 4,
},
premiumAvatar: {
  width: 58,
  height: 58,
  borderRadius: 29,
  backgroundColor: "#2563EB",
  justifyContent: "center",
  alignItems: "center",
},
premiumAvatarText: {
  color: "#FFFFFF",
  fontSize: 20,
  fontWeight: "900",
},
premiumHero: {
  backgroundColor: "#111827",
  borderRadius: 30,
  padding: 24,
  borderWidth: 1,
  borderColor: "#1E293B",
  marginBottom: 20,
},
premiumHeroLabel: {
  color: "#94A3B8",
  fontSize: 15,
  fontWeight: "800",
},
premiumHeroPercent: {
  color: "#F8FAFC",
  fontSize: 54,
  fontWeight: "900",
  marginTop: 8,
},
premiumHeroText: {
  color: "#CBD5E1",
  marginTop: 8,
  lineHeight: 22,
  maxWidth: "70%",
},
circleProgress: {
  position: "absolute",
  right: 24,
  top: 34,
  width: 86,
  height: 86,
  borderRadius: 43,
  borderWidth: 8,
  borderColor: "#2563EB",
  justifyContent: "center",
  alignItems: "center",
},
circleText: {
  color: "#F8FAFC",
  fontSize: 18,
  fontWeight: "900",
},
premiumProgressBg: {
  height: 12,
  backgroundColor: "#1E293B",
  borderRadius: 20,
  marginTop: 24,
},
premiumProgressFill: {
  height: 12,
  backgroundColor: "#2563EB",
  borderRadius: 20,
},
premiumGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
  marginBottom: 20,
},
premiumStatCard: {
  width: "48%",
  backgroundColor: "#020617",
  borderWidth: 1,
  borderColor: "#1E293B",
  borderRadius: 22,
  padding: 18,
},
premiumStatValue: {
  fontSize: 30,
  fontWeight: "900",
  marginTop: 12,
},
premiumStatLabel: {
  color: "#94A3B8",
  fontSize: 13,
  fontWeight: "800",
  marginTop: 4,
},
premiumInsight: {
  backgroundColor: "#172554",
  borderWidth: 1,
  borderColor: "#2563EB",
  borderRadius: 24,
  padding: 20,
  marginBottom: 20,
},
premiumInsightTop: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
},
premiumInsightTitle: {
  color: "#F8FAFC",
  fontSize: 20,
  fontWeight: "900",
},
premiumInsightText: {
  color: "#DBEAFE",
  lineHeight: 23,
  fontWeight: "700",
},
premiumActionRow: {
  flexDirection: "row",
  gap: 12,
  marginBottom: 24,
},
premiumAction: {
  flex: 1,
  backgroundColor: "#020617",
  borderWidth: 1,
  borderColor: "#1E293B",
  borderRadius: 22,
  padding: 20,
  alignItems: "center",
},
premiumActionText: {
  color: "#F8FAFC",
  fontWeight: "900",
  marginTop: 10,
  textAlign: "center",
},
premiumProjectCard: {
  backgroundColor: "#111827",
  borderWidth: 1,
  borderColor: "#1E293B",
  borderRadius: 24,
  padding: 18,
  marginBottom: 14,
},
premiumProjectTitle: {
  color: "#F8FAFC",
  fontSize: 18,
  fontWeight: "900",
},
premiumProjectMeta: {
  color: "#94A3B8",
  marginTop: 6,
  lineHeight: 20,
},
premiumBadge: {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  overflow: "hidden",
  fontSize: 12,
  fontWeight: "900",
},
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B1120",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { color: "#FFFFFF", marginTop: 14, fontWeight: "700" },
  container: { flex: 1, backgroundColor: "#0B1120", padding: 20 },

  studentHeader: {
    marginTop: 20,
    marginBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: { color: "#9CB3D9", fontSize: 22 },
  studentTitle: { color: "#FFFFFF", fontSize: 44, fontWeight: "900", lineHeight: 52 },
  studentSub: { color: "#7A8BAA", fontSize: 20, fontWeight: "800", marginTop: 10 },
  logoutCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
  },
  studentHero: {
    backgroundColor: "#111827",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#1E293B",
    padding: 28,
    marginBottom: 28,
  },
  heroLabel: { color: "#9CB3D9", fontSize: 24 },
  heroPercent: { color: "#FFFFFF", fontSize: 64, fontWeight: "900", marginTop: 20 },
  heroIconBox: {
    position: "absolute",
    right: 36,
    top: 64,
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  heroProgressBg: {
    height: 14,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    marginTop: 25,
  },
  heroProgressFill: {
    height: 14,
    backgroundColor: "#2563EB",
    borderRadius: 20,
  },
  heroFocus: { color: "#D7E3F7", fontSize: 22, marginTop: 24 },
  studentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 18, marginBottom: 28 },
  studentStatCard: {
    width: "47%",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 28,
    padding: 28,
    minHeight: 170,
  },
  studentStatValue: { fontSize: 46, fontWeight: "900", marginTop: 28 },
  studentStatLabel: { color: "#9CB3D9", fontSize: 20, fontWeight: "900", marginTop: 8 },
  studentInsight: {
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 28,
    padding: 28,
    marginBottom: 28,
  },
  insightTitleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  studentInsightTitle: { color: "#FFFFFF", fontSize: 28, fontWeight: "900" },
  studentInsightText: { color: "#DBEAFE", fontSize: 20, lineHeight: 32 },
  actionRow: { flexDirection: "row", gap: 20, marginBottom: 32 },
  bigAction: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 28,
    paddingVertical: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#060B18",
  },
  bigActionText: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", marginTop: 18 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  bigSectionTitle: { color: "#FFFFFF", fontSize: 34, fontWeight: "900" },
  countText: { color: "#60A5FA", fontSize: 22, fontWeight: "900" },
  studentProjectCard: {
    backgroundColor: "#111827",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#1E293B",
    padding: 28,
    marginBottom: 24,
  },
  projectTop: { flexDirection: "row", justifyContent: "space-between", gap: 14 },
  studentProjectTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "900" },
  studentProjectMeta: { color: "#9CB3D9", fontSize: 20, lineHeight: 28, marginTop: 12 },
  studentStatusBadge: {
    minWidth: 110,
    textAlign: "center",
    paddingHorizontal: 14,
    paddingVertical: 18,
    borderRadius: 28,
    overflow: "hidden",
    fontSize: 18,
    fontWeight: "900",
  },
  statusGreen: { color: "#22C55E", backgroundColor: "#052E16" },
  statusOrange: { color: "#F59E0B", backgroundColor: "#451A03" },
  statusRed: { color: "#EF4444", backgroundColor: "#450A0A" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 24 },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#050A16",
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  infoPillText: { color: "#A7B4CC", fontSize: 16, fontWeight: "900" },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginTop: 26 },
  progressLabel: { color: "#9CB3D9", fontSize: 18, fontWeight: "900" },
  progressValue: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  studentProgressBg: { height: 12, backgroundColor: "#1E293B", borderRadius: 20, marginTop: 12 },
  studentProgressFill: { height: 12, borderRadius: 20 },
  greenFill: { backgroundColor: "#22C55E" },
  blueFill: { backgroundColor: "#60A5FA" },
  redFill: { backgroundColor: "#EF4444" },
  projectBottom: { marginTop: 24, flexDirection: "row", justifyContent: "space-between" },
  milestoneText: { color: "#D7E3F7", fontSize: 20, fontWeight: "900" },
  detailsText: { color: "#60A5FA", fontSize: 20, fontWeight: "900" },

  professorHeader: {
    marginTop: 10,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  professorProfile: { flexDirection: "row", alignItems: "center", gap: 14 },
  professorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#C4B5FD",
    justifyContent: "center",
    alignItems: "center",
  },
  professorAvatarText: { color: "#3B0764", fontWeight: "900", fontSize: 16 },
  professorName: { color: "#F5F5F5", fontSize: 20, fontWeight: "900" },
  professorDept: { color: "#999", marginTop: 2 },
  universityBadge: {
    backgroundColor: "#F5F3FF",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  universityText: { color: "#6D5DF7", fontSize: 12, fontWeight: "700" },
  professorLogout: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
  },
  professorControls: { flexDirection: "row", gap: 10, marginBottom: 26 },
  smallButton: {
    backgroundColor: "#202020",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  smallButtonText: { color: "#AAA", fontWeight: "700" },
  iconButton: {
    backgroundColor: "#202020",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  professorStatsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  professorStatCard: { width: "48%", backgroundColor: "#242424", borderRadius: 10, padding: 20 },
  professorStatHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  professorStatTitle: { color: "#999", fontSize: 13 },
  professorStatValue: { color: "#F5F5F5", fontSize: 30, fontWeight: "700", marginTop: 18 },
  professorStatFooter: { marginTop: 8, fontSize: 12 },
  goodText: { color: "#4D7C0F" },
  dangerText: { color: "#DC2626" },
  professorCard: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 14,
    padding: 20,
    marginBottom: 18,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  professorCardTitle: { color: "#F5F5F5", fontSize: 16, fontWeight: "900" },
  cardLink: { color: "#7C3AED", fontWeight: "800" },
  emptyText: { color: "#999", paddingVertical: 10 },
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
    paddingVertical: 13,
    gap: 10,
  },
  courseDot: { width: 8, height: 8, borderRadius: 4 },
  courseTitle: { color: "#F5F5F5", fontWeight: "800" },
  courseMeta: { color: "#999", marginTop: 2, fontSize: 12 },
  courseStudents: { flexDirection: "row", gap: 4, alignItems: "center", width: 42 },
  courseStudentsText: { color: "#999", fontSize: 12 },
  courseProgressBox: { width: 90 },
  courseProgressBg: { height: 4, backgroundColor: "#333", borderRadius: 10 },
  courseProgressFill: { height: 4, borderRadius: 10 },
  courseProgressText: { color: "#999", fontSize: 11, textAlign: "right", marginTop: 4 },
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
    paddingVertical: 14,
  },
  todoCheck: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },
  todoCheckDone: { backgroundColor: "#10B981", borderColor: "#10B981" },
  todoTitle: { color: "#F5F5F5", fontWeight: "700" },
  todoDoneText: { color: "#777", textDecorationLine: "line-through" },
  todoDate: { color: "#999", fontSize: 12, marginTop: 4 },
  todoTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    overflow: "hidden",
    fontSize: 11,
    fontWeight: "800",
    backgroundColor: "#EEE",
  },
  tagUrgent: { color: "#DC2626", backgroundColor: "#FEE2E2" },
  tagHigh: { color: "#B91C1C", backgroundColor: "#FFF1F2" },
  tagMedium: { color: "#92400E", backgroundColor: "#FEF3C7" },
  tagLow: { color: "#4D7C0F", backgroundColor: "#ECFCCB" },
  performanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
    paddingVertical: 12,
  },
  studentInitial: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
  },
  studentInitialText: { color: "#3B0764", fontWeight: "900", fontSize: 12 },
  performanceName: { color: "#F5F5F5", fontWeight: "800" },
  performanceDetail: { color: "#999", fontSize: 12, marginTop: 2 },
  gradeBadge: {
    backgroundColor: "#ECFDF5",
    color: "#166534",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: "hidden",
    fontWeight: "900",
  },
  chartTitle: { color: "#999", marginTop: 18, marginBottom: 14 },
  gradeChart: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 90 },
  chartBarWrapper: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  chartBar: { width: "100%", borderRadius: 3 },
  chartLabel: { color: "#999", marginTop: 8, fontSize: 11 },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
    paddingVertical: 14,
  },
  scheduleTime: { color: "#999", width: 62, fontSize: 12 },
  scheduleLine: { width: 4, height: 34, borderRadius: 4 },
  scheduleTitle: { color: "#F5F5F5", fontWeight: "900" },
  schedulePlace: { color: "#999", fontSize: 12, marginTop: 3 },
});