export type BugStatus = "yet_to_review" | "in_progress" | "completed";
export type BugPriority = "high" | "medium" | "low";
export type IssueType = "bug" | "feature_request";

export interface Bug {
  id: string;
  ref_id: string;
  title: string;
  description: string | null;
  screenshot_urls: string[];
  status: BugStatus;
  priority: BugPriority;
  issue_type: IssueType;
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

export const ISSUE_TYPES: IssueType[] = ["bug", "feature_request"];

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  bug: "Bug",
  feature_request: "Feature Request",
};

export interface Todo {
  id: string;
  description: string;
  reported_by: string | null;
  done: boolean;
  created_at: string;
  closed_at: string | null;
}

export interface TestModule {
  id: string;
  name: string;
  created_at: string;
}

export interface TestCase {
  id: string;
  module_id: string;
  description: string;
  added_by: string | null;
  tested: boolean;
  tested_by: string | null;
  created_at: string;
  tested_at: string | null;
}
