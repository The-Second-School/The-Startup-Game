// The host's phone app. Mirrors the big screen's state and sends actions back. Rendered at /#/admin.
import { lazy, Suspense, useEffect } from 'react';
import { useAdmin } from '../store/adminStore';
import './admin.css';
import Shell from './Shell';

// Dev-only: /#/admin-preview?step=auction fakes a game state so every panel can be checked without the big screen.
const Preview = import.meta.env.DEV ? lazy(() => import('./Preview')) : null;
const HostSim = import.meta.env.DEV ? lazy(() => import('./HostSim')) : null;

function Live() {
  const state = useAdmin(s => s.state);
  const room = useAdmin(s => s.room);
  const send = useAdmin(s => s.send);
  const link = useAdmin(s => s.link);
  const realtime = useAdmin(s => s.realtime);

  useEffect(() => { useAdmin.getState().connect(); }, []);

  const connected = state !== null && link === 'connected';
  return <Shell state={state} send={send} room={room} connected={connected} link={link} realtime={realtime} />;
}

export default function AdminApp() {
  if (Preview && location.hash.startsWith('#/admin-preview')) {
    return <Suspense fallback={null}><Preview /></Suspense>;
  }
  if (HostSim && location.hash.startsWith('#/admin-hostsim')) return <Suspense fallback={null}><HostSim /></Suspense>;
  return <Live />;
}
