import { Bug, BUG_STATUSES, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/types";

export function bugsToMarkdown(bugs: Bug[]): string {
  const lines: string[] = ["# Immigroov Bug Board", ""];

  for (const status of BUG_STATUSES) {
    const group = bugs.filter((b) => b.status === status);
    if (group.length === 0) continue;

    lines.push(`## ${STATUS_LABELS[status]} (${group.length})`, "");

    for (const bug of group) {
      const checked = status === "completed" ? "x" : " ";
      const typeLabel = bug.issue_type === "feature_request" ? "Feature" : "Bug";
      lines.push(
        `- [${checked}] **${bug.ref_id}** — ${bug.title} _(${PRIORITY_LABELS[bug.priority]} priority, ${typeLabel})_`
      );
      if (bug.description) {
        lines.push(`  ${bug.description.replace(/\n/g, "\n  ")}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n").trim() + "\n";
}
