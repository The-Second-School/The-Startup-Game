// Big screen store: owns the game state, saves it, keeps an undo stack, mirrors to the admin phone.

import { create } from 'zustand';
import { initialState, reduce } from '../game/engine';
import type { Action, GameState } from '../game/types';
import { currentRoom, hasRealtime, openChannel, type Channel, type Link } from '../sync/channel';

const SAVE_KEY = 'sg-state-v1';
const ME = `screen-${Math.random().toString(36).slice(2, 7)}`;
// One id per screen page-load: phones use it to tell a restarted screen from an old one. `version` only ever goes up.
const SID = Math.random().toString(36).slice(2, 10);
let version = 1;
const seenActions: string[] = [];
const phoneSeen = new Map<string, number>();
const PHONE_TTL = 8000;

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
    version++;
    channel?.send({ kind: 'state', state, from: me, now: Date.now(), sid: SID, v: version });
  });
}

interface ScreenStore {
  state: GameState;
  past: GameState[];
  room: string;
  link: Link;
  phones: number;
  channel: Channel | null;
  dispatch: (a: Action | { type: 'UNDO' }) => void;
  connect: () => void;
}

export const useScreen = create<ScreenStore>((set, get) => ({
  state: load(),
  past: [],
  room: currentRoom(),
  link: hasRealtime ? 'connecting' : 'local',
  phones: 0,
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
    const sendState = (urgent: boolean) => channel.send({ kind: 'state', state: get().state, from: ME, now: Date.now(), sid: SID, v: version }, { urgent });
    const touchPhone = (id: string) => {
      const known = phoneSeen.has(id);
      phoneSeen.set(id, Date.now());
      if (!known) set({ phones: phoneSeen.size });
    };
    channel.onMessage(m => {
      if (m.kind === 'hello') { touchPhone(m.from); if (m.need) sendState(true); return; }
      if (m.kind !== 'action') return;
      touchPhone(m.from);
      // Duplicate (same action over two transports, or a retry) or stale (NEXT tapped on a step that is already over).
      if (seenActions.includes(m.id)) return;
      seenActions.push(m.id); if (seenActions.length > 300) seenActions.splice(0, 100);
      if (m.action.type === 'NEXT' && m.step !== get().state.stepIndex) { sendState(true); return; }
      get().dispatch(m.action);
    });
    channel.onLink(l => {
      set({ link: l });
      if (l === 'online') sendState(false); // phones that joined first get the state as soon as we are reachable
    });
    set({ channel });
    sendState(false);
    // Tiny liveness ping so phones know the screen is alive and whether they are up to date; also prunes gone phones.
    setInterval(() => {
      channel.send({ kind: 'beat', from: ME, now: Date.now(), sid: SID, v: version });
      const cutoff = Date.now() - PHONE_TTL;
      for (const [k, t] of phoneSeen) if (t < cutoff) phoneSeen.delete(k);
      if (phoneSeen.size !== get().phones) set({ phones: phoneSeen.size });
    }, 2000);
  },
}));
