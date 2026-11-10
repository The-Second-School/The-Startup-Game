// Sync between the big screen (host, owns the game state) and the admin phone.
// Transport 1: BroadcastChannel (same browser, other tab) — always on, zero setup.
// Transport 2: Supabase Realtime broadcast — on when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set.

import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Action, GameState } from '../game/types';

export type Msg =
  | { kind: 'action'; action: Action | { type: 'UNDO' }; from: string }
  | { kind: 'state'; state: GameState; from: string; now: number }
  | { kind: 'hello'; from: string };

export interface Channel {
  send(msg: Msg): void;
  onMessage(fn: (msg: Msg) => void): () => void;
  status(): 'local' | 'online' | 'connecting';
  close(): void;
}

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function openChannel(room: string): Channel {
  const listeners = new Set<(m: Msg) => void>();
  const emit = (m: Msg) => listeners.forEach(fn => fn(m));
  const bc = 'BroadcastChannel' in window ? new BroadcastChannel(`startup-game-${room}`) : null;
  bc?.addEventListener('message', e => emit(e.data as Msg));

  let rt: RealtimeChannel | null = null;
  let online = false;
  let connecting = false;
  if (URL && KEY) {
    // Supabase is only fetched when the env vars are set (otherwise this branch is dead-code-eliminated from the build).
    connecting = true;
    void import('@supabase/supabase-js').then(({ createClient }) => {
      const client = createClient(URL, KEY, { realtime: { params: { eventsPerSecond: 20 } } });
      rt = client.channel(`startup-game-${room}`, { config: { broadcast: { self: false, ack: false } } });
      rt.on('broadcast', { event: 'msg' }, ({ payload }) => emit(payload as Msg));
      rt.subscribe(status => { online = status === 'SUBSCRIBED'; });
    });
  }

  return {
    send(msg) {
      bc?.postMessage(msg);
      if (rt && online) void rt.send({ type: 'broadcast', event: 'msg', payload: msg });
    },
    onMessage(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    status() { return connecting ? (online ? 'online' : 'connecting') : 'local'; },
    close() { bc?.close(); void rt?.unsubscribe(); },
  };
}

/** Short room code shared by screen and phone (from URL ?room=, else saved, else new). */
export function roomCode(): string {
  const fromUrl = new URLSearchParams(location.search).get('room');
  if (fromUrl) { localStorage.setItem('sg-room', fromUrl.toUpperCase()); return fromUrl.toUpperCase(); }
  const saved = localStorage.getItem('sg-room');
  if (saved) return saved;
  const code = Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join('');
  localStorage.setItem('sg-room', code);
  return code;
}
