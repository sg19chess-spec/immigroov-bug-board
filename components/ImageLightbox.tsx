"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageLightbox({
  urls,
  startIndex,
  onClose,
}: {
  urls: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);

  function prev(e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((i) => (i - 1 + urls.length) % urls.length);
  }

  function next(e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((i) => (i + 1) % urls.length);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white hover:bg-white/20"
        aria-label="Close"
      >
        ×
      </button>

      {urls.length > 1 && (
        <span className="absolute top-4 left-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
          {index + 1} / {urls.length}
        </span>
      )}

      {urls.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20 md:left-4"
          aria-label="Previous image"
        >
          ‹
        </button>
      )}

      <div
        className="relative h-[85vh] w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={urls[index]}
          alt="Bug screenshot"
          fill
          unoptimized
          className="object-contain"
        />
      </div>

      {urls.length > 1 && (
        <button
          onClick={next}
          className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20 md:right-4"
          aria-label="Next image"
        >
          ›
        </button>
      )}
    </div>
  );
}
