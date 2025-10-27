"use client";
import { useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { ImportSetJson } from "@/lib/types";
import { parseMarkdownDeck, isLikelyJsonDeck } from "@/lib/parseMarkdownDeck";

export function ImportDialog() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const importSetJson = useAppStore((s) => s.importSetJson);
  const [busy, setBusy] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const onPick: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const deck: ImportSetJson = (file.name.toLowerCase().endsWith(".md") || file.type.includes("markdown") || !isLikelyJsonDeck(text))
        ? parseMarkdownDeck(text)
        : (JSON.parse(text) as ImportSetJson);
      const id = importSetJson(deck);
      alert(`Imported set: ${id}`);
    } catch (err: any) {
      alert(`Import failed: ${err?.message || String(err)}`);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="inline-block">
      <input
        ref={inputRef}
        type="file"
        accept=".md,text/markdown,application/markdown,application/json"
        className="hidden"
        onChange={onPick}
      />
      <button
        onClick={openPicker}
        disabled={busy}
        className="rounded-full bg-zinc-900 px-4 py-2 text-white shadow hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
        title="Import Markdown Deck"
      >
        {busy ? "Importing..." : "Import Markdown"}
      </button>
    </div>
  );
}






