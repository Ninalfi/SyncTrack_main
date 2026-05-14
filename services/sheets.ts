import { Project } from "@/types/project";

const API_URL =
  "https://sheetdb.io/api/v1/h8unfu037masy";

export async function fetchProjects(): Promise<Project[]> {
  try {
    const response =
      await fetch(API_URL);

    const data =
      await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(
      (
        item: any,
        index: number
      ) => {
        const progressText =
          item["Progress  "] ||
          item["Progress"] ||
          "0%";

        const progress =
          parseInt(
            progressText.replace(
              "%",
              ""
            )
          ) || 0;

        return {
          id: String(index + 1),

          title:
            item[
              "Project Title  "
            ] ||
            item[
              "Project Title"
            ] ||
            "Untitled Project",

          subject:
            item[
              "Course Name  "
            ] ||
            item[
              "Course Name"
            ] ||
            "Unknown Subject",

          category:
            "Project Tracking",

          dueDate: "2026-06-01",

          progress,

          priority:
            progress >= 75
              ? "Low"
              : progress >= 50
              ? "Medium"
              : "High",

          description:
            item[
              "Update Details  "
            ] ||
            item[
              "Update Details"
            ] ||
            "No description available.",

          professor:
            "Layek Sir",

          students: 1,

          submittedUpdates: 1,

          totalMilestones: 4,

          completedMilestones:
            progress >= 75
              ? 3
              : progress >= 50
              ? 2
              : 1,

          studentName:
            item[
              "Student Name  "
            ] ||
            item[
              "Student Name"
            ] ||
            "Unknown Student",

          updateDetails:
            item[
              "Update Details  "
            ] ||
            item[
              "Update Details"
            ] ||
            "",

          timestamp:
            item.Timestamp ||
            "",

          weekNumber:
            item[
              "Week Number  "
            ] ||
            item[
              "Week Number"
            ] ||
            "",

          tasks: [
            {
              id: `${index}-1`,
              title:
                "Project Planning",
              completed: true,
            },

            {
              id: `${index}-2`,
              title:
                "Dashboard UI",
              completed:
                progress >= 50,
            },

            {
              id: `${index}-3`,
              title:
                "Backend Integration",
              completed:
                progress >= 75,
            },

            {
              id: `${index}-4`,
              title:
                "Final Submission",
              completed:
                progress >= 100,
            },
          ],
        };
      }
    );
  } catch (error) {
    console.log(
      "API Fetch Error:",
      error
    );

    return [];
  }
}