"use client";

import { useEffect, useRef, useState } from "react";
import { useActingAs } from "@/components/ActingAsProvider";
import { PEOPLE } from "@/lib/currentPerson";
import PersonSelect from "@/components/PersonSelect";

export default function ActingAsPicker() {
  const { person, setPerson } = useActingAs();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(person ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(person ?? "");
  }, [person]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
      >
        <span className="hidden sm:inline text-slate-400">Acting as</span>
        <span className="font-semibold text-slate-800">{person || "Select name"}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <PersonSelect
            value={draft}
            onChange={(name) => {
              setDraft(name);
              if (name) {
                setPerson(name);
                setOpen(false);
              }
            }}
            people={PEOPLE}
            placeholder="Select your name"
          />
        </div>
      )}
    </div>
  );
}
