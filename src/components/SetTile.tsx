"use client";
import Link from "next/link";

export function SetTile(props: { id: string; title: string; count: number; description?: string }) {
  const { id, title, count, description } = props;
  return (
    <Link
      href={`/study/${id}`}
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="text-lg font-semibold">{title}</div>
      {description ? (
        <div className="mt-1 text-sm text-zinc-500 line-clamp-2">{description}</div>
      ) : null}
      <div className="mt-3 text-xs text-zinc-400">{count} cards</div>
    </Link>
  );
}

