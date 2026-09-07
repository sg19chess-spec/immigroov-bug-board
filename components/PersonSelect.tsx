"use client";

import { useState } from "react";

const OTHER = "Other";

export default function PersonSelect({
  value,
  onChange,
  people,
  placeholder = "Unassigned",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  people: readonly string[];
  placeholder?: string;
  className?: string;
}) {
  const isKnown = people.includes(value);
  const [isOther, setIsOther] = useState(value.length > 0 && !isKnown);

  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <select
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={isOther ? OTHER : value}
        onChange={(e) => {
          if (e.target.value === OTHER) {
            setIsOther(true);
            onChange("");
          } else {
            setIsOther(false);
            onChange(e.target.value);
          }
        }}
      >
        <option value="">{placeholder}</option>
        {people.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
        <option value={OTHER}>Other</option>
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
