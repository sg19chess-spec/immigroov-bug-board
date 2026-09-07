/** Matches https://github.com/{owner}/{repo}/commit/{sha}[...] */
const GITHUB_COMMIT_URL_RE =
  /^https?:\/\/(?:www\.)?github\.com\/[^/\s]+\/[^/\s]+\/commit\/([0-9a-f]{7,40})/i;

export interface ParsedCommit {
  sha: string | null;
  url: string | null;
}

/** Accepts a raw git SHA or a GitHub commit URL and normalizes both. */
export function parseCommitInput(raw: string): ParsedCommit {
  const trimmed = raw.trim();
  if (!trimmed) return { sha: null, url: null };

  const match = trimmed.match(GITHUB_COMMIT_URL_RE);
  if (match) {
    return { sha: match[1].toLowerCase(), url: trimmed };
  }

  if (/^[0-9a-f]{7,40}$/i.test(trimmed)) {
    return { sha: trimmed.toLowerCase(), url: null };
  }

  // Doesn't look like a SHA or a recognized GitHub URL — keep it as-is so
  // nothing is silently dropped; just don't treat it as a clickable commit.
  return { sha: trimmed, url: null };
}

export function shortSha(sha: string | null | undefined): string | null {
  if (!sha) return null;
  return sha.slice(0, 7);
}
