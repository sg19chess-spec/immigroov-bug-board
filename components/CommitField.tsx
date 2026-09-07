"use client";

export default function CommitField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Commit SHA or GitHub commit URL"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <p className="mt-1 text-xs text-slate-400">
        e.g. c71d890abc123... or https://github.com/org/repo/commit/c71d890...
      </p>
    </div>
  );
}
