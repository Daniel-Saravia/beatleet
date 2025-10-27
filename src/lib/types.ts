export type Card = { id: string; front: string; back: string; hint?: string };
export type SetDoc = { id: string; title: string; description?: string; cards: Card[] };

export type SetsState = { byId: Record<string, SetDoc>; allIds: string[] };
export type StudyState = { [setId: string]: { learned: Record<string, boolean>; updatedAt: string } };

export type ImportSetJson = {
  id?: string;
  title: string;
  description?: string;
  cards: Array<Partial<Card> & { front: string; back: string }>;
};

