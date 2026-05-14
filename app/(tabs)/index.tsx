import { useMemo, useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";

import { router } from "expo-router";
import { fetchProjects } from "../../data/projects";

type FilterType =
  | "All"
  | "On Track"
  | "Review"
  | "Attention";

function getStatus(progress: number) {
  if (progress >= 80)
    return "On Track";

  if (progress >= 60)
    return "Review";

  return "Attention";
}

export default function HomeScreen() {
  const [projects, setProjects] =
    useState<any[]>([]);

  const [searchText, setSearchText] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState<FilterType>("All");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data =
        await fetchProjects();

      setProjects(data || []);
    } catch (error) {
      console.log(
        "PROJECT FETCH ERROR:",
        error
      );

      setProjects([]);
    }
  }

  const enhancedProjects = (
    projects || []
  ).map((project) => ({
    ...project,
    status: getStatus(
      project.progress
    ),
  }));

  const filteredProjects =
    useMemo(() => {
      return enhancedProjects.filter(
        (project) => {
          const matchesSearch =
            project.title
              .toLowerCase()
              .includes(
                searchText.toLowerCase()
              ) ||
            project.subject
              .toLowerCase()
              .includes(
                searchText.toLowerCase()
              );

          const matchesFilter =
            activeFilter === "All" ||
            project.status ===
              activeFilter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      searchText,
      activeFilter,
      enhancedProjects,
    ]);

  const totalProjects =
    enhancedProjects.length;

  const needReview =
    enhancedProjects.filter(
      (project) =>
        project.progress < 80
    ).length;

  const attentionProjects =
    enhancedProjects.filter(
      (project) =>
        project.progress < 60
    ).length;

  const averageProgress =
    Math.round(
      enhancedProjects.reduce(
        (sum, project) =>
          sum +
          project.progress,
        0
      ) /
        (enhancedProjects.length ||
          1)
    );

  const upcomingProject = [
    ...enhancedProjects,
  ].sort(
    (a, b) =>
      new Date(
        a.dueDate
      ).getTime() -
      new Date(
        b.dueDate
      ).getTime()
  )[0];

  const filters: FilterType[] = [
    "All",
    "On Track",
    "Review",
    "Attention",
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
    >
      <View style={styles.hero}>
        <Text style={styles.appName}>
          SyncTrack
        </Text>

        <Text style={styles.title}>
          Manage Projects Smarter
        </Text>

        <Text
          style={styles.subtitle}
        >
          Track student progress,
          monitor deadlines,
          and review updates in
          one clean dashboard.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push(
              "/(tabs)/dashboard"
            )
          }
        >
          <Text
            style={styles.buttonText}
          >
            View Dashboard
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          value={totalProjects}
          label="Projects"
        />

        <StatCard
          value={needReview}
          label="Need Review"
        />

        <StatCard
          value={`${averageProgress}%`}
          label="Average"
        />
      </View>

      {upcomingProject && (
        <View
          style={styles.insightCard}
        >
          <Text
            style={
              styles.insightTitle
            }
          >
            Smart Overview
          </Text>

          <Text
            style={
              styles.insightText
            }
          >
            {attentionProjects}{" "}
            project needs urgent
            attention. Next
            deadline:{" "}
            {
              upcomingProject.title
            }{" "}
            on{" "}
            {
              upcomingProject.dueDate
            }
            .
          </Text>
        </View>
      )}

      <TextInput
        style={styles.searchInput}
        placeholder="Search projects or subjects..."
        placeholderTextColor="#64748B"
        value={searchText}
        onChangeText={
          setSearchText
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        style={styles.filterScroll}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,

              activeFilter ===
                filter &&
                styles.filterButtonActive,
            ]}
            onPress={() =>
              setActiveFilter(
                filter
              )
            }
          >
            <Text
              style={[
                styles.filterText,

                activeFilter ===
                  filter &&
                  styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.card}>
        <View
          style={styles.sectionHeader}
        >
          <Text
            style={styles.cardTitle}
          >
            Active Projects
          </Text>

          <Text
            style={styles.sectionLink}
          >
            {
              filteredProjects.length
            }{" "}
            shown
          </Text>
        </View>

        {filteredProjects.length ===
        0 ? (
          <Text
            style={styles.emptyText}
          >
            No projects found.
          </Text>
        ) : (
          filteredProjects.map(
            (project) => (
              <View
                key={project.id}
                style={
                  styles.projectCard
                }
              >
                <View
                  style={
                    styles.projectHeader
                  }
                >
                  <Text
                    style={
                      styles.projectTitle
                    }
                  >
                    {project.title}
                  </Text>

                  <Text
                    style={
                      styles.projectProgress
                    }
                  >
                    {
                      project.progress
                    }
                    %
                  </Text>
                </View>

                <View
                  style={
                    styles.progressBg
                  }
                >
                  <View
                    style={[
                      styles.progressFill,

                      {
                        width: `${project.progress}%`,
                      },

                      project.status ===
                        "On Track" &&
                        styles.progressGood,

                      project.status ===
                        "Attention" &&
                        styles.progressDanger,
                    ]}
                  />
                </View>

                <View
                  style={
                    styles.projectFooter
                  }
                >
                  <Text
                    style={
                      styles.tag
                    }
                  >
                    {
                      project.subject
                    }
                  </Text>

                  <Text
                    style={
                      styles.dueDate
                    }
                  >
                    Due{" "}
                    {
                      project.dueDate
                    }
                  </Text>
                </View>

                <Text
                  style={[
                    styles.status,

                    project.status ===
                      "Attention" &&
                      styles.statusDanger,

                    project.status ===
                      "On Track" &&
                      styles.statusGood,
                  ]}
                >
                  {
                    project.status
                  }
                </Text>

                <TouchableOpacity
                  style={
                    styles.detailsButton
                  }
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
                </TouchableOpacity>
              </View>
            )
          )
        )}
      </View>

      <View
        style={styles.bottomSpace}
      />
    </ScrollView>
  );
}

function StatCard({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text
        style={styles.statNumber}
      >
        {value}
      </Text>

      <Text
        style={styles.statLabel}
      >
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

  hero: {
    backgroundColor: "#111827",
    padding: 24,
    borderRadius: 26,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  appName: {
    color: "#60A5FA",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 12,
  },

  title: {
    color: "#F8FAFC",
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 37,
  },

  subtitle: {
    color: "#CBD5E1",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
    marginBottom: 22,
  },

  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 16,
  },

  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
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
    borderRadius: 18,
    padding: 16,
  },

  statNumber: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "900",
  },

  statLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 5,
    fontWeight: "700",
  },

  insightCard: {
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },

  insightTitle: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 6,
  },

  insightText: {
    color: "#DBEAFE",
    lineHeight: 21,
  },

  searchInput: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 16,
    padding: 14,
    color: "#F8FAFC",
    marginBottom: 12,
  },

  filterScroll: {
    marginBottom: 16,
  },

  filterButton: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
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

  card: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  cardTitle: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "900",
  },

  sectionLink: {
    color: "#60A5FA",
    fontSize: 13,
    fontWeight: "800",
  },

  emptyText: {
    color: "#94A3B8",
    textAlign: "center",
    paddingVertical: 20,
  },

  projectCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },

  projectHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    gap: 10,
  },

  projectTitle: {
    color: "#F8FAFC",
    fontSize: 15,
    fontWeight: "900",
    flex: 1,
  },

  projectProgress: {
    color: "#60A5FA",
    fontSize: 14,
    fontWeight: "900",
  },

  progressBg: {
    height: 8,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    marginTop: 12,
  },

  progressFill: {
    height: 8,
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
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },

  tag: {
    color: "#E5E7EB",
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: "hidden",
    fontSize: 11,
    fontWeight: "800",
  },

  dueDate: {
    color: "#94A3B8",
    fontSize: 12,
  },

  status: {
    color: "#F59E0B",
    marginTop: 10,
    fontSize: 12,
    fontWeight: "900",
  },

  statusDanger: {
    color: "#EF4444",
  },

  statusGood: {
    color: "#22C55E",
  },

  detailsButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
  },

  detailsButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "900",
  },

  bottomSpace: {
    height: 100,
  },
});