"use client";
import { storage, LS_KEYS } from "./storage";
import { StudyState } from "./types";

const EMPTY: StudyState = {};

export function loadStudy(): StudyState {
  return storage.get<StudyState>(LS_KEYS.state, EMPTY);
}

export function saveStudy(state: StudyState) {
  storage.set(LS_KEYS.state, state);
}

export function getLearned(setId: string): Record<string, boolean> {
  const s = loadStudy();
  return s[setId]?.learned || {};
}

export function markLearned(setId: string, cardId: string) {
  const s = loadStudy();
  const entry = s[setId] || { learned: {}, updatedAt: new Date().toISOString() };
  entry.learned[cardId] = true;
  entry.updatedAt = new Date().toISOString();
  const next = { ...s, [setId]: entry };
  saveStudy(next);
}

export function resetProgress(setId: string) {
  const s = loadStudy();
  if (!s[setId]) return;
  const next = { ...s };
  next[setId] = { learned: {}, updatedAt: new Date().toISOString() };
  saveStudy(next);
}

