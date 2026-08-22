"use client";

import { useState } from "react";
import { HANDLERS, OTHER_HANDLER } from "@/lib/reporters";

export default function HandlerSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const isKnown = (HANDLERS as readonly string[]).includes(value);
  const [isOther, setIsOther] = useState(value.length > 0 && !isKnown);

  return (
    <div className="flex flex-col gap-2">
      <select
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={isOther ? OTHER_HANDLER : value}
        onChange={(e) => {
          if (e.target.value === OTHER_HANDLER) {
            setIsOther(true);
            onChange("");
          } else {
            setIsOther(false);
            onChange(e.target.value);
          }
        }}
      >
        <option value="">Unassigned</option>
        {HANDLERS.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
        <option value={OTHER_HANDLER}>Other</option>
      </select>

      {isOther && (
        <input
          autoFocus
          placeholder="Enter name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
