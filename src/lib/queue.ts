import { Card } from "./types";

export const REQUEUE_OFFSET = 3;

export function startQueue(cards: Card[], learnedMap: Record<string, boolean>): Card[] {
  return cards.filter((c) => !learnedMap[c.id]);
}

export function grade(queue: Card[], currentIndex: number, result: "know" | "dont"): Card[] {
  const copy = [...queue];
  const [current] = copy.splice(currentIndex, 1);
  if (result === "dont") {
    const pos = Math.min(REQUEUE_OFFSET, copy.length);
    copy.splice(pos, 0, current);
  }
  return copy;
}

