export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const seen = new Set<string>();
  for (const t of tags) {
    if (typeof t !== "string") continue;
    const trimmed = t.trim().toLowerCase();
    if (trimmed) seen.add(trimmed);
  }
  return [...seen];
}
