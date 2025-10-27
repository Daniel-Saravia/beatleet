"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SetDoc, SetsState, StudyState, Card, ImportSetJson } from "./types";
import { v4 as uuidv4 } from "uuid";

type AppState = {
  sets: SetsState;
  study: StudyState;
  upsertSet: (doc: Omit<SetDoc, "id"> & { id?: string }) => string; // returns id
  deleteSet: (id: string) => void;
  resetProgress: (id: string) => void;
  markLearned: (setId: string, cardId: string) => void;
  importSetJson: (input: ImportSetJson) => string;
};

function ensureCardIds(cards: Array<Partial<Card> & { front: string; back: string }>): Card[] {
  return cards.map((c) => ({ id: c.id || uuidv4(), front: c.front!, back: c.back!, hint: c.hint }));
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      sets: { byId: {}, allIds: [] },
      study: {},
      upsertSet: (doc) => {
        const id = doc.id || uuidv4();
        const full: SetDoc = {
          id,
          title: doc.title,
          description: doc.description,
          cards: ensureCardIds(doc.cards),
        };
        set((state) => {
          const exists = !!state.sets.byId[id];
          const byId = { ...state.sets.byId, [id]: full };
          const allIds = exists ? state.sets.allIds : [...state.sets.allIds, id];
          return { sets: { byId, allIds } } as Partial<AppState>;
        });
        return id;
      },
      deleteSet: (id) =>
        set((state) => {
          const { [id]: _omit, ...rest } = state.sets.byId;
          const allIds = state.sets.allIds.filter((x) => x !== id);
          const study = { ...state.study };
          delete study[id];
          return { sets: { byId: rest, allIds }, study } as Partial<AppState>;
        }),
      resetProgress: (id) =>
        set((state) => ({
          study: { ...state.study, [id]: { learned: {}, updatedAt: new Date().toISOString() } },
        })),
      markLearned: (setId, cardId) =>
        set((state) => {
          const current = state.study[setId] || { learned: {}, updatedAt: new Date().toISOString() };
          const learned = { ...current.learned, [cardId]: true };
          return {
            study: { ...state.study, [setId]: { learned, updatedAt: new Date().toISOString() } },
          } as Partial<AppState>;
        }),
      importSetJson: (input) => {
        if (!input.title || !Array.isArray(input.cards) || input.cards.length === 0) {
          throw new Error("Invalid deck: title and at least one card required");
        }
        const id = input.id || uuidv4();
        const setDoc: SetDoc = {
          id,
          title: input.title,
          description: input.description,
          cards: ensureCardIds(input.cards),
        };
        set((state) => {
          const exists = !!state.sets.byId[id];
          const byId = { ...state.sets.byId, [id]: setDoc };
          const allIds = exists ? state.sets.allIds : [...state.sets.allIds, id];
          return { sets: { byId, allIds } } as Partial<AppState>;
        });
        return id;
      },
    }),
    {
      name: "fc:app",
      version: 1,
      partialize: (state) => ({ sets: state.sets, study: state.study }),
    }
  )
);


