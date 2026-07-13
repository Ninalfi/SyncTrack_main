export type ProjectStatus = "On Track" | "Review" | "Attention" | "Completed";
export type ProjectPriority = "Low" | "Medium" | "High";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export type ProjectUpdate = {
  id: string;
  studentId: string;
  studentName: string;
  teamMembers: string;
  weekNumber: string;
  progress: number;
  updateDetails: string;
  timestamp: string;
  github: string;
  drive: string;
  figma: string;
  demo: string;
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
  teamMembers: string;
  updateDetails: string;
  timestamp: string;
  weekNumber: string;
  github: string;
  drive: string;
  figma: string;
  demo: string;
  updates: ProjectUpdate[];
};

const API_URL = "https://sheetdb.io/api/v1/sif1s2zbyslya";

const professorByCourse: Record<string, string> = {
  "Application Design and Development": "Layek Sir",
  "IoT and Embedded Systems": "Layek Sir",
  "Software Engineering": "Layek Sir",
  "Database Systems": "Layek Sir",
  "Mobile App Development": "Layek Sir",
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function parseProgress(value: string) {
  return parseInt(value?.replace("%", "") || "0", 10);
}

function getPriority(progress: number): ProjectPriority {
  if (progress >= 75) return "Low";
  if (progress >= 50) return "Medium";
  return "High";
}

export function getProjectStatus(progress: number): ProjectStatus {
  if (progress >= 90) return "Completed";
  if (progress >= 75) return "On Track";
  if (progress >= 50) return "Review";
  return "Attention";
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await fetch(API_URL);
    const rows = await response.json();

    const groupedProjects: Record<string, Project> = {};

    rows.forEach((item: any, index: number) => {
      const studentId = item["Student ID"] || "unknown-id";
      const studentName = item["Student Name"] || "Unknown Student";
      const teamMembers = item["Team Members"] || "";
      const title = item["Project Title"] || "Untitled Project";
      const subject = item["Course Name"] || "Unknown Course";
      const weekNumber = item["Week Number"] || "";
      const progress = parseProgress(item["Current Progress"]);
      const updateDetails = item["Update Details"] || "";
      const timestamp = item["Timestamp"] || "";

      const github = item["GitHub Repository"] || item["GitHub Repository "] || "";
      const drive = item["Google Drive Link"] || "";
      const figma = item["Figma Design Link"] || "";
      const demo = item["Demo Video Link"] || "";

      const projectKey = `${normalize(title)}-${normalize(subject)}`;

      const update: ProjectUpdate = {
        id: `${projectKey}-update-${index}`,
        studentId,
        studentName,
        teamMembers,
        weekNumber,
        progress,
        updateDetails,
        timestamp,
        github,
        drive,
        figma,
        demo,
      };

      if (!groupedProjects[projectKey]) {
        groupedProjects[projectKey] = {
          id: projectKey,
          title,
          subject,
          category: "Project Tracking",
          dueDate: "2026-06-01",
          progress,
          priority: getPriority(progress),
          description: updateDetails || "No description available.",
          professor: professorByCourse[subject] || "Assigned Professor",
          students: teamMembers ? teamMembers.split(",").length + 1 : 1,
          submittedUpdates: 1,
          totalMilestones: 4,
          completedMilestones: progress >= 75 ? 3 : progress >= 50 ? 2 : 1,
          studentName,
          teamMembers,
          updateDetails,
          timestamp,
          weekNumber,
          github,
          drive,
          figma,
          demo,
          updates: [update],
          tasks: [
            {
              id: `${projectKey}-1`,
              title: "Project Planning",
              completed: progress >= 10,
            },
            {
              id: `${projectKey}-2`,
              title: "UI / Design Progress",
              completed: progress >= 40,
            },
            {
              id: `${projectKey}-3`,
              title: "Development Progress",
              completed: progress >= 70,
            },
            {
              id: `${projectKey}-4`,
              title: "Final Submission",
              completed: progress >= 100,
            },
          ],
        };
      } else {
        const existingProject = groupedProjects[projectKey];

        existingProject.updates.push(update);

        const latestUpdate = existingProject.updates[existingProject.updates.length - 1];

        existingProject.progress = latestUpdate.progress;
        existingProject.priority = getPriority(latestUpdate.progress);
        existingProject.description = latestUpdate.updateDetails;
        existingProject.updateDetails = latestUpdate.updateDetails;
        existingProject.timestamp = latestUpdate.timestamp;
        existingProject.weekNumber = latestUpdate.weekNumber;
        existingProject.github = latestUpdate.github || existingProject.github;
        existingProject.drive = latestUpdate.drive || existingProject.drive;
        existingProject.figma = latestUpdate.figma || existingProject.figma;
        existingProject.demo = latestUpdate.demo || existingProject.demo;
        existingProject.submittedUpdates = existingProject.updates.length;
        existingProject.completedMilestones =
          latestUpdate.progress >= 75 ? 3 : latestUpdate.progress >= 50 ? 2 : 1;

        existingProject.tasks = existingProject.tasks.map((task, taskIndex) => ({
          ...task,
          completed:
            taskIndex === 0
              ? latestUpdate.progress >= 10
              : taskIndex === 1
              ? latestUpdate.progress >= 40
              : taskIndex === 2
              ? latestUpdate.progress >= 70
              : latestUpdate.progress >= 100,
        }));
      }
    });

    return Object.values(groupedProjects);
  } catch (error) {
    console.log("Google Sheets Fetch Error:", error);
    return [];
  }
}

export async function getProjectById(id: string) {
  const projects = await fetchProjects();
  return projects.find((project) => project.id === id);
}