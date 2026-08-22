import { Bug } from "@/lib/types";

/** Sentinel key for bugs with no reporter / no handler set. */
export const UNSET_PERSON = "__unset__";

export const REPORTER_UNSET_LABEL = "Anonymous";
export const HANDLER_UNSET_LABEL = "Unassigned";

export type PersonField = "reported_by" | "handled_by";

export function personKey(value: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : UNSET_PERSON;
}

export function personLabel(key: string, field: PersonField): string {
  if (key !== UNSET_PERSON) return key;
  return field === "reported_by" ? REPORTER_UNSET_LABEL : HANDLER_UNSET_LABEL;
}

/** Distinct values present on the given bugs, sorted, with the unset bucket last. */
export function collectPeople(bugs: Bug[], field: PersonField): string[] {
  const keys = new Set<string>();
  for (const bug of bugs) keys.add(personKey(bug[field]));
  const named = [...keys].filter((k) => k !== UNSET_PERSON).sort();
  return keys.has(UNSET_PERSON) ? [...named, UNSET_PERSON] : named;
}

/** An empty selection means "no filter", matching how tags behave. */
export function matchesPeople(active: Set<string>, value: string | null): boolean {
  return active.size === 0 || active.has(personKey(value));
}
