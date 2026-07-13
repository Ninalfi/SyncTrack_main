import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, DateData } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import { useAuth } from "../../context/AuthContext";
import {
  fetchProjects,
  getProjectStatus,
  Project,
} from "../../data/projects";

type ProjectStatus =
  | "Completed"
  | "On Track"
  | "Review"
  | "Attention";

type ProjectUpdate = {
  id?: string;
  timestamp?: string;
  weekNumber?: string;
  updateDetails?: string;
  progress?: number;
  studentName?: string;
};

type CalendarProject = Project & {
  status: ProjectStatus;
  updates?: ProjectUpdate[];
  professorEmail?: string;
  studentEmail?: string;
};

type CalendarItemType =
  | "deadline"
  | "update"
  | "class"
  | "meeting"
  | "task";

type CalendarItem = {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  type: CalendarItemType;
  time?: string;
  projectId?: string;
  location?: string;
  professor?: string;
  studentName?: string;
  progress?: number;
  status?: string;
  completed?: boolean;
};

type PersonalTask = {
  id: string;
  date: string;
  title: string;
  notes: string;
  time: string;
  completed: boolean;
};

type ClassSchedule = {
  id: string;
  title: string;
  room: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  color: string;
};

const COLORS = {
  background: "#ECEBF7",
  card: "#FFFFFF",
  text: "#202027",
  muted: "#858596",
  faint: "#B7B7C5",
  border: "#EBEBF3",
  blue: "#1976D2",
  blueSoft: "#E8F2FF",
  green: "#7FC642",
  orange: "#FF6534",
  purple: "#8B5CF6",
  cyan: "#29B6D8",
  red: "#EF5350",
};

const CLASS_SCHEDULE: ClassSchedule[] = [
  {
    id: "class-application-design",
    title: "Application Design and Development",
    room: "Room 301",
    startTime: "9:30 AM",
    endTime: "11:00 AM",
    dayOfWeek: 1,
    color: COLORS.orange,
  },
  {
    id: "class-database",
    title: "Database Systems",
    room: "Computer Lab 2",
    startTime: "11:00 AM",
    endTime: "12:30 PM",
    dayOfWeek: 3,
    color: COLORS.green,
  },
  {
    id: "class-software-engineering",
    title: "Software Engineering",
    room: "Room 208",
    startTime: "1:00 PM",
    endTime: "2:30 PM",
    dayOfWeek: 4,
    color: COLORS.blue,
  },
];

function formatDateObject(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getToday(): string {
  return formatDateObject(new Date());
}

function parseLocalDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00`);
}

function isValidDate(dateString?: string): boolean {
  if (!dateString) return false;
  const parsedDate = parseLocalDate(dateString);
  return !Number.isNaN(parsedDate.getTime());
}

function formatSelectedDate(dateString: string): string {
  if (!isValidDate(dateString)) return dateString;

  return parseLocalDate(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonthYear(dateString: string): string {
  return parseLocalDate(dateString).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function normalize(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

function getInitials(name?: string): string {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getItemColor(type: CalendarItemType): string {
  switch (type) {
    case "deadline":
      return COLORS.cyan;
    case "update":
      return COLORS.green;
    case "class":
      return COLORS.orange;
    case "meeting":
      return COLORS.purple;
    case "task":
      return COLORS.blue;
    default:
      return COLORS.blue;
  }
}

function convertTimestampToDate(timestamp?: string): string | null {
  if (!timestamp) return null;

  const trimmedTimestamp = timestamp.trim();
  const isoMatch = trimmedTimestamp.match(/^\d{4}-\d{2}-\d{2}/);

  if (isoMatch) return isoMatch[0];

  const datePart = trimmedTimestamp.split(/[,\s]+/)[0].trim();
  const parts = datePart.split(/[/-]/);

  if (parts.length === 3) {
    const first = Number(parts[0]);
    const second = Number(parts[1]);
    const third = Number(parts[2]);

    let year: number;
    let month: number;
    let day: number;

    if (parts[0].length === 4) {
      year = first;
      month = second;
      day = third;
    } else {
      year = third;

      if (first > 12) {
        day = first;
        month = second;
      } else {
        month = first;
        day = second;
      }
    }

    const converted = new Date(year, month - 1, day);

    if (!Number.isNaN(converted.getTime())) {
      return formatDateObject(converted);
    }
  }

  const parsedDate = new Date(trimmedTimestamp);

  if (Number.isNaN(parsedDate.getTime())) return null;

  return formatDateObject(parsedDate);
}

function createMonthlyClassItems(
  monthDateString: string
): CalendarItem[] {
  const monthDate = parseLocalDate(monthDateString);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const result: CalendarItem[] = [];
  const cursor = new Date(year, month, 1);

  while (cursor.getMonth() === month) {
    const dateString = formatDateObject(cursor);
    const dayOfWeek = cursor.getDay();

    CLASS_SCHEDULE.filter(
      (classItem) => classItem.dayOfWeek === dayOfWeek
    ).forEach((classItem) => {
      result.push({
        id: `${classItem.id}-${dateString}`,
        date: dateString,
        title: classItem.title,
        subtitle: classItem.room,
        location: classItem.room,
        type: "class",
        time: `${classItem.startTime} – ${classItem.endTime}`,
      });
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

export default function CalendarScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  const [projects, setProjects] = useState<Project[]>([]);
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([]);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [visibleMonth, setVisibleMonth] = useState(getToday());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskNotes, setTaskNotes] = useState("");

  const isWideScreen = width >= 700;
  const isProfessor = user?.role === "professor";

  const userName =
    user?.name ||
    user?.email?.split("@")[0] ||
    (isProfessor ? "Professor" : "Student");

  const taskStorageKey = `synctrack-calendar-tasks-${
    user?.uid || user?.email || "guest"
  }`;

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadPersonalTasks();
  }, [taskStorageKey]);

  async function loadProjects() {
    try {
      const response = await fetchProjects();
      setProjects(Array.isArray(response) ? response : []);
    } catch (error) {
      console.log("Calendar project loading error:", error);
      setProjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadPersonalTasks() {
    try {
      const savedTasks = await AsyncStorage.getItem(taskStorageKey);

      if (!savedTasks) {
        setPersonalTasks([]);
        return;
      }

      const parsedTasks: PersonalTask[] = JSON.parse(savedTasks);
      setPersonalTasks(Array.isArray(parsedTasks) ? parsedTasks : []);
    } catch (error) {
      console.log("Task loading error:", error);
      setPersonalTasks([]);
    }
  }

  async function savePersonalTasks(tasks: PersonalTask[]) {
    try {
      setPersonalTasks(tasks);
      await AsyncStorage.setItem(
        taskStorageKey,
        JSON.stringify(tasks)
      );
    } catch (error) {
      console.log("Task saving error:", error);
      Alert.alert("Save failed", "The task could not be saved.");
    }
  }

  async function addPersonalTask() {
    const cleanTitle = taskTitle.trim();

    if (!cleanTitle) {
      Alert.alert(
        "Task title required",
        "Please enter a title for the task."
      );
      return;
    }

    const newTask: PersonalTask = {
      id: `task-${Date.now()}`,
      date: selectedDate,
      title: cleanTitle,
      notes: taskNotes.trim(),
      time: taskTime.trim(),
      completed: false,
    };

    await savePersonalTasks([...personalTasks, newTask]);

    setTaskTitle("");
    setTaskTime("");
    setTaskNotes("");
    setTaskModalVisible(false);
  }

  async function togglePersonalTask(taskId: string) {
    const updatedTasks = personalTasks.map((task) =>
      task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
    );

    await savePersonalTasks(updatedTasks);
  }

  function confirmDeleteTask(taskId: string) {
    Alert.alert(
      "Delete task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedTasks = personalTasks.filter(
              (task) => task.id !== taskId
            );
            await savePersonalTasks(updatedTasks);
          },
        },
      ]
    );
  }

  const enhancedProjects: CalendarProject[] = useMemo(() => {
    return projects.map((project) => ({
      ...project,
      status: getProjectStatus(project.progress),
    }));
  }, [projects]);

  const visibleProjects = useMemo(() => {
    const currentName = normalize(user?.name);
    const currentEmail = normalize(user?.email);

    if (!currentName && !currentEmail) {
      return enhancedProjects;
    }

    if (isProfessor) {
      return enhancedProjects.filter((project) => {
        const professorName = normalize(project.professor);
        const professorEmail = normalize(project.professorEmail);

        return (
          professorName === currentName ||
          (professorEmail !== "" &&
            professorEmail === currentEmail)
        );
      });
    }

    const studentProjects = enhancedProjects.filter((project) => {
      const studentName = normalize(project.studentName);
      const studentEmail = normalize(project.studentEmail);

      return (
        studentName === currentName ||
        (studentEmail !== "" &&
          studentEmail === currentEmail)
      );
    });

    return studentProjects.length > 0
      ? studentProjects
      : enhancedProjects;
  }, [
    enhancedProjects,
    isProfessor,
    user?.email,
    user?.name,
  ]);

  const projectCalendarItems = useMemo(() => {
    return visibleProjects.flatMap((project) => {
      const items: CalendarItem[] = [];

      if (isValidDate(project.dueDate)) {
        items.push({
          id: `deadline-${project.id}`,
          date: project.dueDate,
          title: project.title,
          subtitle: `${project.subject} project deadline`,
          type: "deadline",
          projectId: project.id,
          professor: project.professor,
          studentName: project.studentName,
          progress: project.progress,
          status: project.status,
        });
      }

      if (
        Array.isArray(project.updates) &&
        project.updates.length > 0
      ) {
        project.updates.forEach((update, index) => {
          const updateDate = convertTimestampToDate(
            update.timestamp
          );

          if (!updateDate) return;

          items.push({
            id:
              update.id ||
              `update-${project.id}-${index}`,
            date: updateDate,
            title: `${project.title} update`,
            subtitle:
              update.updateDetails ||
              `Week ${
                update.weekNumber || index + 1
              } project update`,
            type: "update",
            projectId: project.id,
            professor: project.professor,
            studentName:
              update.studentName || project.studentName,
            progress:
              update.progress ?? project.progress,
            status: "Submitted",
          });
        });
      } else {
        const updateDate = convertTimestampToDate(
          project.timestamp
        );

        if (updateDate) {
          items.push({
            id: `update-${project.id}`,
            date: updateDate,
            title: `${project.title} update`,
            subtitle:
              project.updateDetails ||
              `Week ${
                project.weekNumber || ""
              } project update`,
            type: "update",
            projectId: project.id,
            professor: project.professor,
            studentName: project.studentName,
            progress: project.progress,
            status: "Submitted",
          });
        }
      }

      return items;
    });
  }, [visibleProjects]);

  const monthlyClassItems = useMemo(() => {
    return createMonthlyClassItems(visibleMonth);
  }, [visibleMonth]);

  const personalTaskItems: CalendarItem[] = useMemo(() => {
    return personalTasks.map((task) => ({
      id: task.id,
      date: task.date,
      title: task.title,
      subtitle: task.notes || "Personal task",
      type: "task",
      time: task.time || undefined,
      completed: task.completed,
      status: task.completed ? "Completed" : "Pending",
    }));
  }, [personalTasks]);

  const allCalendarItems = useMemo(() => {
    return [
      ...projectCalendarItems,
      ...monthlyClassItems,
      ...personalTaskItems,
    ];
  }, [
    monthlyClassItems,
    personalTaskItems,
    projectCalendarItems,
  ]);

  const selectedEvents = useMemo(() => {
    return projectCalendarItems.filter(
      (item) => item.date === selectedDate
    );
  }, [projectCalendarItems, selectedDate]);

  const selectedClasses = useMemo(() => {
    return monthlyClassItems.filter(
      (item) => item.date === selectedDate
    );
  }, [monthlyClassItems, selectedDate]);

  const selectedTasks = useMemo(() => {
    return personalTaskItems.filter(
      (item) => item.date === selectedDate
    );
  }, [personalTaskItems, selectedDate]);

  const selectedAgendaItems = useMemo(() => {
    return [
      ...selectedEvents,
      ...selectedClasses,
      ...selectedTasks,
    ].sort((first, second) => {
      const firstTime = first.time || "23:59";
      const secondTime = second.time || "23:59";
      return firstTime.localeCompare(secondTime);
    });
  }, [selectedClasses, selectedEvents, selectedTasks]);

  const deadlineCount = selectedEvents.filter(
    (item) => item.type === "deadline"
  ).length;

  const updateCount = selectedEvents.filter(
    (item) => item.type === "update"
  ).length;

  const classCount = selectedClasses.length;
  const taskCount = selectedTasks.length;

  const markedDates = useMemo(() => {
    const result: Record<string, any> = {};

    allCalendarItems.forEach((item) => {
      if (!result[item.date]) {
        result[item.date] = { dots: [] };
      }

      const color = getItemColor(item.type);
      const key = `${item.type}-${color}`;

      const alreadyAdded = result[item.date].dots.some(
        (dot: { key: string }) => dot.key === key
      );

      if (!alreadyAdded) {
        result[item.date].dots.push({
          key,
          color,
          selectedDotColor: "#FFFFFF",
        });
      }
    });

    result[selectedDate] = {
      ...(result[selectedDate] || {}),
      selected: true,
      selectedColor: COLORS.blue,
      selectedTextColor: "#FFFFFF",
      dots: result[selectedDate]?.dots || [],
    };

    return result;
  }, [allCalendarItems, selectedDate]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.blue}
        />

        <Text style={styles.loadingText}>
          Loading your calendar...
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          isWideScreen && styles.wideContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={COLORS.blue}
            colors={[COLORS.blue]}
            onRefresh={() => {
              setRefreshing(true);
              loadProjects();
            }}
          />
        }
      >
        <View style={styles.pageHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>
              Integrated Calendar.
            </Text>

            <Text style={styles.pageTitle}>
              Stay Organized.
            </Text>

            <Text style={styles.pageSubtitle}>
              Keep projects, updates, classes and personal tasks
              together in one organized schedule.
            </Text>
          </View>

          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>
              {getInitials(userName)}
            </Text>
          </View>
        </View>

        <View style={styles.phoneCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedDate(getToday());
                setVisibleMonth(getToday());
              }}
            >
              <Ionicons
                name="today-outline"
                size={24}
                color={COLORS.text}
              />
            </TouchableOpacity>

            <Text style={styles.monthText}>
              {formatMonthYear(visibleMonth)}
            </Text>

            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={() => setTaskModalVisible(true)}
            >
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={COLORS.blue}
              />
            </TouchableOpacity>
          </View>

          <Calendar
            current={visibleMonth}
            markingType="multi-dot"
            markedDates={markedDates}
            enableSwipeMonths
            hideArrows
            hideExtraDays={false}
            firstDay={0}
            onDayPress={(day: DateData) => {
              setSelectedDate(day.dateString);
            }}
            onMonthChange={(month: DateData) => {
              setVisibleMonth(month.dateString);
            }}
            style={styles.calendar}
            theme={{
              backgroundColor: COLORS.card,
              calendarBackground: COLORS.card,
              textSectionTitleColor: COLORS.muted,
              textSectionTitleDisabledColor: COLORS.faint,
              selectedDayBackgroundColor: COLORS.blue,
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: COLORS.blue,
              todayBackgroundColor: COLORS.blueSoft,
              dayTextColor: COLORS.text,
              textDisabledColor: "#D4D4DF",
              dotColor: COLORS.cyan,
              selectedDotColor: "#FFFFFF",
              arrowColor: COLORS.blue,
              monthTextColor: COLORS.text,
              textDayFontSize: 15,
              textMonthFontSize: 20,
              textDayHeaderFontSize: 12,
              textDayFontWeight: "600",
              textMonthFontWeight: "800",
              textDayHeaderFontWeight: "700",
            }}
          />

          <View style={styles.divider} />

          <View style={styles.legendCard}>
            <LegendItem color={COLORS.cyan} label="Deadline" />
            <LegendItem color={COLORS.green} label="Update" />
            <LegendItem color={COLORS.orange} label="Class" />
            <LegendItem color={COLORS.blue} label="Task" />
          </View>

          <View style={styles.agendaHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.agendaEyebrow}>
                DAILY AGENDA
              </Text>

              <Text style={styles.agendaDate}>
                {formatSelectedDate(selectedDate)}
              </Text>
            </View>

            <View style={styles.agendaActions}>
              <TouchableOpacity
                style={styles.addTaskButton}
                onPress={() => setTaskModalVisible(true)}
              >
                <Ionicons
                  name="add-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.addTaskButtonText}>
                  Add task
                </Text>
              </TouchableOpacity>

              <View style={styles.totalBadge}>
                <Text style={styles.totalBadgeNumber}>
                  {selectedAgendaItems.length}
                </Text>

                <Text style={styles.totalBadgeLabel}>
                  {selectedAgendaItems.length === 1
                    ? "item"
                    : "items"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.agendaStats}>
            <AgendaStat
              icon="flag-outline"
              label="Deadlines"
              value={deadlineCount}
              color={COLORS.cyan}
            />

            <AgendaStat
              icon="checkmark-circle-outline"
              label="Updates"
              value={updateCount}
              color={COLORS.green}
            />

            <AgendaStat
              icon="school-outline"
              label="Classes"
              value={classCount}
              color={COLORS.orange}
            />

            <AgendaStat
              icon="checkbox-outline"
              label="Tasks"
              value={taskCount}
              color={COLORS.blue}
            />
          </View>

          {selectedAgendaItems.length === 0 ? (
            <View style={styles.emptyAgenda}>
              <View style={styles.emptyAgendaIcon}>
                <Ionicons
                  name="calendar-clear-outline"
                  size={31}
                  color={COLORS.faint}
                />
              </View>

              <Text style={styles.emptyAgendaTitle}>
                Your day is clear
              </Text>

              <Text style={styles.emptyAgendaText}>
                There are no classes, project updates, deadlines
                or personal tasks scheduled for this date.
              </Text>

              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={() => setTaskModalVisible(true)}
              >
                <Ionicons
                  name="add-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.emptyAddButtonText}>
                  Add your first task
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.timelineCard}>
              {selectedAgendaItems.map((item, index) => (
                <AgendaItem
                  key={item.id}
                  item={item}
                  isLast={
                    index === selectedAgendaItems.length - 1
                  }
                  onToggleTask={togglePersonalTask}
                  onDeleteTask={confirmDeleteTask}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color={COLORS.blue}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>
              Calendar overview
            </Text>

            <Text style={styles.summaryText}>
              {visibleProjects.length} project
              {visibleProjects.length === 1 ? "" : "s"},{" "}
              {projectCalendarItems.length} project event
              {projectCalendarItems.length === 1 ? "" : "s"},{" "}
              {monthlyClassItems.length} recurring class
              {monthlyClassItems.length === 1 ? "" : "es"} and{" "}
              {personalTasks.length} personal task
              {personalTasks.length === 1 ? "" : "s"} are available.
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <Modal
        visible={taskModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.taskModal}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalEyebrow}>
                  NEW TASK
                </Text>

                <Text style={styles.modalTitle}>
                  {formatSelectedDate(selectedDate)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setTaskModalVisible(false)}
              >
                <Ionicons
                  name="close-outline"
                  size={24}
                  color={COLORS.text}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Task title</Text>

            <TextInput
              style={styles.taskInput}
              placeholder="Example: Complete project report"
              placeholderTextColor={COLORS.faint}
              value={taskTitle}
              onChangeText={setTaskTitle}
              autoFocus
            />

            <Text style={styles.inputLabel}>Time</Text>

            <TextInput
              style={styles.taskInput}
              placeholder="Example: 2:30 PM"
              placeholderTextColor={COLORS.faint}
              value={taskTime}
              onChangeText={setTaskTime}
            />

            <Text style={styles.inputLabel}>Notes</Text>

            <TextInput
              style={[styles.taskInput, styles.notesInput]}
              placeholder="Add optional notes..."
              placeholderTextColor={COLORS.faint}
              value={taskNotes}
              onChangeText={setTaskNotes}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.saveTaskButton}
              onPress={addPersonalTask}
            >
              <Ionicons
                name="checkmark-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text style={styles.saveTaskButtonText}>
                Add task
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function AgendaStat({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.agendaStat}>
      <View
        style={[
          styles.agendaStatIcon,
          { backgroundColor: `${color}18` },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={color}
        />
      </View>

      <Text style={styles.agendaStatValue}>{value}</Text>
      <Text style={styles.agendaStatLabel}>{label}</Text>
    </View>
  );
}

function AgendaItem({
  item,
  isLast,
  onToggleTask,
  onDeleteTask,
}: {
  item: CalendarItem;
  isLast: boolean;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const color = getItemColor(item.type);

  const typeLabel =
    item.type === "deadline"
      ? "Project deadline"
      : item.type === "update"
      ? "Progress update"
      : item.type === "meeting"
      ? "Meeting"
      : item.type === "task"
      ? "Personal task"
      : "Class";

  return (
    <TouchableOpacity
      style={[
        styles.timelineItem,
        isLast && styles.timelineItemLast,
      ]}
      activeOpacity={item.projectId ? 0.75 : 1}
      onPress={() => {
        if (item.projectId) {
          router.push(`/project/${item.projectId}`);
        }
      }}
    >
      {item.type === "task" ? (
        <TouchableOpacity
          style={[
            styles.taskCheckbox,
            item.completed && styles.taskCheckboxCompleted,
          ]}
          onPress={() => onToggleTask(item.id)}
        >
          {item.completed && (
            <Ionicons
              name="checkmark"
              size={15}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.timelineLeft}>
          <View
            style={[
              styles.timelineDot,
              { backgroundColor: color },
            ]}
          />

          {!isLast && <View style={styles.timelineLine} />}
        </View>
      )}

      <View style={styles.timelineContent}>
        <View style={styles.timelineTop}>
          <Text
            style={[
              styles.timelineType,
              { color },
            ]}
          >
            {typeLabel}
          </Text>

          {item.time && (
            <Text style={styles.timelineTime}>
              {item.time}
            </Text>
          )}
        </View>

        <Text
          style={[
            styles.timelineTitle,
            item.completed && styles.completedTaskTitle,
          ]}
        >
          {item.title}
        </Text>

        <Text style={styles.timelineSubtitle}>
          {item.subtitle}
        </Text>

        <View style={styles.timelineMetaRow}>
          {item.location && (
            <MetaPill
              icon="location-outline"
              text={item.location}
            />
          )}

          {item.professor && (
            <MetaPill
              icon="person-outline"
              text={item.professor}
            />
          )}

          {item.studentName && (
            <MetaPill
              icon="school-outline"
              text={item.studentName}
            />
          )}

          {typeof item.progress === "number" && (
            <MetaPill
              icon="analytics-outline"
              text={`${item.progress}%`}
            />
          )}

          {item.type === "task" && (
            <MetaPill
              icon={
                item.completed
                  ? "checkmark-circle-outline"
                  : "time-outline"
              }
              text={item.completed ? "Completed" : "Pending"}
            />
          )}
        </View>
      </View>

      {item.type === "task" ? (
        <TouchableOpacity
          style={styles.deleteTaskButton}
          onPress={() => onDeleteTask(item.id)}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={COLORS.red}
          />
        </TouchableOpacity>
      ) : item.projectId ? (
        <View style={styles.openButton}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={COLORS.blue}
          />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

function MetaPill({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.metaPill}>
      <Ionicons
        name={icon}
        size={13}
        color="#74748A"
      />

      <Text
        style={styles.metaText}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
}

function LegendItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          { backgroundColor: color },
        ]}
      />

      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 28,
  },
  wideContent: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.text,
    marginTop: 14,
    fontSize: 15,
    fontWeight: "700",
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 35,
    lineHeight: 43,
    fontWeight: "900",
    letterSpacing: -1.2,
  },
  pageSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 11,
    maxWidth: 340,
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  profileText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
  phoneCard: {
    backgroundColor: COLORS.card,
    borderRadius: 34,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 22,
    shadowColor: "#73728A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingBottom: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  monthText: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "800",
  },
  calendar: {
    borderRadius: 24,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
    marginTop: 8,
  },
  legendCard: {
    marginTop: 16,
    backgroundColor: "#F8F8FC",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  agendaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 9,
    marginTop: 20,
    marginBottom: 16,
    gap: 12,
  },
  agendaEyebrow: {
    color: COLORS.blue,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 5,
  },
  agendaDate: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
  },
  agendaActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addTaskButton: {
    backgroundColor: COLORS.blue,
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addTaskButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  totalBadge: {
    minWidth: 56,
    backgroundColor: COLORS.blueSoft,
    borderRadius: 18,
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  totalBadgeNumber: {
    color: COLORS.blue,
    fontSize: 17,
    fontWeight: "900",
  },
  totalBadgeLabel: {
    color: "#5D7DA4",
    fontSize: 9,
    fontWeight: "800",
  },
  agendaStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  agendaStat: {
    width: "48%",
    backgroundColor: "#F8F8FC",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 12,
  },
  agendaStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 9,
  },
  agendaStatValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
  },
  agendaStatLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  timelineCard: {
    marginHorizontal: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    paddingHorizontal: 15,
    marginBottom: 6,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F5",
  },
  timelineItemLast: {
    borderBottomWidth: 0,
  },
  timelineLeft: {
    width: 24,
    alignItems: "center",
    marginRight: 10,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 5,
    zIndex: 2,
  },
  timelineLine: {
    position: "absolute",
    top: 17,
    bottom: -18,
    width: 2,
    backgroundColor: "#E5E7EB",
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginTop: 2,
  },
  taskCheckboxCompleted: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  timelineType: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  timelineTime: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  timelineTitle: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
  },
  completedTaskTitle: {
    color: COLORS.muted,
    textDecorationLine: "line-through",
  },
  timelineSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  timelineMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 10,
  },
  metaPill: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F3F8",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  metaText: {
    color: "#74748A",
    fontSize: 10,
    fontWeight: "700",
    maxWidth: 150,
  },
  openButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.blueSoft,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginLeft: 8,
  },
  deleteTaskButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#FEECEC",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginLeft: 8,
  },
  emptyAgenda: {
    marginHorizontal: 8,
    backgroundColor: "#F8F8FC",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    marginBottom: 6,
  },
  emptyAgendaIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyAgendaTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },
  emptyAgendaText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 280,
  },
  emptyAddButton: {
    marginTop: 16,
    backgroundColor: COLORS.blue,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  emptyAddButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  summaryCard: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 22,
    padding: 17,
  },
  summaryIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: COLORS.blueSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  summaryText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(20,20,30,0.48)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  taskModal: {
    backgroundColor: COLORS.card,
    borderRadius: 28,
    padding: 22,
    shadowColor: "#444456",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  modalEyebrow: {
    color: COLORS.blue,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 5,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
  },
  modalClose: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.blueSoft,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
  },
  taskInput: {
    backgroundColor: "#F7F7FC",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 16,
  },
  notesInput: {
    minHeight: 90,
  },
  saveTaskButton: {
    backgroundColor: COLORS.blue,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },
  saveTaskButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});