import { shortSha } from "@/lib/commit";

export default function CommitBadge({
  sha,
  url,
}: {
  sha: string | null;
  url: string | null;
}) {
  const short = shortSha(sha);
  if (!short) return <span className="text-xs text-slate-400">No commit</span>;

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-medium text-indigo-700 hover:bg-slate-200 hover:underline"
      >
        {short}
      </a>
    );
  }

  return (
    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-medium text-slate-600">
      {short}
    </span>
  );
}
