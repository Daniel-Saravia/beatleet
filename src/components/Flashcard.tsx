"use client";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";

type Props = {
  front: string;
  back: string;
  onResult: (res: "know" | "dont") => void;
};

export function Flashcard({ front, back, onResult }: Props) {
  const [flipped, setFlipped] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);
  const bg = useTransform(x, [-150, 0, 150], ["#ef4444", "#ffffff", "#10b981"]);

  const onEnd = () => {
    const current = x.get();
    if (current > 120) onResult("know");
    else if (current < -120) onResult("dont");
  };

  return (
    <motion.div
      onTap={() => setFlipped((f) => !f)}
      drag="x"
      style={{ x, rotate, background: bg as any }}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={onEnd}
      className="mx-auto w-full max-w-xl cursor-pointer select-none rounded-2xl border border-zinc-200 p-8 text-center shadow dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="text-zinc-500 text-xs mb-2">Tap to flip • Drag left/right</div>
      <div className="text-2xl font-semibold whitespace-pre-wrap">
        {flipped ? back : front}
      </div>
    </motion.div>
  );
}

