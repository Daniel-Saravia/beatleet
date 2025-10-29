"use client";
import { ImportDialog } from "@/components/ImportDialog";
import { SetTile } from "@/components/SetTile";
import { useAppStore } from "@/lib/store";
import { useState } from "react";

export default function Home() {
  const sets = useAppStore((s) => s.sets);
  const deleteSet = useAppStore((s) => s.deleteSet);
  const reset = useAppStore((s) => s.resetProgress);
  const [showGuide, setShowGuide] = useState(false);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl p-6 sm:p-10">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Local Flashcards</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            onClick={() => setShowGuide(true)}
            className="w-full rounded-full border border-zinc-300 px-4 py-2 text-center text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900 sm:w-auto"
          >
            MD Format Guide
          </button>
          <ImportDialog />
        </div>
      </header>

      {sets.allIds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700">
          No sets yet. Import a Markdown deck to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {sets.allIds.map((id) => {
            const s = sets.byId[id];
            return (
              <div key={id} className="flex flex-col gap-2">
                <SetTile id={id} title={s.title} description={s.description} count={s.cards.length} />
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => reset(id)}
                    className="flex-1 rounded-full border border-zinc-300 px-3 py-1 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    Reset progress
                  </button>
                  <button
                    onClick={() => deleteSet(id)}
                    className="flex-1 rounded-full border border-zinc-300 px-3 py-1 text-red-600 hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Deck Format</h2>
              <button
                onClick={() => setShowGuide(false)}
                className="rounded-full border border-transparent px-2 py-1 text-sm text-zinc-500 hover:border-zinc-300 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Use a title, optional description, then repeat sections for each card.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100">
{`# My Deck

Optional description...

## Front
What is string interpolation?

## Back
\`\`\`csharp
var message = $"Hello {name}";
\`\`\`

## Hint
It works with any expression.`}
            </pre>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

