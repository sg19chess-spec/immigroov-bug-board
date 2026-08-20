"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import Image from "next/image";
import { Bug, BugPriority } from "@/lib/types";
import PriorityBadge from "@/components/PriorityBadge";
import ImageLightbox from "@/components/ImageLightbox";
import WhatsAppButton from "@/components/WhatsAppButton";

const BORDER_COLORS: Record<BugPriority, string> = {
  high: "border-l-red-500",
  medium: "border-l-yellow-500",
  low: "border-l-green-500",
};

export default function BugCard({
  bug,
  onClick,
  onEdit,
  onDelete,
  draggable = true,
}: {
  bug: Bug;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  draggable?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: bug.id });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 10 : undefined,
      }
    : undefined;

  const thumbnail = bug.screenshot_urls[0];
  const extraCount = bug.screenshot_urls.length - 1;

  return (
    <div
      ref={setNodeRef}
      style={draggable ? style : undefined}
      {...(draggable ? listeners : undefined)}
      {...(draggable ? attributes : undefined)}
      onClick={onClick}
      className={`group relative rounded-xl border border-l-4 border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md cursor-pointer ${draggable ? "touch-none active:cursor-grabbing" : ""} ${BORDER_COLORS[bug.priority]}`}
    >
      <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
        <WhatsAppButton bug={bug} stopPropagation />
        {onEdit && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs text-slate-500 shadow-sm ring-1 ring-slate-200 hover:text-indigo-600"
            aria-label="Edit bug"
          >
            ✎
          </button>
        )}
        {onDelete && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs text-slate-500 shadow-sm ring-1 ring-slate-200 hover:text-red-600"
            aria-label="Delete bug"
          >
            🗑
          </button>
        )}
      </div>

      {thumbnail && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
          }}
          className="relative mb-2 h-28 w-full overflow-hidden rounded-lg"
        >
          <Image
            src={thumbnail}
            alt={bug.title}
            fill
            className="object-cover"
            unoptimized
          />
          {extraCount > 0 && (
            <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
              +{extraCount}
            </span>
          )}
        </div>
      )}

      {lightboxOpen && (
        <ImageLightbox
          urls={bug.screenshot_urls}
          startIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}
      <div className="mb-1 flex items-center gap-1.5 pr-20">
        <span className="font-mono text-[10px] font-medium text-slate-400">
          {bug.ref_id}
        </span>
        {bug.issue_type === "feature_request" && (
          <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 ring-1 ring-violet-200">
            Feature
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-2 pr-20">
        <h3 className="text-sm font-semibold text-slate-900">{bug.title}</h3>
      </div>
      {bug.description && (
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
          {bug.description}
        </p>
      )}
      {bug.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {bug.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between gap-2">
        <PriorityBadge priority={bug.priority} />
        <span className="text-[11px] text-slate-400">
          {new Date(bug.created_at).toLocaleDateString()}
        </span>
      </div>
      <div className="mt-1 text-[11px] font-medium text-slate-500">
        {bug.reported_by || "Anonymous"}
      </div>
    </div>
  );
}
