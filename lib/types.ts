export type BugStatus =
  | "yet_to_review"
  | "planned"
  | "in_progress"
  | "to_be_tested"
  | "tested"
  | "completed";
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
  tags: string[];
  reported_by: string | null;
  handled_by: string | null;
  created_at: string;
  updated_at: string;
  /** Most recent Board stage transition time, independent of updated_at. */
  last_stage_change: string | null;
  /** Latest pending testing entry, present only while one is awaiting a result. */
  pending_test?: TestingEntry | null;
}

export const BUG_STATUSES: BugStatus[] = [
  "yet_to_review",
  "planned",
  "in_progress",
  "to_be_tested",
  "tested",
  "completed",
];

export const STATUS_LABELS: Record<BugStatus, string> = {
  yet_to_review: "To Review",
  planned: "Planned",
  in_progress: "In Progress",
  to_be_tested: "To Be Tested",
  tested: "Tested",
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

export interface StageHistoryEntry {
  id: string;
  task_id: string;
  from_stage: BugStatus | null;
  to_stage: BugStatus;
  changed_by: string | null;
  changed_at: string;
}

export type TestEnvironment = "staging" | "production";

export const TEST_ENVIRONMENTS: TestEnvironment[] = ["staging", "production"];

export const TEST_ENVIRONMENT_LABELS: Record<TestEnvironment, string> = {
  staging: "Staging",
  production: "Production",
};

export type TestStatus = "pending" | "passed" | "failed";

export const TEST_STATUS_LABELS: Record<TestStatus, string> = {
  pending: "Pending",
  passed: "Passed",
  failed: "Failed",
};

export interface TestingEntry {
  id: string;
  task_id: string;
  environment: TestEnvironment;
  commit_sha: string | null;
  commit_url: string | null;
  assigned_tester: string | null;
  ready_by: string | null;
  ready_at: string;
  status: TestStatus;
  tested_by: string | null;
  tested_at: string | null;
  test_notes: string | null;
  created_at: string;
}

export type TodoStage = "assigned" | "in_progress" | "completed";

export const TODO_STAGES: TodoStage[] = ["assigned", "in_progress", "completed"];

export const TODO_STAGE_LABELS: Record<TodoStage, string> = {
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
};

export interface Todo {
  id: string;
  description: string;
  reported_by: string | null;
  assigned_to: string | null;
  stage: TodoStage;
  created_at: string;
  in_progress_at: string | null;
  completed_at: string | null;
  /** Most recent To-Do stage transition time, independent of any edit. */
  last_stage_change: string | null;
}

export interface TodoStageHistoryEntry {
  id: string;
  todo_id: string;
  from_stage: TodoStage | null;
  to_stage: TodoStage;
  changed_by: string | null;
  changed_at: string;
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
