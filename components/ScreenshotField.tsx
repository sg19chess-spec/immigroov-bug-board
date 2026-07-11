"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { captureScreenshot, isScreenCaptureSupported } from "@/lib/captureScreen";
import { usePasteImages } from "@/lib/usePasteImages";
import ScreenshotEditor from "@/components/ScreenshotEditor";

export default function ScreenshotField({
  files,
  setFiles,
}: {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(isScreenCaptureSupported()), []);
  const [editingFile, setEditingFile] = useState<File | null>(null);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      if (newFiles.length === 0) return;
      if (newFiles.length === 1) {
        setEditingFile(newFiles[0]);
      } else {
        setFiles((prev) => [...prev, ...newFiles]);
      }
    },
    [setFiles]
  );
  usePasteImages(addFiles);

  async function handleCapture() {
    const file = await captureScreenshot();
    if (file) addFiles([file]);
  }

  function handleEditorUse(edited: File) {
    setFiles((prev) => [...prev, edited]);
    setEditingFile(null);
  }

  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  );
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
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
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {previews.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {previews.map((url, i) => (
            <div key={url} className="relative h-16 w-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Screenshot ${i + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute -right-1 -top-1 rounded-full bg-black/70 px-1 text-xs text-white"
                aria-label="Remove screenshot"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {editingFile && (
        <ScreenshotEditor
          file={editingFile}
          onUse={handleEditorUse}
          onCancel={() => setEditingFile(null)}
        />
      )}
    </div>
  );
}
