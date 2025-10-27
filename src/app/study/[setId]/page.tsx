"use client";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { startQueue, grade } from "@/lib/queue";
import { Flashcard } from "@/components/Flashcard";
import { StudyControls } from "@/components/StudyControls";
import { ProgressBar } from "@/components/ProgressBar";

export default function StudyPage() {
  const params = useParams<{ setId: string }>();
  const setId = params.setId;
  const router = useRouter();
  const setDoc = useAppStore((s) => s.sets.byId[setId]);
  const study = useAppStore((s) => s.study[setId]);
  const markLearned = useAppStore((s) => s.markLearned);

  const learnedMap = study?.learned || {};
  const initialQueue = useMemo(() => startQueue(setDoc?.cards || [], learnedMap), [setDoc, study]);
  const [queue, setQueue] = useState(initialQueue);
  const [index, setIndex] = useState(0);

  if (!setDoc) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl p-6">
        <button className="underline" onClick={() => router.push("/")}>← Back</button>
        <div className="mt-6 text-zinc-500">Set not found.</div>
      </main>
    );
  }

  const total = setDoc.cards.length;
  const learnedCount = Object.values(learnedMap).filter(Boolean).length;
  const percent = total === 0 ? 0 : (learnedCount / total) * 100;

  const done = queue.length === 0;
  const current = queue[index];

  const onKnow = () => {
    if (!current) return;
    markLearned(setId, current.id);
    const nextQ = grade(queue, index, "know");
    setQueue(nextQ);
    setIndex(0);
  };
  const onDont = () => {
    if (!current) return;
    const nextQ = grade(queue, index, "dont");
    setQueue(nextQ);
    setIndex(0);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <button className="underline" onClick={() => router.push("/")}>← Back</button>
        <div className="text-sm text-zinc-500">
          {learnedCount}/{total} learned
        </div>
      </div>
      <ProgressBar percent={percent} />

      <h1 className="mt-6 text-xl font-semibold">{setDoc.title}</h1>
      {setDoc.description ? (
        <div className="text-sm text-zinc-500">{setDoc.description}</div>
      ) : null}

      <div className="mt-8">
        {done ? (
          <div className="rounded-xl border border-zinc-200 p-8 text-center shadow-sm dark:border-zinc-800">
            <div className="text-2xl font-semibold">All learned 🎉</div>
            <div className="mt-2 text-zinc-500">You have completed this set.</div>
          </div>
        ) : (
          <>
            <Flashcard front={current.front} back={current.back} onResult={(r) => (r === "know" ? onKnow() : onDont())} />
            <StudyControls onKnow={onKnow} onDont={onDont} />
          </>
        )}
      </div>
    </main>
  );
}
