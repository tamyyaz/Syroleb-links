"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/getDictionary";

type Photo = { id: string; url: string };

// Photo grid with a full-screen viewer: tap a photo to open it, then use the
// arrows, swipe, or the keyboard (← → Esc) to move around.
export default function GalleryGrid({ photos, dict }: { photos: Photo[]; dict: Dictionary }) {
  const [current, setCurrent] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const close = useCallback(() => setCurrent(null), []);
  const move = useCallback(
    (step: number) =>
      setCurrent((i) => (i === null ? i : (i + step + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (current === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") move(1);
      else if (e.key === "ArrowLeft") move(-1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [current, close, move]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setCurrent(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-sage-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <Image
              src={photo.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {current !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={close}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[current].url}
            alt=""
            className="max-h-[88vh] max-w-[94vw] select-none object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label={dict.gallery.close}
            onClick={close}
            className="absolute end-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
          >
            ×
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label={dict.gallery.prev}
                onClick={(e) => {
                  e.stopPropagation();
                  move(-1);
                }}
                className="absolute start-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
                dir="ltr"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label={dict.gallery.next}
                onClick={(e) => {
                  e.stopPropagation();
                  move(1);
                }}
                className="absolute end-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
                dir="ltr"
              >
                ›
              </button>
              <div className="absolute bottom-4 start-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-xs text-white" dir="ltr">
                {current + 1} / {photos.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
