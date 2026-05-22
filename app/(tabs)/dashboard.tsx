import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  fetchProjects,
  getProjectStatus,
  Project,
} from "../../data/projects";

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

  const studentProjects = enhancedProjects.filter((project) => {
    if (isProfessor) return true;

    const userEmail = user?.email?.toLowerCase() || "";
    const studentName = project.studentName?.toLowerCase() || "";

    return (
      studentName.includes(userEmail.split("@")[0]) ||
      project.studentName ||
      enhancedProjects.length <= 3
    );
  });

  const visibleProjects = isProfessor ? enhancedProjects : studentProjects;

  const totalProjects = visibleProjects.length;

  const completedProjects = visibleProjects.filter(
    (project) => project.status === "Completed"
  ).length;

  const reviewProjects = visibleProjects.filter(
    (project) => project.status === "Review"
  ).length;

  const attentionProjects = visibleProjects.filter(
    (project) => project.status === "Attention"
  ).length;

  const averageProgress =
    visibleProjects.length > 0
      ? Math.round(
          visibleProjects.reduce((sum, project) => sum + project.progress, 0) /
            visibleProjects.length
        )
      : 0;

  const upcomingProject =
    visibleProjects.length > 0
      ? [...visibleProjects].sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        )[0]
      : null;

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
      <View style={styles.header}>
        <View>
          <Text style={styles.smallText}>Welcome back</Text>
          <Text style={styles.title}>
            {isProfessor ? "Professor Dashboard" : "Student Dashboard"}
          </Text>
          <Text style={styles.roleText}>
            {isProfessor
              ? "Manage student progress and submissions"
              : "Track your projects and deadlines"}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryLabel}>
              {isProfessor ? "Class Overall Progress" : "My Overall Progress"}
            </Text>
            <Text style={styles.summaryNumber}>{averageProgress}%</Text>
          </View>

          <View style={styles.summaryIcon}>
            <Ionicons
              name={isProfessor ? "school-outline" : "person-outline"}
              size={28}
              color="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${averageProgress}%` }]} />
        </View>

        <Text style={styles.summaryText}>
          {isProfessor
            ? `${attentionProjects} project needs immediate professor attention.`
            : upcomingProject
            ? `Next focus: ${upcomingProject.title}.`
            : "No project data available yet."}
        </Text>
      </View>

      {isProfessor ? (
        <ProfessorDashboard
          projects={visibleProjects}
          totalProjects={totalProjects}
          completedProjects={completedProjects}
          reviewProjects={reviewProjects}
          attentionProjects={attentionProjects}
        />
      ) : (
        <StudentDashboard
          projects={visibleProjects}
          totalProjects={totalProjects}
          completedProjects={completedProjects}
          reviewProjects={reviewProjects}
          attentionProjects={attentionProjects}
          upcomingProject={upcomingProject}
        />
      )}

      <View style={{ height: 110 }} />
    </ScrollView>
  );
}

function ProfessorDashboard({
  projects,
  totalProjects,
  completedProjects,
  reviewProjects,
  attentionProjects,
}: {
  projects: ProjectWithStatus[];
  totalProjects: number;
  completedProjects: number;
  reviewProjects: number;
  attentionProjects: number;
}) {
  const totalStudents = projects.reduce(
    (sum, project) => sum + Number(project.students || 0),
    0
  );

  const totalUpdates = projects.reduce(
    (sum, project) => sum + Number(project.submittedUpdates || 0),
    0
  );

  return (
    <>
      <View style={styles.grid}>
        <StatCard
          title="Projects"
          value={totalProjects}
          icon="folder-open-outline"
          color="#60A5FA"
        />
        <StatCard
          title="Students"
          value={totalStudents}
          icon="people-outline"
          color="#A78BFA"
        />
        <StatCard
          title="Need Review"
          value={reviewProjects}
          icon="time-outline"
          color="#F59E0B"
        />
        <StatCard
          title="Alerts"
          value={attentionProjects}
          icon="warning-outline"
          color="#EF4444"
        />
      </View>

      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Ionicons name="bulb-outline" size={22} color="#DBEAFE" />
          <Text style={styles.insightTitle}>Professor Insight</Text>
        </View>

        <Text style={styles.insightText}>
          You have {totalUpdates} submitted updates. Review low-progress projects
          first and send reminders to students who need support.
        </Text>
      </View>

      <View style={styles.actionRow}>
        <ActionButton
          title="Review Submissions"
          icon="document-text-outline"
          color="#2563EB"
        />
        <ActionButton
          title="Send Reminder"
          icon="notifications-outline"
          color="#F59E0B"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Student Project Overview</Text>
        <Text style={styles.viewAll}>{projects.length} projects</Text>
      </View>

      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} professorView />
      ))}
    </>
  );
}

function StudentDashboard({
  projects,
  totalProjects,
  completedProjects,
  reviewProjects,
  attentionProjects,
  upcomingProject,
}: {
  projects: ProjectWithStatus[];
  totalProjects: number;
  completedProjects: number;
  reviewProjects: number;
  attentionProjects: number;
  upcomingProject: ProjectWithStatus | null;
}) {
  const pendingTasks = projects.reduce((sum, project) => {
    return sum + project.tasks.filter((task) => !task.completed).length;
  }, 0);

  const completedTasks = projects.reduce((sum, project) => {
    return sum + project.tasks.filter((task) => task.completed).length;
  }, 0);

  return (
    <>
      <View style={styles.grid}>
        <StatCard
          title="My Projects"
          value={totalProjects}
          icon="folder-open-outline"
          color="#60A5FA"
        />
        <StatCard
          title="Completed"
          value={completedProjects}
          icon="checkmark-circle-outline"
          color="#22C55E"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          icon="list-outline"
          color="#F59E0B"
        />
        <StatCard
          title="Alerts"
          value={attentionProjects}
          icon="warning-outline"
          color="#EF4444"
        />
      </View>

      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Ionicons name="sparkles-outline" size={22} color="#DBEAFE" />
          <Text style={styles.insightTitle}>Student Insight</Text>
        </View>

        <Text style={styles.insightText}>
          {upcomingProject
            ? `Your next deadline is ${upcomingProject.title} on ${upcomingProject.dueDate}.`
            : "No deadline found yet."}{" "}
          You completed {completedTasks} tasks and have {pendingTasks} tasks
          remaining.
        </Text>
      </View>

      <View style={styles.actionRow}>
        <ActionButton
          title="Submit Update"
          icon="cloud-upload-outline"
          color="#2563EB"
        />
        <ActionButton
          title="Ask AI"
          icon="sparkles-outline"
          color="#7C3AED"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Projects</Text>
        <Text style={styles.viewAll}>{projects.length} shown</Text>
      </View>

      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}

      <View style={styles.taskCard}>
        <Text style={styles.sectionTitle}>My Task Summary</Text>

        {projects.slice(0, 2).map((project) =>
          project.tasks.slice(0, 3).map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <View
                style={[
                  styles.taskDot,
                  task.completed && styles.taskDotCompleted,
                ]}
              />

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.taskTitle,
                    task.completed && styles.taskTitleCompleted,
                  ]}
                >
                  {task.title}
                </Text>

                <Text style={styles.taskProject}>{project.title}</Text>
              </View>

              <Text
                style={[
                  styles.taskStatus,
                  task.completed ? styles.taskDone : styles.taskPending,
                ]}
              >
                {task.completed ? "Done" : "Pending"}
              </Text>
            </View>
          ))
        )}
      </View>
    </>
  );
}

function ProjectCard({
  project,
  professorView = false,
}: {
  project: ProjectWithStatus;
  professorView?: boolean;
}) {
  return (
    <View style={styles.projectCard}>
      <View style={styles.projectTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.projectTitle}>{project.title}</Text>

          <Text style={styles.projectMeta}>
            {professorView
              ? `${project.studentName || "Unknown Student"} • ${
                  project.subject
                }`
              : `${project.subject} • ${project.professor}`}
          </Text>
        </View>

        <Text
          style={[
            styles.badge,
            project.status === "Completed" && styles.goodBadge,
            project.status === "On Track" && styles.goodBadge,
            project.status === "Review" && styles.warningBadge,
            project.status === "Attention" && styles.dangerBadge,
          ]}
        >
          {project.status}
        </Text>
      </View>

      <View style={styles.projectInfoRow}>
        <InfoPill icon="calendar-outline" text={`Due ${project.dueDate}`} />
        <InfoPill icon="people-outline" text={`${project.students} students`} />
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Progress</Text>
        <Text style={styles.progressValue}>{project.progress}%</Text>
      </View>

      <View style={styles.progressBgSmall}>
        <View
          style={[
            styles.progressFillSmall,
            { width: `${project.progress}%` },
            project.status === "Completed" && styles.progressGood,
            project.status === "On Track" && styles.progressGood,
            project.status === "Attention" && styles.progressDanger,
          ]}
        />
      </View>

      <View style={styles.projectBottom}>
        <Text style={styles.projectPercent}>
          {project.completedMilestones}/{project.totalMilestones} milestones
        </Text>

        <TouchableOpacity>
          <Text style={styles.details}>
            {professorView ? "Review" : "Details"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function ActionButton({
  title,
  icon,
  color,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <TouchableOpacity style={[styles.actionButton, { borderColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.actionText}>{title}</Text>
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
      <Ionicons name={icon} size={14} color="#94A3B8" />
      <Text style={styles.infoPillText}>{text}</Text>
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
    color: "#FFFFFF",
    marginTop: 14,
    fontWeight: "700",
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
  smallText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 30,
    fontWeight: "900",
  },
  roleText: {
    color: "#64748B",
    marginTop: 4,
    fontWeight: "700",
  },
  logoutButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 18,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryLabel: {
    color: "#94A3B8",
    fontSize: 15,
  },
  summaryNumber: {
    color: "#F8FAFC",
    fontSize: 46,
    fontWeight: "900",
    marginTop: 8,
  },
  progressBg: {
    height: 10,
    backgroundColor: "#1E293B",
    borderRadius: 30,
    marginTop: 14,
  },
  progressFill: {
    height: 10,
    backgroundColor: "#2563EB",
    borderRadius: 30,
  },
  summaryText: {
    color: "#CBD5E1",
    marginTop: 14,
    lineHeight: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    marginTop: 8,
  },
  statTitle: {
    color: "#94A3B8",
    marginTop: 4,
    fontWeight: "700",
  },
  insightCard: {
    backgroundColor: "#172554",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#2563EB",
    marginBottom: 18,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
  },
  insightText: {
    color: "#DBEAFE",
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    color: "#F8FAFC",
    fontWeight: "900",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    alignItems: "center",
  },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "900",
  },
  viewAll: {
    color: "#60A5FA",
    fontWeight: "800",
  },
  projectCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 14,
  },
  projectTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  projectTitle: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "900",
  },
  projectMeta: {
    color: "#94A3B8",
    marginTop: 5,
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
  },
  goodBadge: {
    color: "#22C55E",
    backgroundColor: "#052E16",
  },
  warningBadge: {
    color: "#F59E0B",
    backgroundColor: "#451A03",
  },
  dangerBadge: {
    color: "#EF4444",
    backgroundColor: "#450A0A",
  },
  projectInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
  },
  infoPillText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "800",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  progressLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "800",
  },
  progressValue: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "900",
  },
  progressBgSmall: {
    height: 8,
    backgroundColor: "#1E293B",
    borderRadius: 30,
    marginTop: 8,
  },
  progressFillSmall: {
    height: 8,
    backgroundColor: "#60A5FA",
    borderRadius: 30,
  },
  progressGood: {
    backgroundColor: "#22C55E",
  },
  progressDanger: {
    backgroundColor: "#EF4444",
  },
  projectBottom: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  projectPercent: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "700",
  },
  details: {
    color: "#60A5FA",
    fontWeight: "900",
  },
  taskCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginTop: 10,
    marginBottom: 18,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  taskDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#F59E0B",
  },
  taskDotCompleted: {
    backgroundColor: "#22C55E",
  },
  taskTitle: {
    color: "#E5E7EB",
    fontWeight: "800",
  },
  taskTitleCompleted: {
    color: "#64748B",
    textDecorationLine: "line-through",
  },
  taskProject: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: "900",
  },
  taskDone: {
    color: "#22C55E",
  },
  taskPending: {
    color: "#F59E0B",
  },
});