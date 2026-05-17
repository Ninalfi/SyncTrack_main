import { useEffect, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";

import { router } from "expo-router";

const API_URL =
  "https://sheetdb.io/api/v1/sif1s2zbyslya";

interface Project {
  timestamp: string;

  studentId: string;

  studentName: string;

  teamMembers: string;

  projectTitle: string;

  courseName: string;

  weekNumber: string;

  progress: number;

  updateDetails: string;

  github: string;

  drive: string;

  figma: string;

  demo: string;
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
            item["Student ID"] || "",

          studentName:
            item["Student Name"] || "",

          teamMembers:
            item["Team Members"] || "",

          projectTitle:
            item["Project Title"] ||
            "Untitled Project",

          courseName:
            item["Course Name"] || "",

          weekNumber:
            item["Week Number"] || "",

          progress: parseInt(
            item[
              "Current Progress"
            ]?.replace("%", "") ||
              "0"
          ),

          updateDetails:
            item["Update Details"] ||
            "",

          github:
            item[
              "GitHub Repository "
            ] || "",

          drive:
            item[
              "Google Drive Link"
            ] || "",

          figma:
            item[
              "Figma Design Link"
            ] || "",

          demo:
            item[
              "Demo Video Link"
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
          Dashboard
        </Text>

        <Text
          style={styles.heroSubtitle}
        >
          Monitor project progress,
          teams, and recent
          activities.
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

      <View style={styles.dashboardRow}>
        {/* LEFT PANEL */}

        <View style={styles.leftPanel}>
          <View
            style={styles.panelHeader}
          >
            <Text
              style={styles.panelTitle}
            >
              Projects Overview
            </Text>
          </View>

          {projects.map(
            (project, index) => {
              const status =
                getStatus(
                  project.progress
                );

              return (
                <TouchableOpacity
                  key={index}
                  style={
                    styles.projectRow
                  }
                  onPress={() =>
                    router.push(
                      `/project/${index}`
                    )
                  }
                >
                  <View
                    style={
                      styles.projectInfo
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
                        styles.projectSub
                      }
                    >
                      {
                        project.courseName
                      }
                    </Text>

                    <Text
                      style={
                        styles.teamText
                      }
                    >
                      👥{" "}
                      {
                        project.teamMembers
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.progressContainer
                    }
                  >
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
                  </View>

                  <View
                    style={[
                      styles.statusBadge,

                      status ===
                        "On Track" &&
                        styles.badgeGood,

                      status ===
                        "Attention" &&
                        styles.badgeDanger,
                    ]}
                  >
                    <Text
                      style={
                        styles.badgeText
                      }
                    >
                      {status}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* RIGHT PANEL */}

        <View style={styles.rightPanel}>
          <View
            style={styles.panelHeader}
          >
            <Text
              style={styles.panelTitle}
            >
              Recent Activity
            </Text>
          </View>

          {projects.map(
            (project, index) => (
              <View
                key={index}
                style={
                  styles.activityCard
                }
              >
                <View
                  style={
                    styles.activityDot
                  }
                />

                <View
                  style={
                    styles.activityContent
                  }
                >
                  <Text
                    style={
                      styles.activityText
                    }
                  >
                    <Text
                      style={
                        styles.activityName
                      }
                    >
                      {
                        project.studentName
                      }
                    </Text>{" "}
                    updated{" "}
                    <Text
                      style={
                        styles.activityProject
                      }
                    >
                      {
                        project.projectTitle
                      }
                    </Text>
                  </Text>

                  <Text
                    style={
                      styles.activityUpdate
                    }
                  >
                    {
                      project.updateDetails
                    }
                  </Text>

                  <Text
                    style={
                      styles.activityTime
                    }
                  >
                    {
                      project.timestamp
                    }
                  </Text>

                  <View
                    style={
                      styles.linkRow
                    }
                  >
                    {project.github !==
                      "" && (
                      <TouchableOpacity
                        onPress={() =>
                          Linking.openURL(
                            project.github
                          )
                        }
                      >
                        <Text
                          style={
                            styles.linkText
                          }
                        >
                          GitHub
                        </Text>
                      </TouchableOpacity>
                    )}

                    {project.drive !==
                      "" && (
                      <TouchableOpacity
                        onPress={() =>
                          Linking.openURL(
                            project.drive
                          )
                        }
                      >
                        <Text
                          style={
                            styles.linkText
                          }
                        >
                          Drive
                        </Text>
                      </TouchableOpacity>
                    )}

                    {project.figma !==
                      "" && (
                      <TouchableOpacity
                        onPress={() =>
                          Linking.openURL(
                            project.figma
                          )
                        }
                      >
                        <Text
                          style={
                            styles.linkText
                          }
                        >
                          Figma
                        </Text>
                      </TouchableOpacity>
                    )}

                    {project.demo !==
                      "" && (
                      <TouchableOpacity
                        onPress={() =>
                          Linking.openURL(
                            project.demo
                          )
                        }
                      >
                        <Text
                          style={
                            styles.linkText
                          }
                        >
                          Demo
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )
          )}
        </View>
      </View>

      <View
        style={{ height: 80 }}
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

  dashboardRow: {
    flexDirection: "row",
    gap: 18,
    alignItems: "flex-start",
  },

  leftPanel: {
    flex: 1.2,
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  rightPanel: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  panelHeader: {
    marginBottom: 18,
  },

  panelTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
  },

  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    backgroundColor: "#0B1120",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  projectInfo: {
    flex: 1,
  },

  projectTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
  },

  projectSub: {
    color: "#94A3B8",
    marginTop: 4,
    fontSize: 12,
  },

  teamText: {
    color: "#CBD5E1",
    marginTop: 8,
    fontSize: 12,
  },

  progressContainer: {
    width: 140,
    marginHorizontal: 18,
  },

  progressPercent: {
    color: "#60A5FA",
    marginBottom: 6,
    fontWeight: "800",
  },

  progressBg: {
    height: 8,
    backgroundColor: "#1E293B",
    borderRadius: 20,
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

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#3F3F46",
  },

  badgeGood: {
    backgroundColor: "#14532D",
  },

  badgeDanger: {
    backgroundColor: "#7F1D1D",
  },

  badgeText: {
    color: "white",
    fontWeight: "800",
    fontSize: 12,
  },

  activityCard: {
    flexDirection: "row",
    marginBottom: 20,
  },

  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    marginTop: 8,
    marginRight: 12,
  },

  activityContent: {
    flex: 1,
  },

  activityText: {
    color: "#E2E8F0",
    lineHeight: 22,
  },

  activityName: {
    color: "white",
    fontWeight: "bold",
  },

  activityProject: {
    color: "#60A5FA",
    fontWeight: "bold",
  },

  activityUpdate: {
    color: "#CBD5E1",
    marginTop: 6,
  },

  activityTime: {
    color: "#64748B",
    marginTop: 6,
    fontSize: 12,
  },

  linkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },

  linkText: {
    color: "#60A5FA",
    fontWeight: "700",
  },
});