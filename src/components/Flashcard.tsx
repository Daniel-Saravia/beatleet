"use client";
import { motion, useTransform, type MotionStyle } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { Components } from "react-markdown";
import { useSwipeCard } from "@/lib/useSwipeCard";
import { CodeBlock } from "./CodeBlock";

type Props = {
  front: string;
  back: string;
  onResult: (res: "know" | "dont") => void;
};

const markdownComponents: Components = {
  p({ children }) {
    return <p className="mb-4 text-left text-lg leading-relaxed last:mb-0">{children}</p>;
  },
  ul({ children }) {
    return (
      <ul className="mb-4 list-disc space-y-2 pl-6 text-left last:mb-0">{children}</ul>
    );
  },
  ol({ children }) {
    return (
      <ol className="mb-4 list-decimal space-y-2 pl-6 text-left last:mb-0">{children}</ol>
    );
  },
  li({ children }) {
    return <li className="text-left text-lg leading-relaxed">{children}</li>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="mb-4 border-l-4 border-zinc-300 pl-4 italic text-zinc-600 last:mb-0 dark:border-zinc-600 dark:text-zinc-300">
        {children}
      </blockquote>
    );
  },
  code({ inline, className, children, ...props }) {
    const content = String(children).replace(/\n$/, "");
    if (inline) {
      const classes = [
        "rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-base text-zinc-900",
        "dark:bg-zinc-700/40 dark:text-zinc-100",
        className,
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <code
          {...props}
          className={classes}
        >
          {content}
        </code>
      );
    }
    const language = className?.replace("language-", "") || undefined;
    return <CodeBlock code={content} language={language} />;
  },
  a({ children, ...props }) {
    return (
      <a
        {...props}
        className="text-blue-600 underline decoration-2 underline-offset-2 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    );
  },
  strong({ children }) {
    return <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{children}</strong>;
  },
  em({ children }) {
    return <em className="text-zinc-700 dark:text-zinc-200">{children}</em>;
  },
  h1({ children }) {
    return (
      <h1 className="mb-4 text-left text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        {children}
      </h1>
    );
  },
  h2({ children }) {
    return (
      <h2 className="mb-4 text-left text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return (
      <h3 className="mb-4 text-left text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {children}
      </h3>
    );
  },
};

const markdownRemarkPlugins = [remarkGfm, remarkBreaks];

export function Flashcard({ front, back, onResult }: Props) {
  const [flipped, setFlipped] = useState(false);
  const didDragRef = useRef(false);
  const { x, rotate, handlers } = useSwipeCard({
    onResult,
    onDragChange: (active) => {
      if (!active) {
        didDragRef.current = false;
      }
    },
    onDragMove: (distance) => {
      if (Math.abs(distance) > 8) {
        didDragRef.current = true;
      }
    },
  });
  const tint = useTransform(
    x,
    [-200, 0, 200],
    ["rgba(248,113,113,0.35)", "rgba(255,255,255,0)", "rgba(34,197,94,0.35)"],
  );

  const cardMotionStyle: MotionStyle = { x, rotate, perspective: 1000 };
  const cardInnerStyle: MotionStyle = { transformStyle: "preserve-3d" };
  const frontFaceStyle: MotionStyle = { backfaceVisibility: "hidden", backgroundColor: tint };
  const backFaceStyle: MotionStyle = {
    transform: "rotateY(180deg)",
    backfaceVisibility: "hidden",
    backgroundColor: tint,
  };

  useEffect(() => {
    setFlipped(false);
    didDragRef.current = false;
  }, [front, back]);

  return (
    <motion.div
      {...handlers}
      onTap={() => {
        if (didDragRef.current) return;
        setFlipped((f) => !f);
      }}
      // touchAction pan-y is applied via the utility class so swipe handlers stay responsive.
      style={cardMotionStyle}
      className="mx-auto flex h-[70vh] w-full max-w-xl cursor-pointer select-none items-stretch justify-stretch text-center touch-pan-y"
    >
      <motion.div
        className="relative h-full w-full rounded-2xl border border-zinc-200 bg-zinc-100 shadow dark:border-zinc-800 dark:bg-zinc-900"
        style={cardInnerStyle}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Front face */}
        <motion.div
          className="absolute inset-0 flex flex-col rounded-2xl p-6 touch-pan-y"
          style={frontFaceStyle}
        >
          <div className="mb-2 text-xs text-zinc-500">Tap to flip | Drag left/right</div>
          <div className="flex-1 overflow-auto text-left touch-pan-y">
            <ReactMarkdown
              remarkPlugins={markdownRemarkPlugins}
              components={markdownComponents}
              className="pb-4 text-left text-lg leading-relaxed"
            >
              {front}
            </ReactMarkdown>
          </div>
        </motion.div>

        {/* Back face */}
        <motion.div
          className="absolute inset-0 flex flex-col rounded-2xl p-6 touch-pan-y"
          style={backFaceStyle}
        >
          <div className="mb-2 text-xs text-zinc-500">Tap to flip | Drag left/right</div>
          <div className="flex-1 overflow-auto text-left touch-pan-y">
            <ReactMarkdown
              remarkPlugins={markdownRemarkPlugins}
              components={markdownComponents}
              className="pb-4 text-left text-lg leading-relaxed"
            >
              {back}
            </ReactMarkdown>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
