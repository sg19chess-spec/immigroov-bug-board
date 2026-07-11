"use client";

import { useEffect } from "react";

let pasteCounter = 0;

export function usePasteImages(onPaste: (files: File[]) => void) {
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (const item of items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            const ext = file.type.split("/")[1] || "png";
            files.push(
              new File([file], `pasted-${Date.now()}-${pasteCounter++}.${ext}`, {
                type: file.type,
              })
            );
          }
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        onPaste(files);
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onPaste]);
}
