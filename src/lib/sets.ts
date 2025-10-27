"use client";
import { storage, LS_KEYS } from "./storage";
import { Card, SetDoc, SetsState } from "./types";
import { v4 as uuidv4 } from "uuid";

// Lightweight helpers to manage sets in localStorage

const EMPTY: SetsState = { byId: {}, allIds: [] };

export function loadSets(): SetsState {
  return storage.get<SetsState>(LS_KEYS.sets, EMPTY);
}

export function saveSets(next: SetsState) {
  storage.set(LS_KEYS.sets, next);
}

export function upsertSet(doc: Omit<SetDoc, "id"> & { id?: string }): SetDoc {
  const sets = loadSets();
  const id = doc.id || uuidv4();
  const full: SetDoc = { id, title: doc.title, description: doc.description, cards: withIds(doc.cards) };
  const exists = !!sets.byId[id];
  const byId = { ...sets.byId, [id]: full };
  const allIds = exists ? sets.allIds : [...sets.allIds, id];
  const next = { byId, allIds };
  saveSets(next);
  return full;
}

export function deleteSet(id: string) {
  const sets = loadSets();
  if (!sets.byId[id]) return;
  const { [id]: _omit, ...rest } = sets.byId;
  const next = { byId: rest, allIds: sets.allIds.filter(x => x !== id) };
  saveSets(next);
}

function withIds(cards: Card[]): Card[] {
  return cards.map((c) => ({ id: c.id || uuidv4(), front: c.front, back: c.back, hint: c.hint }));
}

