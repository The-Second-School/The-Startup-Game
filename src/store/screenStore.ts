// Big screen store: owns the game state, saves it, keeps an undo stack, mirrors to the admin phone.

import { create } from 'zustand';
import { initialState, reduce } from '../game/engine';
import type { Action, GameState } from '../game/types';
import { openChannel, roomCode, type Channel } from '../sync/channel';

const SAVE_KEY = 'sg-state-v1';
const ME = `screen-${Math.random().toString(36).slice(2, 7)}`;

function load(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) { const s = JSON.parse(raw) as GameState; if (s.version === 1) return s; }
  } catch { /* ignore */ }
  return initialState();
}

// Persist + broadcast are coalesced: a burst of actions in one tick sends one message, and storage is written
// at most every SAVE_MS (plus a flush when the tab hides or closes) so JSON.stringify never runs per tap.
const SAVE_MS = 400;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let pendingSave: GameState | null = null;
function flushSave() {
  clearTimeout(saveTimer); saveTimer = undefined;
  if (!pendingSave) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(pendingSave)); } catch { /* ignore */ }
  pendingSave = null;
}
function scheduleSave(s: GameState) {
  pendingSave = s;
  saveTimer ??= setTimeout(flushSave, SAVE_MS);
}
addEventListener('pagehide', flushSave);
addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushSave(); });

let sendQueued = false;
function scheduleBroadcast(get: () => ScreenStore, me: string) {
  if (sendQueued) return;
  sendQueued = true;
  queueMicrotask(() => {
    sendQueued = false;
    const { channel, state } = get();
    channel?.send({ kind: 'state', state, from: me, now: Date.now() });
  });
}

interface ScreenStore {
  state: GameState;
  past: GameState[];
  room: string;
  channel: Channel | null;
  dispatch: (a: Action | { type: 'UNDO' }) => void;
  connect: () => void;
}

export const useScreen = create<ScreenStore>((set, get) => ({
  state: load(),
  past: [],
  room: roomCode(),
  channel: null,
  dispatch: a => {
    const { state, past, channel } = get();
    let next: GameState;
    let nextPast = past;
    if (a.type === 'UNDO') {
      if (!past.length) return;
      next = past[past.length - 1];
      nextPast = past.slice(0, -1);
    } else {
      next = reduce(state, a);
      if (next === state) return;
      // Selecting a team is not worth an undo entry
      if (a.type !== 'SELECT_TEAM' && !a.type.startsWith('TIMER')) nextPast = [...past.slice(-60), state];
    }
    set({ state: next, past: nextPast });
    scheduleSave(next);
    if (channel) scheduleBroadcast(get, ME);
  },
  connect: () => {
    if (get().channel) return;
    const channel = openChannel(get().room);
    channel.onMessage(m => {
      if (m.kind === 'action') get().dispatch(m.action);
      if (m.kind === 'hello') channel.send({ kind: 'state', state: get().state, from: ME, now: Date.now() });
    });
    set({ channel });
    channel.send({ kind: 'state', state: get().state, from: ME, now: Date.now() });
  },
}));
