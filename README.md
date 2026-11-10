# The Startup Game (The Second School)

Big screen: `/#/` (1920x1080, scaled to fit). Host phone: `/#/admin` (scan the QR on the lobby screen).

## Run
- `npm install` then `npm run dev` (testing) or `npm run build && npm run preview` (event day).
- Same browser: screen and phone sync via BroadcastChannel. Two devices: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`) so the phone syncs through Supabase Realtime.
- Keyboard fallback on the big screen: Space = Next, Backspace = Undo, P = pause timer, 1-6 = team, Q/W/E/R = option, Enter = lock.

## Kiosk (Windows 11, Edge)
`msedge.exe --kiosk http://YOUR_URL/ --edge-kiosk-type=fullscreen`
Disable edge swipes: registry `AllowEdgeSwipe=0` and `KioskSwipeGesturesEnabled=0`.

## Check on the real TV before the event
Reach line (bottom half only), multi-touch, taskbar swipe, speech voices, speaker loudness.

Tests: `npx tsx tests/engine.test.ts`
