import { useEffect, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { router } from "expo-router";

const API_URL =
  "https://sheetdb.io/api/v1/h8unfu037masy";

interface Project {
  timestamp: string;
  studentId: string;
  studentName: string;
  projectTitle: string;
  courseName: string;
  weekNumber: string;
  progress: number;
  updateDetails: string;
}

export default function Dashboard() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const response =
        await fetch(API_URL);

      const data =
        await response.json();

      const cleanedData =
        data.map((item: any) => ({
          timestamp:
            item.Timestamp || "",

          studentId:
            item["Student ID "] ||
            "",

          studentName:
            item["Student Name  "] ||
            "",

          projectTitle:
            item["Project Title  "] ||
            "Untitled Project",

          courseName:
            item["Course Name  "] ||
            "",

          weekNumber:
            item["Week Number  "] ||
            "",

          progress: parseInt(
            item[
              "Progress  "
            ]?.replace("%", "") ||
              "0"
          ),

          updateDetails:
            item[
              "Update Details  "
            ] || "",
        }));

      setProjects(cleanedData);
    } catch (error) {
      console.log(
        "API ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  function getStatus(
    progress: number
  ) {
    if (progress >= 80)
      return "On Track";

    if (progress >= 60)
      return "Review";

    return "Attention";
  }

  const totalProjects =
    projects.length;

  const averageProgress =
    Math.round(
      projects.reduce(
        (sum, p) =>
          sum + p.progress,
        0
      ) /
        (projects.length || 1)
    );

  const attentionProjects =
    projects.filter(
      (p) => p.progress < 60
    ).length;

  if (loading) {
    return (
      <View
        style={
          styles.loaderContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text
          style={{
            color: "white",
            marginTop: 12,
          }}
        >
          Loading Projects...
        </Text>
      </View>
    );
  }

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

        <Text style={styles.heroTitle}>
          Dashboard Overview
        </Text>

        <Text
          style={styles.heroSubtitle}
        >
          Monitor student project
          progress in real-time.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          value={totalProjects}
          label="Projects"
        />

        <StatCard
          value={`${averageProgress}%`}
          label="Average"
        />

        <StatCard
          value={attentionProjects}
          label="Attention"
        />
      </View>

      <Text style={styles.section}>
        Active Projects
      </Text>

      {projects.map(
        (project, index) => {
          const status =
            getStatus(
              project.progress
            );

          return (
            <View
              key={index}
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
                  {
                    project.projectTitle
                  }
                </Text>

                <Text
                  style={
                    styles.progressPercent
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

                    status ===
                      "On Track" &&
                      styles.progressGood,

                    status ===
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
                    project.courseName
                  }
                </Text>

                <Text
                  style={
                    styles.week
                  }
                >
                  Week{" "}
                  {
                    project.weekNumber
                  }
                </Text>
              </View>

              <Text
                style={[
                  styles.status,

                  status ===
                    "On Track" &&
                    styles.statusGood,

                  status ===
                    "Attention" &&
                    styles.statusDanger,
                ]}
              >
                {status}
              </Text>

              <TouchableOpacity
                style={
                  styles.detailsButton
                }
                onPress={() =>
                  router.push(
                    `/project/${index}`
                  )
                }
              >
                <Text
                  style={
                    styles.detailsText
                  }
                >
                  See Details
                </Text>
              </TouchableOpacity>
            </View>
          );
        }
      )}

      <View
        style={{
          height: 100,
        }}
      />
    </ScrollView>
  );
}

function StatCard({
  value,
  label,
}: {
  value: string | number;
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

  loaderContainer: {
    flex: 1,
    backgroundColor: "#0B1120",
    justifyContent: "center",
    alignItems: "center",
  },

  hero: {
    backgroundColor: "#111827",
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  appName: {
    color: "#60A5FA",
    fontWeight: "900",
    marginBottom: 12,
  },

  heroTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "900",
  },

  heroSubtitle: {
    color: "#CBD5E1",
    marginTop: 12,
    lineHeight: 22,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1E293B",
    borderRadius: 18,
    padding: 18,
  },

  statNumber: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
  },

  statLabel: {
    color: "#94A3B8",
    marginTop: 6,
    fontSize: 12,
  },

  section: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 18,
  },

  projectCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  projectHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  projectTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
    flex: 1,
  },

  progressPercent: {
    color: "#60A5FA",
    fontWeight: "900",
    fontSize: 16,
  },

  progressBg: {
    height: 10,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    marginTop: 16,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
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
    justifyContent:
      "space-between",
    marginTop: 16,
  },

  tag: {
    color: "#E2E8F0",
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    fontSize: 12,
    overflow: "hidden",
  },

  week: {
    color: "#94A3B8",
  },

  status: {
    marginTop: 12,
    fontWeight: "900",
    color: "#F59E0B",
  },

  statusGood: {
    color: "#22C55E",
  },

  statusDanger: {
    color: "#EF4444",
  },

  detailsButton: {
    backgroundColor: "#2563EB",
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },

  detailsText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900",
  },
});