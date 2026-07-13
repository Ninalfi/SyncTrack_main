import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, DateData } from "react-native-calendars";
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

type ProjectWithStatus = Project & {
  status: ProjectStatus;
  professorEmail?: string;
  studentEmail?: string;
};

type CalendarItemType =
  | "deadline"
  | "update"
  | "class"
  | "meeting";

type CalendarItem = {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  type: CalendarItemType;
  time?: string;
  projectId?: string;
};

type ClassSchedule = {
  id: string;
  title: string;
  subtitle: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  color: string;
};

/*
  0 = Sunday
  1 = Monday
  2 = Tuesday
  3 = Wednesday
  4 = Thursday
  5 = Friday
  6 = Saturday

  You can later move this list to Google Sheets, Firestore,
  MongoDB, or another API.
*/
const CLASS_SCHEDULE: ClassSchedule[] = [
  {
    id: "class-1",
    title: "Application Design and Development",
    subtitle: "Room 301",
    startTime: "9:30 AM",
    endTime: "11:00 AM",
    dayOfWeek: 1,
    color: "#FF642E",
  },
  {
    id: "class-2",
    title: "Database Systems",
    subtitle: "Computer Lab 2",
    startTime: "11:00 AM",
    endTime: "12:30 PM",
    dayOfWeek: 3,
    color: "#80C842",
  },
  {
    id: "class-3",
    title: "Software Engineering",
    subtitle: "Room 208",
    startTime: "1:00 PM",
    endTime: "2:30 PM",
    dayOfWeek: 4,
    color: "#1E88E5",
  },
];

const COLORS = {
  background: "#EDECF8",
  card: "#FFFFFF",
  text: "#222227",
  muted: "#898997",
  faint: "#B7B7C4",
  border: "#ECECF3",
  blue: "#1976D2",
  blueLight: "#E7F1FF",
  green: "#80C842",
  orange: "#FF642E",
  purple: "#8B5CF6",
  cyan: "#29B6D8",
};

function getToday(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00`);
}

function isValidDate(dateString?: string): boolean {
  if (!dateString) return false;

  const date = parseLocalDate(dateString);

  return !Number.isNaN(date.getTime());
}

function formatSelectedDate(dateString: string): string {
  if (!isValidDate(dateString)) {
    return dateString;
  }

  return parseLocalDate(dateString).toLocaleDateString("en-US", {
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

function getItemColor(type: CalendarItemType): string {
  switch (type) {
    case "deadline":
      return COLORS.cyan;

    case "update":
      return COLORS.green;

    case "meeting":
      return COLORS.purple;

    case "class":
      return COLORS.orange;

    default:
      return COLORS.blue;
  }
}

function getItemIcon(
  type: CalendarItemType
): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "deadline":
      return "flag-outline";

    case "update":
      return "checkmark-circle-outline";

    case "meeting":
      return "people-outline";

    case "class":
      return "school-outline";

    default:
      return "calendar-outline";
  }
}

function buildInitials(name?: string): string {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CalendarScreen() {
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [visibleMonth, setVisibleMonth] = useState(getToday());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isProfessor = user?.role === "professor";

  async function loadProjects() {
    try {
      const data = await fetchProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Calendar fetch error:", error);
      setProjects([]);
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

  /*
    Role-aware filtering:

    Professor:
    - sees projects matching their name or professorEmail.

    Student:
    - sees projects matching their name or studentEmail.
    - falls back to all projects when the sheet does not contain
      student identity fields yet.
  */
  const visibleProjects = useMemo(() => {
    const userName = normalize(user?.name);
    const userEmail = normalize(user?.email);

    if (!userName && !userEmail) {
      return enhancedProjects;
    }

    if (isProfessor) {
      const professorProjects = enhancedProjects.filter((project) => {
        const professorName = normalize(project.professor);
        const professorEmail = normalize(project.professorEmail);

        return (
          professorName === userName ||
          (professorEmail !== "" && professorEmail === userEmail)
        );
      });

      return professorProjects;
    }

    const studentProjects = enhancedProjects.filter((project) => {
      const studentName = normalize(project.studentName);
      const studentEmail = normalize(project.studentEmail);

      return (
        studentName === userName ||
        (studentEmail !== "" && studentEmail === userEmail)
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

  const projectItems: CalendarItem[] = useMemo(() => {
    return visibleProjects.flatMap((project) => {
      const items: CalendarItem[] = [];

      if (isValidDate(project.dueDate)) {
        items.push({
          id: `deadline-${project.id}`,
          date: project.dueDate,
          title: project.title,
          subtitle: `${project.subject} • ${project.progress}% complete`,
          type: "deadline",
          projectId: project.id,
        });
      }

      /*
        If your grouped project contains updates[],
        every submitted update is added to the calendar.
      */
      if (Array.isArray((project as any).updates)) {
        (project as any).updates.forEach(
          (update: any, index: number) => {
            const updateDate = convertTimestampToDate(
              update.timestamp
            );

            if (updateDate) {
              items.push({
                id: `update-${project.id}-${index}`,
                date: updateDate,
                title: `${project.title} update`,
                subtitle:
                  update.updateDetails ||
                  `Week ${update.weekNumber || index + 1} update`,
                type: "update",
                projectId: project.id,
              });
            }
          }
        );
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
              `Week ${project.weekNumber || ""} update`,
            type: "update",
            projectId: project.id,
          });
        }
      }

      return items;
    });
  }, [visibleProjects]);

  const classItems: CalendarItem[] = useMemo(() => {
    const selected = parseLocalDate(selectedDate);
    const selectedDay = selected.getDay();

    return CLASS_SCHEDULE.filter(
      (classItem) => classItem.dayOfWeek === selectedDay
    ).map((classItem) => ({
      id: `${classItem.id}-${selectedDate}`,
      date: selectedDate,
      title: classItem.title,
      subtitle: classItem.subtitle,
      type: "class",
      time: `${classItem.startTime} • ${classItem.endTime}`,
    }));
  }, [selectedDate]);

  /*
    Add all recurring class markers for the visible month.
  */
  const monthlyClassItems: CalendarItem[] = useMemo(() => {
    const monthDate = parseLocalDate(visibleMonth);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const result: CalendarItem[] = [];

    const current = new Date(year, month, 1);

    while (current.getMonth() === month) {
      const dateString = formatDateObject(current);
      const dayOfWeek = current.getDay();

      CLASS_SCHEDULE.filter(
        (classItem) => classItem.dayOfWeek === dayOfWeek
      ).forEach((classItem) => {
        result.push({
          id: `${classItem.id}-${dateString}`,
          date: dateString,
          title: classItem.title,
          subtitle: classItem.subtitle,
          type: "class",
          time: `${classItem.startTime} • ${classItem.endTime}`,
        });
      });

      current.setDate(current.getDate() + 1);
    }

    return result;
  }, [visibleMonth]);

  const allMarkedItems = useMemo(() => {
    return [...projectItems, ...monthlyClassItems];
  }, [projectItems, monthlyClassItems]);

  const selectedProjectItems = useMemo(() => {
    return projectItems.filter(
      (item) => item.date === selectedDate
    );
  }, [projectItems, selectedDate]);

  const selectedClasses = useMemo(() => {
    return classItems.filter(
      (item) => item.date === selectedDate
    );
  }, [classItems, selectedDate]);

  const markedDates = useMemo(() => {
    const result: Record<string, any> = {};

    allMarkedItems.forEach((item) => {
      if (!result[item.date]) {
        result[item.date] = {
          dots: [],
        };
      }

      const color = getItemColor(item.type);
      const dotKey = `${item.type}-${color}`;

      const alreadyExists = result[item.date].dots.some(
        (dot: { key: string }) => dot.key === dotKey
      );

      if (!alreadyExists) {
        result[item.date].dots.push({
          key: dotKey,
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
  }, [allMarkedItems, selectedDate]);

  const totalSelectedItems =
    selectedProjectItems.length + selectedClasses.length;

  const userName =
    user?.name ||
    user?.email?.split("@")[0] ||
    (isProfessor ? "Professor" : "Student");

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />

        <Text style={styles.loadingText}>
          Loading your calendar...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={COLORS.blue}
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
            Projects, updates and classes in one place.
          </Text>
        </View>

        <View style={styles.profileCircle}>
          <Text style={styles.profileText}>
            {buildInitials(userName)}
          </Text>
        </View>
      </View>

      <View style={styles.phoneCard}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="menu-outline"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>

          <Text style={styles.monthText}>
            {formatMonthYear(visibleMonth)}
          </Text>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="ellipsis-vertical"
              size={22}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>

        <Calendar
          current={visibleMonth}
          markingType="multi-dot"
          markedDates={markedDates}
          onDayPress={(day: DateData) => {
            setSelectedDate(day.dateString);
          }}
          onMonthChange={(month: DateData) => {
            setVisibleMonth(month.dateString);
          }}
          enableSwipeMonths
          hideArrows
          hideExtraDays={false}
          firstDay={0}
          style={styles.calendar}
          theme={{
            backgroundColor: COLORS.card,
            calendarBackground: COLORS.card,

            textSectionTitleColor: COLORS.muted,
            textSectionTitleDisabledColor: COLORS.faint,

            selectedDayBackgroundColor: COLORS.blue,
            selectedDayTextColor: "#FFFFFF",

            todayTextColor: COLORS.blue,
            todayBackgroundColor: COLORS.blueLight,

            dayTextColor: COLORS.text,
            textDisabledColor: "#D6D6E0",

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

        <View style={styles.dateSummary}>
          <View style={styles.countGroup}>
            <View style={styles.blueCount}>
              <Text style={styles.blueCountText}>
                {totalSelectedItems}
              </Text>
            </View>

            <View style={styles.summaryPill}>
              <Text style={styles.summaryPillText}>
                Your schedule
              </Text>
            </View>
          </View>

          <View style={styles.selectedDateGroup}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={COLORS.text}
            />

            <Text style={styles.selectedDateText}>
              {formatSelectedDate(selectedDate)}
            </Text>
          </View>
        </View>

        <ScheduleSection
          title="Your events"
          count={selectedProjectItems.length}
          items={selectedProjectItems}
          emptyMessage="No project events for this day."
        />

        <ScheduleSection
          title="Your classes"
          count={selectedClasses.length}
          items={selectedClasses}
          emptyMessage="No classes scheduled for this day."
        />
      </View>

      <View style={styles.legendCard}>
        <LegendItem
          color={COLORS.cyan}
          label="Project deadline"
        />

        <LegendItem
          color={COLORS.green}
          label="Submitted update"
        />

        <LegendItem
          color={COLORS.orange}
          label="Class"
        />
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function ScheduleSection({
  title,
  count,
  items,
  emptyMessage,
}: {
  title: string;
  count: number;
  items: CalendarItem[];
  emptyMessage: string;
}) {
  return (
    <View style={styles.scheduleSection}>
      <View style={styles.sectionHeading}>
        <View style={styles.sectionCount}>
          <Text style={styles.sectionCountText}>{count}</Text>
        </View>

        <View style={styles.sectionTitlePill}>
          <Text style={styles.sectionTitleText}>{title}</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyRow}>
          <Ionicons
            name="calendar-clear-outline"
            size={21}
            color={COLORS.faint}
          />

          <Text style={styles.emptyText}>
            {emptyMessage}
          </Text>
        </View>
      ) : (
        items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.scheduleItem}
            activeOpacity={item.projectId ? 0.75 : 1}
            onPress={() => {
              if (item.projectId) {
                router.push(`/project/${item.projectId}`);
              }
            }}
          >
            <View
              style={[
                styles.scheduleCircle,
                {
                  borderColor: getItemColor(item.type),
                },
              ]}
            />

            <View style={styles.scheduleContent}>
              {item.time ? (
                <Text style={styles.scheduleTime}>
                  {item.time}
                </Text>
              ) : (
                <Text style={styles.scheduleSubject}>
                  {item.type === "deadline"
                    ? "Project deadline"
                    : "Project update"}
                </Text>
              )}

              <Text style={styles.scheduleTitle}>
                {item.title}
              </Text>

              <Text style={styles.scheduleSubtitle}>
                {item.subtitle}
              </Text>
            </View>

            {item.projectId && (
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={COLORS.muted}
              />
            )}
          </TouchableOpacity>
        ))
      )}
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
          {
            backgroundColor: color,
          },
        ]}
      />

      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function convertTimestampToDate(
  timestamp?: string
): string | null {
  if (!timestamp) return null;

  /*
    Already formatted as YYYY-MM-DD
  */
  const isoMatch = timestamp.match(
    /^\d{4}-\d{2}-\d{2}/
  );

  if (isoMatch) {
    return isoMatch[0];
  }

  /*
    Handles timestamps such as:
    7/13/2026 10:30:00
    13/07/2026 10:30:00
  */
  const parts = timestamp
    .split(/[,\s]+/)[0]
    .split(/[/-]/);

  if (parts.length === 3) {
    const first = Number(parts[0]);
    const second = Number(parts[1]);
    const year = Number(parts[2]);

    let month: number;
    let day: number;

    if (first > 12) {
      day = first;
      month = second;
    } else {
      month = first;
      day = second;
    }

    if (
      Number.isFinite(year) &&
      Number.isFinite(month) &&
      Number.isFinite(day)
    ) {
      return `${year}-${String(month).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
    }
  }

  const parsed = new Date(timestamp);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return formatDateObject(parsed);
}

function formatDateObject(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
    shadowOffset: {
      width: 0,
      height: 12,
    },
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

  dateSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 18,
  },

  countGroup: {
    flexDirection: "row",
    alignItems: "center",
  },

  blueCount: {
    width: 47,
    height: 47,
    borderRadius: 24,
    backgroundColor: COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  blueCountText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  summaryPill: {
    marginLeft: -10,
    backgroundColor: "#F0F0F6",
    paddingLeft: 20,
    paddingRight: 15,
    paddingVertical: 11,
    borderRadius: 20,
  },

  summaryPillText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },

  selectedDateGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  selectedDateText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },

  scheduleSection: {
    paddingHorizontal: 8,
    marginBottom: 20,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionCount: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  sectionCountText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  sectionTitlePill: {
    marginLeft: -9,
    backgroundColor: "#F0F0F6",
    paddingLeft: 20,
    paddingRight: 17,
    paddingVertical: 10,
    borderRadius: 20,
  },

  sectionTitleText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },

  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 6,
  },

  scheduleCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    marginRight: 15,
  },

  scheduleContent: {
    flex: 1,
  },

  scheduleSubject: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 3,
  },

  scheduleTime: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },

  scheduleTitle: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
  },

  scheduleSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  emptyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 18,
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
  },

  legendCard: {
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
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
});