import { HANDLERS, REPORTERS } from "@/lib/reporters";

const STORAGE_KEY = "immigroov:acting_as";

/** Everyone who might act on the board or to-do list, deduped. */
export const PEOPLE: string[] = [...new Set([...REPORTERS, ...HANDLERS])];

export function getCurrentPerson(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setCurrentPerson(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // ignore storage failures (private browsing, quota, etc.)
  }
}
