"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Tool = "none" | "crop" | "arrow" | "rect" | "circle";

const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#111827"];
const MAX_HISTORY = 20;

function rotateCanvas(source: HTMLCanvasElement, clockwise: boolean) {
  const w = source.width;
  const h = source.height;
  const dest = document.createElement("canvas");
  dest.width = h;
  dest.height = w;
  const ctx = dest.getContext("2d")!;
  if (clockwise) {
    ctx.translate(h, 0);
    ctx.rotate(Math.PI / 2);
  } else {
    ctx.translate(0, w);
    ctx.rotate(-Math.PI / 2);
  }
  ctx.drawImage(source, 0, 0);
  return dest;
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const headLength = 16;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle - Math.PI / 6),
    y2 - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLength * Math.cos(angle + Math.PI / 6),
    y2 - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

export default function ScreenshotEditor({
  file,
  onUse,
  onCancel,
}: {
  file: File;
  onUse: (file: File) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("none");
  const [color, setColor] = useState(COLORS[0]);
  const [zoom, setZoom] = useState(1);
  const [ready, setReady] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const preview = previewRef.current!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      preview.width = img.naturalWidth;
      preview.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const fit = Math.min(1, 720 / img.naturalWidth, 480 / img.naturalHeight);
      setZoom(fit > 0 ? fit : 1);
      setReady(true);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [file]);

  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setUndoStack((prev) => [...prev.slice(-(MAX_HISTORY - 1)), dataUrl]);
    setRedoStack([]);
  }, []);

  function loadDataUrl(dataUrl: string) {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const preview = previewRef.current!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      preview.width = img.naturalWidth;
      preview.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  }

  function undo() {
    if (undoStack.length === 0) return;
    const canvas = canvasRef.current!;
    const current = canvas.toDataURL("image/png");
    setRedoStack((prev) => [...prev, current]);
    const prevUrl = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    loadDataUrl(prevUrl);
  }

  function redo() {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current!;
    const current = canvas.toDataURL("image/png");
    setUndoStack((prev) => [...prev, current]);
    const nextUrl = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    loadDataUrl(nextUrl);
  }

  function rotate(clockwise: boolean) {
    pushHistory();
    const canvas = canvasRef.current!;
    const rotated = rotateCanvas(canvas, clockwise);
    canvas.width = rotated.width;
    canvas.height = rotated.height;
    canvas.getContext("2d")!.drawImage(rotated, 0, 0);
    const preview = previewRef.current!;
    preview.width = rotated.width;
    preview.height = rotated.height;
  }

  function getPointFromClient(clientX: number, clientY: number) {
    const canvas = previewRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function clearPreview() {
    const preview = previewRef.current!;
    preview.getContext("2d")!.clearRect(0, 0, preview.width, preview.height);
  }

  function drawPreviewShape(point: { x: number; y: number }) {
    const start = startRef.current;
    clearPreview();
    const pctx = previewRef.current!.getContext("2d")!;
    pctx.strokeStyle = color;
    pctx.lineWidth = 3;
    pctx.setLineDash([]);

    if (tool === "crop") {
      const x = Math.min(start.x, point.x);
      const y = Math.min(start.y, point.y);
      const w = Math.abs(point.x - start.x);
      const h = Math.abs(point.y - start.y);
      pctx.save();
      pctx.strokeStyle = "#ffffff";
      pctx.setLineDash([6, 4]);
      pctx.strokeRect(x, y, w, h);
      pctx.restore();
    } else if (tool === "rect") {
      const x = Math.min(start.x, point.x);
      const y = Math.min(start.y, point.y);
      const w = Math.abs(point.x - start.x);
      const h = Math.abs(point.y - start.y);
      pctx.strokeRect(x, y, w, h);
    } else if (tool === "circle") {
      const cx = (start.x + point.x) / 2;
      const cy = (start.y + point.y) / 2;
      const rx = Math.abs(point.x - start.x) / 2;
      const ry = Math.abs(point.y - start.y) / 2;
      pctx.beginPath();
      pctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      pctx.stroke();
    } else if (tool === "arrow") {
      drawArrow(pctx, start.x, start.y, point.x, point.y);
    }
  }

  function commitShape(point: { x: number; y: number }) {
    const start = startRef.current;
    clearPreview();

    if (tool === "crop") {
      const x = Math.round(Math.min(start.x, point.x));
      const y = Math.round(Math.min(start.y, point.y));
      const w = Math.round(Math.abs(point.x - start.x));
      const h = Math.round(Math.abs(point.y - start.y));
      if (w < 10 || h < 10) return;
      pushHistory();
      const canvas = canvasRef.current!;
      const cropped = document.createElement("canvas");
      cropped.width = w;
      cropped.height = h;
      cropped.getContext("2d")!.drawImage(canvas, x, y, w, h, 0, 0, w, h);
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(cropped, 0, 0);
      previewRef.current!.width = w;
      previewRef.current!.height = h;
      return;
    }

    const ctx = canvasRef.current!.getContext("2d")!;
    pushHistory();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    if (tool === "rect") {
      const x = Math.min(start.x, point.x);
      const y = Math.min(start.y, point.y);
      ctx.strokeRect(x, y, Math.abs(point.x - start.x), Math.abs(point.y - start.y));
    } else if (tool === "circle") {
      const cx = (start.x + point.x) / 2;
      const cy = (start.y + point.y) / 2;
      const rx = Math.abs(point.x - start.x) / 2;
      const ry = Math.abs(point.y - start.y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === "arrow") {
      drawArrow(ctx, start.x, start.y, point.x, point.y);
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (tool === "none") return;
    const point = getPointFromClient(e.clientX, e.clientY);
    draggingRef.current = true;
    startRef.current = point;

    function onMove(ev: PointerEvent) {
      if (!draggingRef.current) return;
      drawPreviewShape(getPointFromClient(ev.clientX, ev.clientY));
    }
    function onUp(ev: PointerEvent) {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      commitShape(getPointFromClient(ev.clientX, ev.clientY));
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleUse() {
    canvasRef.current!.toBlob((blob) => {
      if (!blob) return;
      onUse(new File([blob], `edited-${Date.now()}.png`, { type: "image/png" }));
    }, "image/png");
  }

  const canvas = canvasRef.current;
  const displayWidth = canvas ? canvas.width * zoom : 0;
  const displayHeight = canvas ? canvas.height * zoom : 0;

  const TOOLS: { id: Tool; label: string }[] = [
    { id: "crop", label: "✂️ Crop" },
    { id: "rect", label: "▭ Rectangle" },
    { id: "circle", label: "⭕ Circle" },
    { id: "arrow", label: "➡️ Arrow" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex max-h-[95vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 p-3">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTool((prev) => (prev === t.id ? "none" : t.id))}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                tool === t.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}

          <div className="mx-1 h-5 w-px bg-slate-200" />

          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full ring-2 ${
                color === c ? "ring-indigo-500" : "ring-transparent"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}

          <div className="mx-1 h-5 w-px bg-slate-200" />

          <button
            type="button"
            onClick={() => rotate(false)}
            className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            ⟲ Rotate
          </button>
          <button
            type="button"
            onClick={() => rotate(true)}
            className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            ⟳ Rotate
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200" />

          <button
            type="button"
            onClick={undo}
            disabled={undoStack.length === 0}
            className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-40"
          >
            ↩ Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={redoStack.length === 0}
            className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-40"
          >
            ↪ Redo
          </button>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
              className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
            >
              −
            </button>
            <span className="w-10 text-center text-xs text-slate-500">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-100 p-4">
          {!ready && <p className="text-sm text-slate-400">Loading image...</p>}
          <div
            className="relative"
            style={{ width: displayWidth, height: displayHeight }}
          >
            <canvas
              ref={canvasRef}
              style={{ width: displayWidth, height: displayHeight }}
              className="absolute left-0 top-0 rounded shadow"
            />
            <canvas
              ref={previewRef}
              style={{
                width: displayWidth,
                height: displayHeight,
                cursor: tool === "none" ? "default" : "crosshair",
              }}
              className="absolute left-0 top-0"
              onPointerDown={handlePointerDown}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUse}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            ✓ Use Screenshot
          </button>
        </div>
      </div>
    </div>
  );
}
