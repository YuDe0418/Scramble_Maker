import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSnapshots, parseFormula } from '../engine/cubeMoves';
import { getFaceletKey } from '../engine/cubeState';
import { useCubeStore } from './cubeStore';
import { makeHistoryEntry, readHistory, restoreHistoryEntry, saveHistory } from './history';

const moves = parseFormula("F' R U2 L B2 D R' F2 U' L2");
const snapshots = buildSnapshots(moves);
const initialState = useCubeStore.getInitialState();

beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  useCubeStore.setState({ ...initialState, moves, snapshots, cursor: moves.length }, true);
});

afterEach(() => vi.unstubAllGlobals());

describe('playback and history', () => {
  it('starts from the solved state, freezes mid-turn, and finishes at the exact final snapshot', () => {
    const { togglePlay, advance } = useCubeStore.getState();
    togglePlay();
    expect(useCubeStore.getState().cursor).toBe(0);
    advance(150);
    togglePlay();
    advance(400);
    expect(useCubeStore.getState()).toMatchObject({ cursor: 0, fraction: 0.375, playing: false });
    togglePlay();
    advance(3990);
    const result = useCubeStore.getState();
    expect(result).toMatchObject({ cursor: moves.length, fraction: 0, playing: false });
    expect(result.snapshots[result.cursor]).toEqual(snapshots.at(-1));
  });

  it('jumps to boundaries on step or seek and cancels the unfinished turn', () => {
    const { advance, restart, seek, step, togglePlay } = useCubeStore.getState();
    restart();
    advance(900);
    expect(useCubeStore.getState()).toMatchObject({ cursor: 2, fraction: 0.25 });
    step(-1);
    expect(useCubeStore.getState()).toMatchObject({ cursor: 2, fraction: 0, playing: false });
    step(-1);
    expect(useCubeStore.getState().cursor).toBe(1);
    togglePlay();
    advance(125);
    step(1);
    expect(useCubeStore.getState()).toMatchObject({ cursor: 2, fraction: 0, playing: false });
    seek(moves.length + 2);
    expect(useCubeStore.getState().cursor).toBe(moves.length);
  });

  it('rebuilds all saved cubie positions and orientations from the stored formula', () => {
    const entry = makeHistoryEntry(moves, getFaceletKey(snapshots.at(-1)!));
    saveHistory([entry]);
    const [reloaded] = readHistory();
    expect(reloaded).toEqual(entry);
    useCubeStore.getState().seek(0);
    useCubeStore.getState().load(reloaded);
    expect(useCubeStore.getState()).toMatchObject({ moves, snapshots, cursor: moves.length, selectedId: entry.id });
  });

  it('ignores corrupted or mismatched entries while preserving valid entries', () => {
    const entry = makeHistoryEntry(moves, getFaceletKey(snapshots.at(-1)!));
    const corrupt = { ...entry, state: { ...entry.state, facelets: 'invalid' } };
    expect(() => restoreHistoryEntry(corrupt)).toThrow(/do not match/);
    saveHistory([corrupt, entry]);
    expect(readHistory()).toEqual([entry]);
  });

  it('keeps the most recent twenty generated entries and clears saved history', () => {
    const { generate, clearHistory, setLength } = useCubeStore.getState();
    setLength(18);
    for (let i = 0; i < 22; i++) expect(generate()).toBe(true);
    const state = useCubeStore.getState();
    expect(state.history).toHaveLength(20);
    expect(state.history[0].id).toBe(state.selectedId);
    expect(state.history[0].formula).toBe(state.moves.join(' '));
    expect(readHistory()).toEqual(state.history);
    clearHistory();
    expect(readHistory()).toEqual([]);
    expect(useCubeStore.getState().history).toEqual([]);
  });
});
