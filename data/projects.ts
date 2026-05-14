export type ProjectStatus =
  | "On Track"
  | "Review"
  | "Attention"
  | "Completed";

export type ProjectPriority =
  | "Low"
  | "Medium"
  | "High";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export type Project = {
  id: string;

  title: string;

  subject: string;

  category: string;

  dueDate: string;

  progress: number;

  priority: ProjectPriority;

  description: string;

  professor: string;

  students: number;

  submittedUpdates: number;

  totalMilestones: number;

  completedMilestones: number;

  tasks: Task[];

  studentName: string;

  updateDetails: string;

  timestamp: string;

  weekNumber: string;
};

const API_URL =
  "https://sheetdb.io/api/v1/h8unfu037masy";

export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await fetch(API_URL);

    const data = await response.json();

    return data.map(
      (item: any, index: number) => {
        const progress = parseInt(
          item["Progress  "].replace("%", "")
        );

        return {
          id: String(index + 1),

          title:
            item["Project Title  "] ||
            "Untitled Project",

          subject:
            item["Course Name  "] ||
            "Unknown Subject",

          category: "Project Tracking",

          dueDate: "2026-06-01",

          progress,

          priority:
            progress >= 75
              ? "Low"
              : progress >= 50
              ? "Medium"
              : "High",

          description:
            item["Update Details  "] ||
            "No description available.",

          professor: "Layek Sir",

          students: 2,

          submittedUpdates: 1,

          totalMilestones: 4,

          completedMilestones:
            progress >= 75
              ? 3
              : progress >= 50
              ? 2
              : 1,

          studentName:
            item["Student Name  "] ||
            "Unknown Student",

          updateDetails:
            item["Update Details  "] ||
            "",

          timestamp:
            item.Timestamp || "",

          weekNumber:
            item["Week Number  "] || "",

          tasks: [
            {
              id: `${index}-1`,
              title: "Project Planning",
              completed: true,
            },

            {
              id: `${index}-2`,
              title: "Dashboard UI",
              completed: progress >= 50,
            },

            {
              id: `${index}-3`,
              title: "Backend Integration",
              completed: progress >= 75,
            },

            {
              id: `${index}-4`,
              title: "Final Submission",
              completed: progress >= 100,
            },
          ],
        };
      }
    );
  } catch (error) {
    console.log(
      "Google Sheets Fetch Error:",
      error
    );

    return [];
  }
}

export function getProjectStatus(
  progress: number
): ProjectStatus {
  if (progress >= 90)
    return "Completed";

  if (progress >= 75)
    return "On Track";

  if (progress >= 50)
    return "Review";

  return "Attention";
}

export async function getProjectById(
  id: string
) {
  const projects =
    await fetchProjects();

  return projects.find(
    (project) => project.id === id
  );
}