"use client";
import { ImportDialog } from "@/components/ImportDialog";
import { SetTile } from "@/components/SetTile";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const sets = useAppStore((s) => s.sets);
  const deleteSet = useAppStore((s) => s.deleteSet);
  const reset = useAppStore((s) => s.resetProgress);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl p-6 sm:p-10">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Local Flashcards</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <a
            href="/sample-deck.md"
            className="w-full rounded-full border border-zinc-300 px-4 py-2 text-center text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900 sm:w-auto"
          >
            Download sample Markdown
          </a>
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
    </main>
  );
}

