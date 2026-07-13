"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { supabase } from "@/lib/supabase";
import {
  Bug,
  BUG_PRIORITIES,
  BUG_STATUSES,
  BugPriority,
  BugStatus,
  ISSUE_TYPES,
  IssueType,
  STATUS_LABELS,
} from "@/lib/types";
import BugColumn from "@/components/BugColumn";
import MoveSheet from "@/components/MoveSheet";
import EditBugModal from "@/components/EditBugModal";
import FilterBar, { SortOption } from "@/components/FilterBar";
import CopyMarkdownButton from "@/components/CopyMarkdownButton";
import { useIsDesktop } from "@/lib/useIsDesktop";

const PRIORITY_ORDER: Record<BugPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export default function BoardPage() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BugStatus>("yet_to_review");
  const [movingBug, setMovingBug] = useState<Bug | null>(null);
  const [editingBug, setEditingBug] = useState<Bug | null>(null);
  const [search, setSearch] = useState("");
  const [activePriorities, setActivePriorities] = useState<Set<BugPriority>>(
    new Set(BUG_PRIORITIES)
  );
  const [activeIssueTypes, setActiveIssueTypes] = useState<Set<IssueType>>(
    new Set(ISSUE_TYPES)
  );
  const [sort, setSort] = useState<SortOption>("newest");
  const isDesktop = useIsDesktop();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    fetch("/api/bugs")
      .then((res) => res.json())
      .then((data) => {
        setBugs(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("bugs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bugs" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBugs((prev) =>
              prev.some((b) => b.id === payload.new.id)
                ? prev
                : [payload.new as Bug, ...prev]
            );
          } else if (payload.eventType === "UPDATE") {
            setBugs((prev) =>
              prev.map((b) => (b.id === payload.new.id ? (payload.new as Bug) : b))
            );
          } else if (payload.eventType === "DELETE") {
            setBugs((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateStatus(id: string, status: BugStatus) {
    setBugs((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));

    const res = await fetch(`/api/bugs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      // revert on failure by refetching
      const fresh = await fetch("/api/bugs").then((r) => r.json());
      setBugs(fresh);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const bugId = active.id as string;
    const newStatus = over.id as BugStatus;
    const bug = bugs.find((b) => b.id === bugId);

    if (bug && bug.status !== newStatus) {
      updateStatus(bugId, newStatus);
    }
  }

  function handleDelete(bug: Bug) {
    if (!confirm(`Delete "${bug.title}"?`)) return;

    setBugs((prev) => prev.filter((b) => b.id !== bug.id));
    fetch(`/api/bugs/${bug.id}`, { method: "DELETE" }).then(async (res) => {
      if (!res.ok) {
        const fresh = await fetch("/api/bugs").then((r) => r.json());
        setBugs(fresh);
      }
    });
  }

  function togglePriority(priority: BugPriority) {
    setActivePriorities((prev) => {
      const next = new Set(prev);
      if (next.has(priority)) next.delete(priority);
      else next.add(priority);
      return next;
    });
  }

  function toggleIssueType(type: IssueType) {
    setActiveIssueTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function sortBugs(list: Bug[]): Bug[] {
    const sorted = [...list];
    if (sort === "newest") {
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    } else if (sort === "oldest") {
      sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
    } else if (sort === "priority_high") {
      sorted.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    } else if (sort === "priority_low") {
      sorted.sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]);
    }
    return sorted;
  }

  const filteredBugs = bugs.filter((b) => {
    if (!activePriorities.has(b.priority)) return false;
    if (!activeIssueTypes.has(b.issue_type)) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      b.title.toLowerCase().includes(q) ||
      (b.description ?? "").toLowerCase().includes(q) ||
      b.ref_id.toLowerCase().includes(q)
    );
  });

  const grouped = BUG_STATUSES.reduce<Record<BugStatus, Bug[]>>(
    (acc, status) => {
      acc[status] = sortBugs(filteredBugs.filter((b) => b.status === status));
      return acc;
    },
    { yet_to_review: [], in_progress: [], completed: [] }
  );

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-400">Loading board...</div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 pb-24 md:p-6 md:pb-10">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">
            Bug Board
          </h1>
          <p className="hidden text-sm text-slate-500 md:block">
            Track and triage bugs reported by the test group.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CopyMarkdownButton bugs={bugs} />
          <Link
            href="/add"
            className="hidden rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 md:inline-block"
          >
            + Report Bug
          </Link>
        </div>
      </div>

      <div className="relative mb-4 md:max-w-sm">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bugs..."
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <FilterBar
        activePriorities={activePriorities}
        onTogglePriority={togglePriority}
        activeIssueTypes={activeIssueTypes}
        onToggleIssueType={toggleIssueType}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Mobile tabs */}
      <div className="mb-4 flex gap-2 md:hidden">
        {BUG_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeTab === status
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {STATUS_LABELS[status]} ({grouped[status].length})
          </button>
        ))}
      </div>

      {isDesktop ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid gap-4 md:grid-cols-3">
            {BUG_STATUSES.map((status) => (
              <BugColumn
                key={status}
                status={status}
                bugs={grouped[status]}
                onEdit={(bug) => setEditingBug(bug)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </DndContext>
      ) : (
        // Mobile: tap-to-move instead of drag
        <BugColumn
          status={activeTab}
          bugs={grouped[activeTab]}
          onCardClick={(bug) => setMovingBug(bug)}
          onEdit={(bug) => setEditingBug(bug)}
          onDelete={handleDelete}
        />
      )}

      {/* Mobile floating action button */}
      <Link
        href="/add"
        className="fixed bottom-5 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-2xl text-white shadow-lg transition hover:bg-indigo-700 md:hidden"
        aria-label="Report a bug"
      >
        +
      </Link>

      {movingBug && (
        <MoveSheet
          bug={movingBug}
          onMove={(status) => updateStatus(movingBug.id, status)}
          onClose={() => setMovingBug(null)}
        />
      )}

      {editingBug && (
        <EditBugModal
          bug={editingBug}
          onSaved={(updated) =>
            setBugs((prev) =>
              prev.map((b) => (b.id === updated.id ? updated : b))
            )
          }
          onDeleted={(id) =>
            setBugs((prev) => prev.filter((b) => b.id !== id))
          }
          onClose={() => setEditingBug(null)}
        />
      )}
    </div>
  );
}
