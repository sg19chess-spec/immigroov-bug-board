"use client";

import { Bug } from "@/lib/types";

function buildMessage(bug: Bug): string {
  const emoji = bug.issue_type === "feature_request" ? "💡" : "🐞";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/issues/${bug.ref_id}`;

  return [
    `${emoji} ${bug.ref_id}`,
    `Title: ${bug.title}`,
    "",
    "Description:",
    bug.description || "(no description)",
    "",
    "Link:",
    link,
  ].join("\n");
}

export default function WhatsAppButton({
  bug,
  className,
  stopPropagation,
}: {
  bug: Bug;
  className?: string;
  stopPropagation?: boolean;
}) {
  const href = `https://wa.me/?text=${encodeURIComponent(buildMessage(bug))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => stopPropagation && e.stopPropagation()}
      onPointerDown={(e) => stopPropagation && e.stopPropagation()}
      className={
        className ??
        "flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 hover:text-emerald-600"
      }
      aria-label="Discuss on WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.06c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.63-.6-2.87-1.24-4.74-4.13-4.89-4.32-.14-.19-1.17-1.55-1.17-2.96 0-1.4.74-2.09 1-2.38.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.98.88 2.12.07.14.11.3.02.49-.09.19-.14.3-.28.46-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.28.36-.23.6-.14.24.09 1.55.73 1.82.86.27.14.44.2.51.31.07.12.07.68-.17 1.36z" />
      </svg>
    </a>
  );
}
