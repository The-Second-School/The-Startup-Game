// Admin phone store: mirrors the screen's state (the screen is the only source of truth), sends actions to it.

import { create } from 'zustand';
import type { GameState } from '../game/types';
import { currentRoom, hasRealtime, openChannel, type Channel, type HostAction } from '../sync/channel';

const ME = `admin-${Math.random().toString(36).slice(2, 7)}`;
let actionSeq = 0;
const STALE_MS = 7000;

/** connecting = never heard from the screen yet; connected = heard within STALE_MS; reconnecting = we had it and lost it. */
export type PhoneLink = 'connecting' | 'connected' | 'reconnecting';

interface AdminStore {
  state: GameState | null;
  sid: string;
  v: number;
  lastSeen: number;          // ms timestamp of last message from the screen
  clockOffset: number;       // screen clock minus phone clock (ms). Use screenNow() for timers
  room: string;
  link: PhoneLink;
  realtime: boolean;         // false = no Supabase configured: only works in the same browser as the screen
  channel: Channel | null;
  send: (a: HostAction) => void;
  connect: () => void;
}

export const useAdmin = create<AdminStore>((set, get) => ({
  state: null,
  sid: '',
  v: 0,
  lastSeen: 0,
  clockOffset: 0,
  room: currentRoom(),
  link: 'connecting',
  realtime: hasRealtime,
  channel: null,
  send: a => {
    const { channel, state } = get();
    channel?.send({ kind: 'action', action: a, from: ME, id: `${ME}-${++actionSeq}`, step: state?.stepIndex ?? -1 });
  },
  connect: () => {
    if (get().channel) return;
    const channel = openChannel(get().room);
    const heard = (now: number) => set({ lastSeen: Date.now(), clockOffset: now - Date.now() });
    channel.onMessage(m => {
      if (m.kind === 'state') {
        const cur = get();
        // Same screen session: only accept newer (or equal, harmless) versions. New session id: always accept.
        if (cur.sid === m.sid && m.v < cur.v) { heard(m.now); return; }
        if (cur.sid === m.sid && m.v === cur.v && cur.state) { heard(m.now); return; }
        set({ state: m.state, sid: m.sid, v: m.v, lastSeen: Date.now(), clockOffset: m.now - Date.now() });
      } else if (m.kind === 'beat') {
        heard(m.now);
        const cur = get();
        if (cur.sid !== m.sid || cur.v !== m.v) channel.send({ kind: 'hello', from: ME, need: true });
      }
    });
    set({ channel });

    // Hello loop: ask for the state every second until we have it (the screen may open after the phone), then
    // fall back to a slow presence heartbeat. If the link goes quiet, ask again and rebuild the subscription.
    let lastHello = 0, lastRebuild = 0;
    const refresh = () => {
      const { state, lastSeen } = get();
      const age = Date.now() - lastSeen;
      const stale = !state || age > STALE_MS;
      const link: PhoneLink = !state ? 'connecting' : age > STALE_MS ? 'reconnecting' : 'connected';
      if (link !== get().link) set({ link });
      const gap = stale ? 1000 : 3000;
      if (Date.now() - lastHello >= gap) { lastHello = Date.now(); channel.send({ kind: 'hello', from: ME, need: stale }); }
      if (hasRealtime && stale && age > 10000 && Date.now() - lastRebuild > 10000) { lastRebuild = Date.now(); channel.reconnect(); }
    };
    setInterval(refresh, 500);
    refresh();
    const wake = () => {
      if (document.visibilityState === 'hidden') return;
      lastHello = 0; lastRebuild = Date.now();
      channel.reconnect();
      channel.send({ kind: 'hello', from: ME, need: true });
    };
    document.addEventListener('visibilitychange', wake);
    addEventListener('online', wake);
    addEventListener('pageshow', wake);
  },
}));

/** The big screen's clock, as seen from the phone. Pass to timerRemaining(state, screenNow()). */
export const screenNow = () => Date.now() + useAdmin.getState().clockOffset;
