import { create } from 'zustand';
import { buildSnapshots, parseFormula } from '../engine/cubeMoves';
import type { Move } from '../engine/cubeMoves';
import { getFaceletKey } from '../engine/cubeState';
import type { CubeState } from '../engine/cubeState';
import { generateRandomMoves } from '../engine/scrambleGenerator';
import type { ScrambleLength } from '../engine/scrambleGenerator';
import { historyLimit, makeHistoryEntry, readHistory, restoreHistoryEntry, saveHistory } from './history';
import type { HistoryEntry } from './history';

export const playbackSpeeds = [0.5, 1, 2, 4] as const;
export type PlaybackSpeed = (typeof playbackSpeeds)[number];
export type Playback = { cursor: number; fraction: number; playing: boolean };

type Store = Playback & {
  moves: Move[];
  snapshots: CubeState[];
  length: ScrambleLength;
  speed: PlaybackSpeed;
  sound: boolean;
  history: HistoryEntry[];
  selectedId: string | null;
  setLength: (length: ScrambleLength) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  setSound: (sound: boolean) => void;
  generate: () => boolean;
  load: (entry: HistoryEntry) => void;
  clearHistory: () => boolean;
  togglePlay: () => void;
  restart: () => void;
  seek: (cursor: number) => void;
  step: (direction: -1 | 1) => void;
  advance: (milliseconds: number) => void;
};

const starterMoves = parseFormula("R U2 F' L2 D B2 R' F2 U' L B D2 R2 U F2 D' L2 B' U2 R");
const starterSnapshots = buildSnapshots(starterMoves);

function readSound() {
  try { return localStorage.getItem('cubex.sound') === 'on'; }
  catch { return false; }
}

function atBoundary(cursor: number): Playback {
  return { cursor, fraction: 0, playing: false };
}

export const useCubeStore = create<Store>((set, get) => ({
  ...atBoundary(starterMoves.length),
  moves: starterMoves,
  snapshots: starterSnapshots,
  length: 20,
  speed: 1,
  sound: readSound(),
  history: typeof window === 'undefined' ? [] : readHistory(),
  selectedId: null,
  setLength: (length) => set({ length }),
  setSpeed: (speed) => set({ speed }),
  setSound: (sound) => {
    set({ sound });
    try { localStorage.setItem('cubex.sound', sound ? 'on' : 'off'); }
    catch { /* Sound remains available for this session. */ }
  },
  generate: () => {
    const { length, history } = get();
    const moves = generateRandomMoves(length);
    const snapshots = buildSnapshots(moves);
    const entry = makeHistoryEntry(moves, getFaceletKey(snapshots.at(-1)!));
    const entries = [entry, ...history].slice(0, historyLimit);
    set({ moves, snapshots, history: entries, selectedId: entry.id, ...atBoundary(moves.length) });
    try { saveHistory(entries); return true; }
    catch { return false; }
  },
  load: (entry) => {
    const { moves, snapshots } = restoreHistoryEntry(entry);
    set({ moves, snapshots, selectedId: entry.id, ...atBoundary(moves.length) });
  },
  clearHistory: () => {
    set({ history: [], selectedId: null });
    try { saveHistory([]); return true; }
    catch { return false; }
  },
  togglePlay: () => set((state) => {
    if (state.playing) return { playing: false };
    if (state.cursor === state.moves.length) return { ...atBoundary(0), playing: true };
    return { playing: true };
  }),
  restart: () => set({ ...atBoundary(0), playing: true }),
  seek: (cursor) => set((state) => atBoundary(Math.min(state.moves.length, Math.max(0, Math.round(cursor))))),
  step: (direction) => {
    const { cursor, fraction, seek } = get();
    seek(direction < 0 && fraction > 0 ? cursor : cursor + direction);
  },
  advance: (milliseconds) => set(({ cursor, fraction, speed, moves, playing }) => {
    if (!playing) return {};
    fraction += milliseconds * speed / 400;
    while (fraction >= 1) {
      cursor++;
      if (cursor >= moves.length) return atBoundary(moves.length);
      fraction -= 1;
    }
    return { cursor, fraction };
  }),
}));
