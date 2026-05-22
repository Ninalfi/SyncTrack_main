import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchProjects,
  getProjectStatus,
  Project,
} from "../../data/projects";

type FilterType =
  | "All"
  | "Completed"
  | "On Track"
  | "Review"
  | "Attention";

export default function HomeScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<FilterType>("All");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const enhancedProjects = useMemo(() => {
    return projects.map((project) => ({
      ...project,
      status: getProjectStatus(project.progress),
    }));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return enhancedProjects.filter((project) => {
      const search = searchText.toLowerCase();

      const matchesSearch =
        project.title.toLowerCase().includes(search) ||
        project.subject.toLowerCase().includes(search) ||
        project.professor.toLowerCase().includes(search);

      const matchesFilter =
        activeFilter === "All" ||
        project.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [enhancedProjects, searchText, activeFilter]);

  const totalProjects = enhancedProjects.length;

  const completedProjects =
    enhancedProjects.filter(
      (p) => p.status === "Completed"
    ).length;

  const averageProgress =
    enhancedProjects.length > 0
      ? Math.round(
          enhancedProjects.reduce(
            (sum, project) =>
              sum + project.progress,
            0
          ) / enhancedProjects.length
        )
      : 0;

  const upcomingProject =
    enhancedProjects.length > 0
      ? [...enhancedProjects].sort(
          (a, b) =>
            new Date(a.dueDate).getTime() -
            new Date(b.dueDate).getTime()
        )[0]
      : null;

  const filters: FilterType[] = [
    "All",
    "Completed",
    "On Track",
    "Review",
    "Attention",
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />
        <Text style={styles.loadingText}>
          Loading projects...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>
            Good Morning 👋
          </Text>
          <Text style={styles.logo}>
            SyncTrack
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileCircle}
        >
          <Text style={styles.profileText}>
            S
          </Text>
        </TouchableOpacity>
      </View>

      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons
            name="school-outline"
            size={28}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.title}>
          Manage Academic Projects Smarter
        </Text>

        <Text style={styles.subtitle}>
          Track student progress,
          monitor deadlines, and review
          submissions through one
          professional workspace.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push("/(tabs)/dashboard")
          }
        >
          <Text
            style={styles.primaryButtonText}
          >
            Open Dashboard
          </Text>

          <Ionicons
            name="arrow-forward-outline"
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <StatCard
          icon="folder-open-outline"
          value={totalProjects}
          label="Projects"
          color="#60A5FA"
        />

        <StatCard
          icon="checkmark-circle-outline"
          value={completedProjects}
          label="Completed"
          color="#22C55E"
        />

        <StatCard
          icon="analytics-outline"
          value={`${averageProgress}%`}
          label="Average"
          color="#F59E0B"
        />
      </View>

      {/* SMART OVERVIEW */}
      {upcomingProject && (
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons
              name="bulb-outline"
              size={22}
              color="#DBEAFE"
            />

            <Text
              style={styles.insightTitle}
            >
              Smart Overview
            </Text>
          </View>

          <Text style={styles.insightText}>
            Upcoming deadline:{" "}
            {upcomingProject.title} on{" "}
            {upcomingProject.dueDate}
          </Text>
        </View>
      )}

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#64748B"
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
          placeholderTextColor="#64748B"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* FILTERS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter &&
                styles.filterButtonActive,
            ]}
            onPress={() =>
              setActiveFilter(filter)
            }
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter &&
                  styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* PROJECTS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Active Projects
        </Text>

        <Text style={styles.sectionCount}>
          {filteredProjects.length} shown
        </Text>
      </View>

      {filteredProjects.map((project) => (
        <View
          key={project.id}
          style={styles.projectCard}
        >
          <View style={styles.projectTop}>
            <View style={{ flex: 1 }}>
              <Text
                style={styles.projectTitle}
              >
                {project.title}
              </Text>

              <Text
                style={styles.projectMeta}
              >
                {project.subject} •{" "}
                {project.professor}
              </Text>
            </View>

            <Text
              style={[
                styles.badge,
                project.status ===
                  "Completed" &&
                  styles.completedBadge,
                project.status ===
                  "On Track" &&
                  styles.goodBadge,
                project.status ===
                  "Review" &&
                  styles.warningBadge,
                project.status ===
                  "Attention" &&
                  styles.dangerBadge,
              ]}
            >
              {project.status}
            </Text>
          </View>

          <View
            style={styles.progressHeader}
          >
            <Text
              style={styles.progressLabel}
            >
              Progress
            </Text>

            <Text
              style={styles.progressValue}
            >
              {project.progress}%
            </Text>
          </View>

          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${project.progress}%`,
                },
                project.status ===
                  "Completed" &&
                  styles.progressGood,
                project.status ===
                  "On Track" &&
                  styles.progressGood,
                project.status ===
                  "Attention" &&
                  styles.progressDanger,
              ]}
            />
          </View>

          <View style={styles.projectFooter}>
            <View style={styles.infoPill}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#94A3B8"
              />
              <Text
                style={styles.infoPillText}
              >
                Due {project.dueDate}
              </Text>
            </View>

            <View style={styles.infoPill}>
              <Ionicons
                name="people-outline"
                size={14}
                color="#94A3B8"
              />
              <Text
                style={styles.infoPillText}
              >
                {project.students} students
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() =>
              router.push(
                `/project/${project.id}`
              )
            }
          >
            <Text
              style={
                styles.detailsButtonText
              }
            >
              See Details
            </Text>

            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function StatCard({
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
      <Ionicons
        name={icon}
        size={22}
        color={color}
      />

      <Text style={styles.statNumber}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    padding: 18,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B1120",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#FFFFFF",
    marginTop: 16,
    fontSize: 16,
  },

  topBar: {
    marginTop: 10,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greeting: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
  },

  logo: {
    color: "#F8FAFC",
    fontSize: 30,
    fontWeight: "900",
  },

  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  profileText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  hero: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 18,
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    color: "#F8FAFC",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 38,
  },

  subtitle: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 22,
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 20,
    padding: 16,
  },

  statNumber: {
    color: "#F8FAFC",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 8,
  },

  statLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "700",
  },

  insightCard: {
    backgroundColor: "#172554",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#2563EB",
    marginBottom: 16,
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

  searchBox: {
    backgroundColor: "#020617",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingHorizontal: 14,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    color: "#F8FAFC",
  },

  filterButton: {
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  filterButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  filterText: {
    color: "#94A3B8",
    fontWeight: "800",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  sectionHeader: {
    marginTop: 20,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "900",
  },

  sectionCount: {
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
    fontSize: 17,
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
    fontSize: 11,
    fontWeight: "900",
  },

  completedBadge: {
    color: "#BBF7D0",
    backgroundColor: "#052E16",
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

  progressBg: {
    height: 9,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    marginTop: 8,
  },

  progressFill: {
    height: 9,
    backgroundColor: "#F59E0B",
    borderRadius: 20,
  },

  progressGood: {
    backgroundColor: "#22C55E",
  },

  progressDanger: {
    backgroundColor: "#EF4444",
  },

  projectFooter: {
    flexDirection: "row",
    gap: 10,
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

  detailsButton: {
    backgroundColor: "#2563EB",
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  detailsButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});