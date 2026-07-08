export type BugStatus = "yet_to_review" | "in_progress" | "completed";
export type BugPriority = "high" | "medium" | "low";

export interface Bug {
  id: string;
  title: string;
  description: string | null;
  screenshot_urls: string[];
  status: BugStatus;
  priority: BugPriority;
  reported_by: string | null;
  created_at: string;
  updated_at: string;
}

export const BUG_STATUSES: BugStatus[] = [
  "yet_to_review",
  "in_progress",
  "completed",
];

export const STATUS_LABELS: Record<BugStatus, string> = {
  yet_to_review: "Yet to Review",
  in_progress: "In Progress",
  completed: "Completed",
};

export const BUG_PRIORITIES: BugPriority[] = ["high", "medium", "low"];

export const PRIORITY_LABELS: Record<BugPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export interface Todo {
  id: string;
  description: string;
  reported_by: string | null;
  done: boolean;
  created_at: string;
  closed_at: string | null;
}
