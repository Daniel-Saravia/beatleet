"use client";
import { FormEvent, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { ImportSetJson } from "@/lib/types";
import { parseMarkdownDeck, isLikelyJsonDeck } from "@/lib/parseMarkdownDeck";

export function ImportDialog() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const importSetJson = useAppStore((s) => s.importSetJson);
  const [busy, setBusy] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);

  const openPicker = () => inputRef.current?.click();

  const parseDeckText = (text: string, filenameHint?: string): ImportSetJson => {
    const isMarkdown = filenameHint?.toLowerCase().endsWith(".md") ?? false;
    if (isMarkdown || !isLikelyJsonDeck(text)) {
      return parseMarkdownDeck(text);
    }
    return JSON.parse(text) as ImportSetJson;
  };

  const importText = async (text: string, filenameHint?: string) => {
    setBusy(true);
    try {
      const deck = parseDeckText(text, filenameHint);
      const id = importSetJson(deck);
      alert(`Imported set: ${id}`);
      setShowPaste(false);
      setPasteText("");
      setPasteError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setPasteError(message);
      alert(`Import failed: ${message}`);
    } finally {
      setBusy(false);
    }
  };

  const onPick: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      await importText(text, file.name);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Import failed: ${message}`);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onPasteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pasteText.trim()) {
      setPasteError("Paste some Markdown or JSON to import.");
      return;
    }
    await importText(pasteText);
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
      <div className="flex flex-wrap gap-2">
        <button
          onClick={openPicker}
          disabled={busy}
          className="rounded-full bg-zinc-900 px-4 py-2 text-white shadow hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
          title="Import Markdown Deck"
        >
          {busy ? "Importing..." : "Import Markdown"}
        </button>
        <button
          onClick={() => {
            setShowPaste(true);
            setPasteError(null);
            setPasteText("");
          }}
          disabled={busy}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Paste Markdown
        </button>
      </div>

      {showPaste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Paste Markdown Deck</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Supports Markdown (preferred) or JSON exports from previous versions.
            </p>
            <form className="mt-4 space-y-4" onSubmit={onPasteSubmit}>
              <textarea
                value={pasteText}
                onChange={(event) => setPasteText(event.target.value)}
                className="h-52 w-full resize-none rounded-xl border border-zinc-300 bg-white p-3 font-mono text-sm text-zinc-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                placeholder="## Front&#10;Question...&#10;&#10;## Back&#10;Answer..."
              />
              {pasteError && <p className="text-sm text-red-600 dark:text-red-400">{pasteError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (busy) return;
                    setShowPaste(false);
                  }}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
                >
                  {busy ? "Importing..." : "Import pasted deck"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}






