"use client";
import { useEffect } from "react";

type Props = {
  onKnow: () => void;
  onDont: () => void;
};

export function StudyControls({ onKnow, onDont }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onDont();
      if (e.key === "ArrowRight") onKnow();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKnow, onDont]);

  return (
    <div className="mx-auto mt-4 flex w-full max-w-xl items-center justify-between gap-4">
      <button
        onClick={onDont}
        className="flex-1 rounded-full border border-red-300 bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
      >
        ← Don’t know (Left)
      </button>
      <button
        onClick={onKnow}
        className="flex-1 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
      >
        Know (Right) →
      </button>
    </div>
  );
}

