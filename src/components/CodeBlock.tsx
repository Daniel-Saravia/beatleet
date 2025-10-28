"use client";

import { memo, useEffect, useMemo, useState } from "react";
import hljs from "highlight.js/lib/common";

type CodeBlockProps = {
  code: string;
  language?: string;
};

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  javascript: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  typescript: "typescript",
  shell: "bash",
  bash: "bash",
  sh: "bash",
  zsh: "bash",
  py: "python",
  python: "python",
  rb: "ruby",
  ruby: "ruby",
  go: "go",
  rs: "rust",
  rust: "rust",
  java: "java",
  kt: "kotlin",
  kotlin: "kotlin",
  php: "php",
  cs: "csharp",
  "c#": "csharp",
  csharp: "csharp",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  markdown: "markdown",
  html: "xml",
  xml: "xml",
  svg: "xml",
  css: "css",
  scss: "scss",
  less: "less",
  sql: "sql",
  c: "c",
  cpp: "cpp",
  objectivec: "objectivec",
};

function normalizeLanguage(language?: string): string | undefined {
  if (!language) return undefined;
  const trimmed = language.toLowerCase().replace(/[^a-z0-9#+-]/g, "");
  if (!trimmed) return undefined;
  return LANGUAGE_ALIASES[trimmed] ?? trimmed;
}

function useHighlightedCode(code: string, language?: string) {
  return useMemo(() => {
    const normalized = normalizeLanguage(language);

    if (normalized && hljs.getLanguage(normalized)) {
      try {
        return {
          html: hljs.highlight(code, { language: normalized }).value,
          languageLabel: normalized,
        };
      } catch (err) {
        console.warn("Code highlight failed; falling back to auto-detect.", err);
      }
    }

    const auto = hljs.highlightAuto(code);
    return {
      html: auto.value,
      languageLabel: normalized ?? auto.language ?? "code",
    };
  }, [code, language]);
}

function toTitleCase(label: string) {
  if (!label) return "Code";
  return label
    .split(/[\s+-]/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function CodeBlockComponent({ code, language }: CodeBlockProps) {
  const [wrap, setWrap] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const { html, languageLabel } = useHighlightedCode(code, language);
  const headerLabel = toTitleCase(languageLabel ?? "code");

  useEffect(() => {
    if (copyState === "idle") return;
    const timer = window.setTimeout(() => setCopyState("idle"), 1800);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  const copyCode = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyState("error");
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch (err) {
      console.warn("Copy failed", err);
      setCopyState("error");
    }
  };

  return (
    <div className="fc-code-block mb-4 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shadow-inner last:mb-0 dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="fc-code-block__header flex items-center justify-between border-b border-zinc-200 px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <span>{headerLabel}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWrap((prev) => !prev)}
            className="rounded-full border border-transparent px-2 py-1 text-[11px] font-semibold text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
            aria-pressed={wrap}
          >
            {wrap ? "No Wrap" : "Wrap"}
          </button>
          <button
            type="button"
            onClick={copyCode}
            className="rounded-full border border-transparent px-2 py-1 text-[11px] font-semibold text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy"}
          </button>
        </div>
      </div>
      <div className="relative">
        <pre
          className={`hljs max-h-[45vh] w-full overflow-auto px-4 py-4 text-left text-sm leading-relaxed ${
            wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
          }`}
          data-language={languageLabel}
        >
          <code
            className={`block font-mono text-sm leading-relaxed ${
              wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
            }`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </pre>
      </div>
      <span className="sr-only" aria-live="polite">
        {copyState === "copied" ? "Code copied to clipboard" : copyState === "error" ? "Copy failed" : ""}
      </span>
    </div>
  );
}

export const CodeBlock = memo(CodeBlockComponent);
