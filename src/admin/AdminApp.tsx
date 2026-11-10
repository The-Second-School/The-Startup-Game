// The host's phone app. Mirrors the big screen's state and sends actions back. Rendered at /#/admin.
import { lazy, Suspense, useEffect } from 'react';
import { useAdmin } from '../store/adminStore';
import './admin.css';
import { useNow } from './kit';
import Shell from './Shell';

// Dev-only: /#/admin-preview?step=auction fakes a game state so every panel can be checked without the big screen.
const Preview = import.meta.env.DEV ? lazy(() => import('./Preview')) : null;
const HostSim = import.meta.env.DEV ? lazy(() => import('./HostSim')) : null;

function Live() {
  const state = useAdmin(s => s.state);
  const lastSeen = useAdmin(s => s.lastSeen);
  const room = useAdmin(s => s.room);
  const send = useAdmin(s => s.send);
  const now = useNow(500);

  useEffect(() => {
    useAdmin.getState().connect();
    // Heartbeat: the screen answers every hello with its full state, which keeps the green dot honest.
    const id = setInterval(() => useAdmin.getState().channel?.send({ kind: 'hello', from: 'admin-ui' }), 2000);
    return () => clearInterval(id);
  }, []);

  const connected = state !== null && now - lastSeen < 4000;
  return <Shell state={state} send={send} room={room} connected={connected} />;
}

export default function AdminApp() {
  if (Preview && location.hash.startsWith('#/admin-preview')) {
    return <Suspense fallback={null}><Preview /></Suspense>;
  }
  if (HostSim && location.hash.startsWith('#/admin-hostsim')) return <Suspense fallback={null}><HostSim /></Suspense>;
  return <Live />;
}
