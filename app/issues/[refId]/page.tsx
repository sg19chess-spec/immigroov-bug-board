"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bug } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ refId: string }>;
}) {
  const { refId } = use(params);
  const [bug, setBug] = useState<Bug | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/bugs/ref/${refId}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then(setBug)
      .catch(() => setNotFound(true));
  }, [refId]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center">
        <p className="text-sm text-slate-500">
          No issue found for &ldquo;{refId}&rdquo;.
        </p>
        <Link href="/board" className="mt-3 inline-block text-sm text-indigo-600">
          Back to board
        </Link>
      </div>
    );
  }

  if (!bug) {
    return <div className="p-6 text-sm text-slate-400">Loading issue...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <Link href="/board" className="mb-4 inline-block text-sm text-indigo-600">
        ← Back to board
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-medium text-slate-400">
              {bug.ref_id}
            </span>
            {bug.issue_type === "feature_request" && (
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-violet-200">
                Feature
              </span>
            )}
          </div>
          <WhatsAppButton
            bug={bug}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
          />
        </div>

        <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
          {bug.title}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={bug.status} />
          <PriorityBadge priority={bug.priority} />
        </div>

        {bug.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-slate-600">
            {bug.description}
          </p>
        )}

        {bug.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {bug.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {bug.screenshot_urls.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {bug.screenshot_urls.map((url) => (
              <div key={url} className="relative h-24 w-24">
                <Image
                  src={url}
                  alt="Issue screenshot"
                  fill
                  unoptimized
                  className="rounded-lg object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
          <span>Reported by {bug.reported_by || "Anonymous"}</span>
          <span>Created {new Date(bug.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
