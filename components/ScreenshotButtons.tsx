"use client";

import { useEffect, useRef, useState } from "react";
import { captureScreenshot, isScreenCaptureSupported } from "@/lib/captureScreen";

export default function ScreenshotButtons({
  onAdd,
}: {
  onAdd: (files: File[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Starts false to match SSR output, then flips after mount once we can
  // actually check the browser's capabilities (avoids a hydration mismatch).
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(isScreenCaptureSupported()), []);

  async function handleCapture() {
    const file = await captureScreenshot();
    if (file) onAdd([file]);
  }

  return (
    <div className="flex gap-2">
      {supported && (
        <button
          type="button"
          onClick={handleCapture}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          📸 Capture Screen
        </button>
      )}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        📁 Upload Image
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onAdd(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
    </div>
  );
}
