import { StrictMode, useEffect, useState, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/baloo-2/600.css';
import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/800.css';
import './ui/theme.css';
import './perf.css';
// Each route is its own chunk: the phone never downloads the big-screen scenes and vice versa.
// Loaded into state (not React.lazy) so first paint is not held back by Suspense's 300 ms reveal throttle.
const routes = { admin: () => import('./admin/AdminApp'), screen: () => import('./screen/ScreenApp') };
void routes[location.hash.startsWith('#/admin') ? 'admin' : 'screen']() // start fetching the route chunk before React mounts

function Root() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => { const f = () => setHash(location.hash); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  const admin = hash.startsWith('#/admin');
  const [view, setView] = useState<{ admin: boolean; C: ComponentType } | null>(null);
  useEffect(() => { document.body.dataset.app = admin ? 'admin' : 'screen'; }, [admin]);
  useEffect(() => {
    let live = true;
    void routes[admin ? 'admin' : 'screen']().then(m => { if (live) setView({ admin, C: m.default }); });
    return () => { live = false; };
  }, [admin]);
  return view && view.admin === admin ? <view.C /> : null;
}

// Block browser gestures that break a single-touch kiosk (long-press menu, pinch zoom on old browsers)
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('gesturestart', e => e.preventDefault());

createRoot(document.getElementById('root')!).render(<StrictMode><Root /></StrictMode>);

if (import.meta.env.DEV) {
  void Promise.all([import('./store/screenStore'), import('./game/helpers'), import('./game/engine'), import('./game/content')]).then(([s, h, e, c]) => {
    (window as unknown as Record<string, unknown>).__sg = { useScreen: s.useScreen, SCRIPT: c.SCRIPT, ...h, ...e };
  });
}
