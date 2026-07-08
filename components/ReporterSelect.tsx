"use client";

import { useState } from "react";
import { OTHER_REPORTER, REPORTERS } from "@/lib/reporters";

export default function ReporterSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const isKnown = (REPORTERS as readonly string[]).includes(value);
  const [isOther, setIsOther] = useState(value.length > 0 && !isKnown);

  return (
    <div className="flex flex-col gap-2">
      <select
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        value={isOther ? OTHER_REPORTER : value}
        onChange={(e) => {
          if (e.target.value === OTHER_REPORTER) {
            setIsOther(true);
            onChange("");
          } else {
            setIsOther(false);
            onChange(e.target.value);
          }
        }}
      >
        <option value="" disabled>
          Select your name
        </option>
        {REPORTERS.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
        <option value={OTHER_REPORTER}>Other</option>
      </select>

      {isOther && (
        <input
          autoFocus
          placeholder="Enter your name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
