// Sync between the big screen (host, owns the game state) and the host phones.
//
// Transport A: Supabase Realtime BROADCAST (works across devices; no tables, no auth, anon key only).
//              On when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set at build time.
// Transport B: BroadcastChannel (same browser only): instant fallback / accelerator, always on.
//
// Both carry the same messages. The big screen is authoritative: phones send actions, the screen reduces them
// and broadcasts the full state. Receivers must tolerate duplicates (the same message can arrive over A and B).

import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import type { Action, GameState } from '../game/types';

export type HostAction = Action | { type: 'UNDO' };

export type Msg =
  /** Phone to screen. `need` = I have no (or stale) state, send it now. Doubles as the phone's presence heartbeat. */
  | { kind: 'hello'; from: string; need: boolean }
  /** Phone to screen. `id` is unique per action; `step` is the step the phone was looking at when it tapped. */
  | { kind: 'action'; action: HostAction; from: string; id: string; step: number }
  /** Screen to phones. Full state. `sid` identifies one screen session, `v` increases on every state change. */
  | { kind: 'state'; state: GameState; from: string; now: number; sid: string; v: number }
  /** Screen to phones, every ~2 s. Tiny liveness ping that also tells phones whether they are up to date. */
  | { kind: 'beat'; from: string; now: number; sid: string; v: number };

export type Link = 'local' | 'connecting' | 'online' | 'reconnecting';

export interface Channel {
  /** `urgent` jumps the outgoing queue (used for replying to a newly joined phone). */
  send(msg: Msg, opts?: { urgent?: boolean }): void;
  onMessage(fn: (msg: Msg) => void): () => void;
  /** Transport state of the internet link. 'local' = no Supabase configured (same-browser only). */
  link(): Link;
  onLink(fn: (l: Link) => void): () => void;
  /** Drop and re-create the realtime subscription (phone woke up, wifi came back, watchdog fired). */
  reconnect(): void;
  close(): void;
}

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const VSN = import.meta.env.VITE_SUPABASE_VSN as string | undefined; // test hook only
export const hasRealtime = Boolean(URL && KEY);

/** Hard cap on messages sent to Supabase per second (their free tier allows 10 events/s per client by default). */
const MAX_PER_SEC = 8;
const GAP = Math.ceil(1000 / MAX_PER_SEC);

export function openChannel(room: string): Channel {
  const listeners = new Set<(m: Msg) => void>();
  const linkFns = new Set<(l: Link) => void>();
  const emit = (m: Msg) => listeners.forEach(fn => fn(m));
  let closed = false;

  // ---- Same-browser transport
  const bc = 'BroadcastChannel' in globalThis ? new BroadcastChannel(`startup-game-${room}`) : null;
  bc?.addEventListener('message', e => emit(e.data as Msg));

  // ---- Link state
  let link: Link = hasRealtime ? 'connecting' : 'local';
  const setLink = (l: Link) => { if (l === link) return; link = l; linkFns.forEach(fn => fn(l)); };

  // ---- Throttled outgoing queue (Supabase only). BC is free and goes out immediately.
  // Newer `state` replaces an older queued `state` (coalescing); everything else is FIFO; `urgent` goes first.
  const queue: Msg[] = [];
  let lastSent = 0;
  let pump: ReturnType<typeof setTimeout> | undefined;
  const drain = () => {
    pump = undefined;
    if (closed || !rt || link !== 'online') { return; }
    const wait = lastSent + GAP - Date.now();
    if (wait > 0) { pump = setTimeout(drain, wait); return; }
    const m = queue.shift();
    if (!m) return;
    lastSent = Date.now();
    void rt.send({ type: 'broadcast', event: 'm', payload: m }).catch(() => { /* link watchdog handles recovery */ });
    if (queue.length) pump = setTimeout(drain, GAP);
  };
  const enqueue = (m: Msg, urgent: boolean) => {
    if (m.kind === 'state') { const i = queue.findIndex(q => q.kind === 'state'); if (i >= 0) queue.splice(i, 1); }
    if (m.kind === 'beat') { const i = queue.findIndex(q => q.kind === 'beat'); if (i >= 0) queue.splice(i, 1); }
    if (urgent) queue.unshift(m); else queue.push(m);
    if (queue.length > 40) queue.splice(0, queue.length - 40);
    if (!pump) pump = setTimeout(drain, 0);
  };

  // ---- Supabase Realtime
  let client: SupabaseClient | null = null;
  let rt: RealtimeChannel | null = null;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let attempt = 0;

  const resubscribe = () => {
    if (closed || !client) return;
    clearTimeout(retry);
    if (rt) { const old = rt; rt = null; void client.removeChannel(old); }
    setLink(attempt === 0 && link === 'connecting' ? 'connecting' : 'reconnecting');
    const mine = client.channel(`sg-v1-${room}`, { config: { broadcast: { self: false, ack: false } } });
    rt = mine;
    mine.on('broadcast', { event: 'm' }, ({ payload }) => emit(payload as Msg));
    mine.subscribe(status => {
      if (rt !== mine || closed) return;
      if (status === 'SUBSCRIBED') { attempt = 0; setLink('online'); if (queue.length && !pump) pump = setTimeout(drain, 0); return; }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        setLink('reconnecting');
        clearTimeout(retry);
        retry = setTimeout(resubscribe, Math.min(5000, 800 * 2 ** attempt++));
      }
    });
  };

  if (hasRealtime) {
    // The Supabase client is loaded on demand (and dead-code-eliminated from builds without env vars).
    void import('@supabase/supabase-js').then(({ createClient }) => {
      if (closed) return;
      client = createClient(URL!, KEY!, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        realtime: { params: { eventsPerSecond: 10 }, ...(VSN ? { vsn: VSN as '1.0.0' } : {}) },
      });
      resubscribe();
    });
  }

  return {
    send(msg, opts) {
      bc?.postMessage(msg);
      if (hasRealtime) enqueue(msg, !!opts?.urgent);
    },
    onMessage(fn) { listeners.add(fn); return () => { listeners.delete(fn); }; },
    link: () => link,
    onLink(fn) { linkFns.add(fn); return () => { linkFns.delete(fn); }; },
    reconnect() { if (hasRealtime && !closed) { attempt = 0; resubscribe(); } },
    close() {
      closed = true;
      clearTimeout(retry); clearTimeout(pump);
      bc?.close();
      if (client) { void client.removeAllChannels(); void client.realtime.disconnect(); }
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Room: one fixed room for the whole game. No pairing, no codes. ?room=xyz overrides it (testing only).

export const DEFAULT_ROOM = 'tss-main';

export function currentRoom(): string {
  const hash = location.hash;
  const q = hash.includes('?') ? new URLSearchParams(hash.slice(hash.indexOf('?') + 1)).get('room') : null;
  const raw = q ?? new URLSearchParams(location.search).get('room');
  const c = (raw ?? '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
  return c || DEFAULT_ROOM;
}

/** True when the page is served from an admin.* hostname (phone admin at the root path). */
export const isAdminHost = () => location.hostname.startsWith('admin.');

/** Short admin address to show on the big screen. */
export function adminAddress(): string {
  const h = location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(h)) return `${location.host}/#/admin`;
  return h.startsWith('admin.') ? h : `admin.${location.host}`;
}
