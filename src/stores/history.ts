import { buildSnapshots, parseFormula } from '../engine/cubeMoves';
import type { Move } from '../engine/cubeMoves';
import { getFaceletKey } from '../engine/cubeState';

const storageKey = 'cubex.history.v1';
export const historyLimit = 20;

export type HistoryEntry = {
  id: string;
  formula: string;
  length: number;
  createdAt: string;
  state: { format: 'solved-prefix-v1'; facelets: string };
};

export function makeHistoryEntry(moves: readonly Move[], facelets: string): HistoryEntry {
  const bytes = globalThis.crypto.getRandomValues(new Uint32Array(4));
  return {
    id: Array.from(bytes, (part) => part.toString(16).padStart(8, '0')).join(''),
    formula: moves.join(' '),
    length: moves.length,
    createdAt: new Date().toISOString(),
    state: { format: 'solved-prefix-v1', facelets },
  };
}

export function restoreHistoryEntry(entry: HistoryEntry) {
  const moves = parseFormula(entry.formula);
  if (entry.state.format !== 'solved-prefix-v1' || moves.length !== entry.length || moves.length > 25 || !moves.length) {
    throw new Error('This history entry has an invalid state format.');
  }
  const snapshots = buildSnapshots(moves);
  if (getFaceletKey(snapshots.at(-1)!) !== entry.state.facelets) {
    throw new Error('The formula and saved cube state do not match.');
  }
  return { moves, snapshots };
}

export function readHistory(storage?: Storage): HistoryEntry[] {
  try {
    storage ??= globalThis.localStorage;
    const saved: unknown = JSON.parse(storage.getItem(storageKey) ?? '[]');
    if (!Array.isArray(saved)) return [];
    return saved.slice(0, historyLimit).filter((entry: HistoryEntry) => {
      try {
        if (typeof entry.id !== 'string' || !Number.isFinite(Date.parse(entry.createdAt))) return false;
        restoreHistoryEntry(entry);
        return true;
      } catch {
        return false;
      }
    });
  } catch {
    return [];
  }
}

export function saveHistory(entries: readonly HistoryEntry[], storage: Storage = globalThis.localStorage) {
  storage.setItem(storageKey, JSON.stringify(entries.slice(0, historyLimit)));
}
