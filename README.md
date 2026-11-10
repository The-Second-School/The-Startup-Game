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

## Phone-to-screen sync and where data lives

- Big screen: `thestartupgame.thesecondschool.org` (route `/`). Host phone: `admin.thestartupgame.thesecondschool.org` (any `admin.*` hostname shows the phone admin at the root path; `/#/admin` also works everywhere).
- Both join ONE fixed Supabase Realtime broadcast room, `tss-main`. No pairing, no codes, no security: anyone who opens the admin address controls the game. `?room=xyz` overrides the room (testing only).
- The big screen is the only source of truth. It keeps the game state in its own browser `localStorage` (key `sg-state-v1`), applies every phone action, and broadcasts the full state. Phones hold nothing beyond what the screen broadcasts. Supabase only relays messages; it stores nothing (no tables).
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at build time (`.env.local` for local dev). Without them the app falls back to BroadcastChannel (same browser only) and says so on the phone and the lobby.
- Outgoing Supabase messages are capped at 8 per second; state broadcasts are coalesced.
