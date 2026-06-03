import {
  useLocalSearchParams,
  router,
} from "expo-router";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import {
  getProjectById,
} from "../../data/projects";

export default function ProjectDetails() {
  const { id } =
    useLocalSearchParams();

  const [project, setProject] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadProject();
  }, []);

  async function loadProject() {
    try {
      const data =
        await getProjectById(
          String(id)
        );

      setProject(data);
    } catch (error) {
      console.log(error);
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
          Loading Project...
        </Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View
        style={
          styles.loaderContainer
        }
      >
        <Text
          style={{
            color: "white",
          }}
        >
          Project not found
        </Text>
      </View>
    );
  }

  const status = getStatus(
    project.progress
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
    >
      <TouchableOpacity
        onPress={() =>
          router.back()
        }
      >
        <Text style={styles.back}>
          ⬅️ Back to Dashboard
        </Text>
      </TouchableOpacity>

      <View style={styles.heroCard}>
        <Text style={styles.category}>
          {project.category}
        </Text>

        <Text style={styles.title}>
          {project.title}
        </Text>

        <Text
          style={
            styles.description
          }
        >
          {
            project.description
          }
        </Text>

        <View
          style={
            styles.progressHeader
          }
        >
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

          <Text
            style={
              styles.progressText
            }
          >
            {project.progress}%
            Complete
          </Text>
        </View>

        <View
          style={
            styles.progressBackground
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

        <View style={styles.grid}>
          <InfoCard
            label="Due Date"
            value={
              project.dueDate
            }
          />

          <InfoCard
            label="Professor"
            value={
              project.professor
            }
          />

          <InfoCard
            label="Students"
            value={String(
              project.students
            )}
          />

          <InfoCard
            label="Priority"
            value={
              project.priority
            }
          />

          <InfoCard
            label="Milestones"
            value={`${project.completedMilestones}/${project.totalMilestones}`}
          />

          <InfoCard
            label="Week"
            value={
              project.weekNumber
            }
          />
        </View>
      </View>

      <View
        style={styles.updatesCard}
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          Latest Update
        </Text>

        <View
          style={styles.updateBox}
        >
          <Text
            style={
              styles.updateStudent
            }
          >
            {
              project.studentName
            }
          </Text>

          <Text
            style={
              styles.updateDate
            }
          >
            {
              project.timestamp
            }
          </Text>

          <Text
            style={
              styles.updateText
            }
          >
            {
              project.updateDetails
            }
          </Text>
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Tasks
        </Text>

        {project.tasks.map(
          (task: any) => (
            <View
              key={task.id}
              style={
                styles.taskRow
              }
            >
              <Text
                style={
                  styles.taskIcon
                }
              >
                {task.completed
                  ? "✅"
                  : "⬜"}
              </Text>

              <Text
                style={
                  styles.taskText
                }
              >
                {task.title}
              </Text>
            </View>
          )
        )}
      </View>

      <View
        style={{ height: 100 }}
      />
    </ScrollView>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoCard}>
      <Text
        style={styles.infoLabel}
      >
        {label}
      </Text>

      <Text
        style={styles.infoValue}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712",
    padding: 20,
  },

  loaderContainer: {
    flex: 1,
    backgroundColor: "#030712",
    justifyContent: "center",
    alignItems: "center",
  },

  back: {
    color: "#7EA6FF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },

  heroCard: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  category: {
    color: "#7EA6FF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  title: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 16,
  },

  description: {
    color: "#CBD5E1",
    lineHeight: 25,
    marginBottom: 24,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: 12,
  },

  status: {
    color: "#FACC15",
    fontWeight: "bold",
    fontSize: 18,
  },

  statusGood: {
    color: "#4ADE80",
  },

  statusDanger: {
    color: "#EF4444",
  },

  progressText: {
    color: "white",
    fontWeight: "bold",
  },

  progressBackground: {
    height: 14,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 28,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#FACC15",
  },

  progressGood: {
    backgroundColor: "#4ADE80",
  },

  progressDanger: {
    backgroundColor: "#EF4444",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent:
      "space-between",
    gap: 14,
  },

  infoCard: {
    width: "48%",
    backgroundColor: "#020617",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  infoLabel: {
    color: "#94A3B8",
    marginBottom: 8,
  },

  infoValue: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },

  updatesCard: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  sectionTitle: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 18,
  },

  updateBox: {
    backgroundColor: "#020617",
    borderRadius: 18,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  updateStudent: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },

  updateDate: {
    color: "#94A3B8",
    marginTop: 6,
    marginBottom: 12,
  },

  updateText: {
    color: "#CBD5E1",
    lineHeight: 24,
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  taskIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  taskText: {
    color: "white",
    fontSize: 16,
  },
});