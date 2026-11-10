# The Startup Game: build spec (shared contract for every builder)

Read this whole file before writing code. The game rules and all words already exist in
`src/game/content.ts` and `src/game/engine.ts`. Do NOT change those files (owner: orchestrator).
If you need something from the engine, write a note in `docs/NOTES-<yourname>.md` and work around it.

## 1. What it is
A live classroom game for ~20 kids aged 10 to 13 (Std 5 to 7) in Jalna, India. Teams build a pretend startup in
the city of **Techistan** in 5 acts (Problem, Build, Launch, Money, Grow) + Show Day. Guide mascot: **Bolt**, a
cheerful yellow robot who narrates in speech bubbles. Villain: **rAIvan**, a silly 10-headed AI (Ravan joke) who
tempts teams to copy, cheat or sell out. Funny, never scary.

Two screens:
- **Big screen** `/#/` : 16:9 landscape, single-touch, ~200 inch Windows 11 TV in Edge/Chrome. Kids can only reach the
  BOTTOM HALF. Everything kids touch must sit at y >= 560 on the 1920x1080 stage. Top half = look only.
- **Admin phone** `/#/admin` : 9:16 portrait. Host controls the flow, types names, enters bids and votes.

The big screen owns the game state (`useScreen` in `src/store/screenStore.ts`). The phone mirrors it and sends
actions (`useAdmin` in `src/store/adminStore.ts`). Both use `dispatch/send(action)` with actions from `src/game/types.ts`.

## 2. Tech
Vite + React 19 + TypeScript, `motion` (import from `motion/react`), `zustand`. No CSS framework: plain CSS files
plus CSS variables from `src/ui/theme.css`. Font: Baloo 2 via `@fontsource/baloo-2` (500, 600, 700, 800). SVG for all
art, drawn by hand in JSX (no image files, no external image APIs, works offline). Sounds synthesised with Web Audio.

- Big screen renders inside `<StageFrame>`: a fixed 1920x1080 box scaled uniformly to fit the window (letterboxed).
  All big-screen coordinates in this spec are stage pixels.
- Performance: animate only `transform` and `opacity`. Avoid huge blur filters. 60 fps on a mid laptop GPU.
  Prefer CSS keyframes for idle loops (blinking, bobbing) and `motion` for entrances, springs and layout.
- Respect `prefers-reduced-motion` lightly (shorter, no shaking) but the default is full fun.

## 3. Visual style (non-negotiable)
Duolingo spirit, light-yellow theme. Read `docs/DESIGN_RESEARCH.md` when it exists (being written now) and follow it.
- **Flat colours only. No gradients.** Depth comes from stacked flat layers: a darker "edge" layer below (offset 6 to 10 px
  down), the main fill, a lighter highlight shape on top (a rounded blob in the top-left), and a modest **white border**
  (3 to 6 px) around stickers, cards and avatars, like a sticker.
- Everything softly rounded. Radii: see depth rule below. Round line caps and joins in SVG.
- Chunky 3D buttons: main colour face, darker bottom edge (box-shadow `0 8px 0 <dark>`), press = move down 6 px and shrink
  the edge. Bouncy hover/press springs.
- Ink colour is warm dark brown, never pure black. Big bold rounded text. Minimum text on the big screen: 36 px
  (nothing smaller, ever), option text 52 to 56 px, body 44 px, titles 80 to 120 px. Text on any coloured fill is INK, never
  white (white on the vivid fills fails contrast); white text only on dark edge shades.
- Depth at 1080p is bigger than phone UI: button lip 10 to 14 px, card lip 12 px, chip lip 6 to 8 px. Radii: buttons 40,
  cards 48 (inner layers 36), chips pill. No blur shadows anywhere.
- Touch targets on the big screen: at least 400x160 stage px with 48 px gaps where space allows (team chips with 6 teams:
  at least 280x150). All inside y >= 560.
- Motion: springs (pop: stiffness ~500, damping ~22; move: ~300/26), anticipation + overshoot, staggered entrances
  (60 to 90 ms), squash and stretch on characters, idle life (blink every 3 to 5 s, gentle bob). Celebrations: confetti,
  stars, screen-shake for big moments only.
- Not AI slop: no glassmorphism, no purple-blue gradients, no thin outline icons, no stock emoji soup as the main art.
  Emoji are allowed as small accents inside text only. Every main visual is our own SVG.

### Tokens (in `src/ui/theme.css`, owner: ui)
```
--bg: #FFF4C7          light yellow canvas
--bg-2: #FFE99A        darker yellow band / pattern
--sun: #FFC800  --sun-edge: #E0A100   brand yellow (buttons, highlights)
--paper: #FFFFFF  --paper-edge: #EED9A0  cards
--ink: #4A3613  --ink-soft: #8A6F3E  text
--good: #58CC02 --good-edge: #46A302   gains
--bad: #FF4B4B  --bad-edge: #D93636    losses
--coin: #FFB800 --coin-edge: #D68F00
--raivan: #7B4BC9 --raivan-edge: #5A2F9E  villain purple
```
Team colours and option colours: `TEAM_COLORS` and `OPTION_STYLES` in `content.ts` (each has a base and darker shade).

## 4. File ownership (only edit your own files)
- Orchestrator: `src/game/*`, `src/sync/*`, `src/store/*`, `src/main.tsx`, `index.html`, `docs/SPEC.md`.
- **ui** agent: `src/ui/**` (theme, primitives, Bolt, rAIvan, Avatar, Building, ProductArt, etc.), `src/audio/**`.
- **scenes** agents: `src/scenes/**` (big act scenes + small question intros).
- **screen** agent: `src/screen/**` (the whole big-screen app).
- **admin** agent: `src/admin/**`.
Placeholder versions of the ui and scenes components already exist with the exact props below. Builders who
depend on them should import them as they are; the ui and scenes agents replace their insides, keeping the props.

## 5. Component contracts (do not change props; adding optional props is fine)
`src/ui/index.ts` re-exports everything below.

```ts
// Layout
StageFrame({ children })                          // 1920x1080 scaled stage, yellow bg + soft pattern
// Primitives
Button3D({ color?: string; edge?: string; size?: 'md'|'lg'|'xl'; disabled?: boolean; onClick?; children; className?; style? })
Card({ children; color?: string; edge?: string; className?; style?; padding?: number })   // layered paper card
Pill({ children; color?: string; edge?: string; textColor?: string; size?: 'sm'|'md'|'lg' })
DeltaPill({ value: number; kind: 'customers'|'happiness'|'coins'; size?: 'md'|'lg' })      // "+7 😊" green / "−5 👥" red, pops in
CountUp({ value: number; duration?: number })      // animated number
TimerRing({ remainingMs: number; totalMs: number; size?: number })   // big round countdown, gets red + wobbly under 10 s
Confetti({ fire: number })                          // bursts every time `fire` changes
SpeechBubble({ text: string; side?: 'left'|'right'|'bottom'; typing?: boolean; size?: 'md'|'lg' })  // typewriter text
OptionShape({ shape: 'circle'|'square'|'triangle'|'star'; color: string; size?: number })
MeterIcon({ kind: 'customers'|'happiness'|'coins'; size?: number })  // our own SVG icons for the 3 meters
// Characters
Bolt({ pose?: 'idle'|'wave'|'talk'|'think'|'cheer'|'sad'|'point'|'shock'; size?: number; talking?: boolean })
Raivan({ mood?: 'laugh'|'angry'|'sneaky'|'dizzy'|'shock'; size?: number })   // 10 heads, silly
Avatar({ seed: number; colorIndex: number; shade?: number; size?: number; mood?: 'happy'|'sad'|'wow'|'cool'; ring?: boolean })
   // Procedural fun object character (mango, rocket, cupcake, kettle, cactus, planet, bulb, donut, robot, cloud, ice cream,
   // book, drum, sandwich...) with a face. seed picks object + face + accessory deterministically. shade 0..4 picks the
   // colour from TEAM_COLORS[colorIndex].shades. Team icon = shade 2; members = same object, their own shade.
   // White sticker border always. Idle bob + blink.
Building({ stage: 'stall'|'shop'|'office'|'tower'; color: string; size?: number; animateIn?: boolean })
   // The startup's look by stage: Tiny Stall (cart with umbrella), Busy Shop, Big Office, Sky Tower.
ProductArt({ productId: string; size?: number })   // own SVG illustration for each of the 10 products in content.ts
RecipeBar({ act: number })                          // the Startup Recipe tracker: 🔍 Problem → 🛠️ Build → 📣 Launch → 💰 Money → 🚀 Grow → 🏆 Show Day
```
Audio (`src/audio/index.ts`): `sfx.play(name)` with names `'pop'|'tap'|'lock'|'whoosh'|'ding'|'gain'|'loss'|'buzz'|'drumroll'|'fanfare'|'splat'|'tick'|'coin'|'evil'|'cheer'`, `sfx.setEnabled(bool)`, `voice.say(text)`, `voice.setEnabled(bool)` (speechSynthesis, prefers an Indian English natural voice).

Scenes (`src/scenes/index.ts`):
```ts
ActScene({ sceneId: SceneId; teams: Team[]; recap: {teamId; icon; text}[]; onDone?: () => void })
   // Full-stage animated story for welcome, howto, act1..act5, showday, finale. Uses SCENES[sceneId].beats from content.ts.
   // Plays beats one after another (about 4 to 7 s each, longer for longer text), Bolt narrates each beat in a speech bubble
   // on top. Acts 2 to 5 start with a "story so far" beat that shows one card per team from `recap`. Calls onDone after the
   // last beat. Layered, deep, 30 to 60 s total. Should look like a mini cartoon, not a slideshow.
QuestionIntro({ anim: string; text: string; onDone?: () => void })
   // Small 3 to 5 s fun animation before a question. anim keys: magnifier, spybot, toolbox, megaphone, sharks, copier,
   // price, bugs, auction, mega, mood, mic. Bolt line shown in a bubble.
```

## 6. Big-screen states (screen agent)
Read `SCRIPT` in content.ts. `state.step` holds the live sub-state for the current step. Every view must show
`RecipeBar` (top strip, y 0 to 90) except full scenes. Kids touch only y >= 560.

Common question layout (question, price, megaorder):
- y 100 to 470: question card. Small talking Bolt on the left, big title (64 to 80 px), sub line.
- y 560 to 800: the 4 option tiles in one row, each with its colour, shape, icon, text (40 px) and a coin pill
  ("−10 🪙", "+50 🪙", "Free"). Tiles are inactive until a team is selected ("👇 Tap your team first").
  When a team is selected, options it cannot afford turn grey with "Not enough coins".
- y 840 to 1050: team strip: one chip per team (4 or 6). Chip: Avatar, name, tiny 👥 😊 🪙, status
  (Tap to choose / Choosing... glow / 🔒 Locked). Locked chips never show WHICH option was picked.
- Flow: Lock Master taps their team chip → taps an option → the chip shows a big LOCK 🔒 button → tap = `LOCK`.
  A small "change" link clears the selection before locking. Timer ring top-right while `phase === 'open'`.
- `revealed`: all chips flip to show the chosen option colour + icon; tiles show the little avatars of who picked them;
  the rAIvan option gets a 😈 stamp with a cheeky rAIvan pop-up.
- `spotlight` (one team at a time): big centred card: avatar (mood matches result), team name, chosen option, the
  story line (big), then each change pops in as a DeltaPill with sound, meters on the chip count up, and the live
  leaderboard panel re-sorts. ~4 to 6 s of animation each; host taps Next.
- `done`: short "leaderboard moment" with the 3 boards re-sorting.

Other steps:
- lobby: giant game title, Bolt waving, Techistan skyline, room code + QR code of the admin URL (`/#/admin?room=CODE`).
- setup_players: names pop in as bubbles as the host types them on the phone; counts per class.
- setup_teams: button "Make teams!" (bottom half) → names fly into team boxes; each box hatches its avatar
  (egg cracks, object pops out) with member mini-avatars in shades of the team colour.
- setup_roles: each team box lists members; tap a member to cycle roles (fills from `ROLE_PLAN`); role cards explain jobs.
- setup_products: a 10-slice product wheel. Each team's Lock Master taps SPIN in turn; taken slices grey out;
  winner card with ProductArt.
- setup_names: team boxes wait for names typed on the phone; each lands with confetti. Avatars already exist.
- scene: `<ActScene>` full stage. Host Next skips ahead.
- bugsmash: one team at a time. Top: team + timer + counter. Bottom band (y 560 to 1040): rAIvan's bugs crawl,
  wiggle and split; tap = splat. Seconds = `bugSeconds(team)`. Lock Master taps START (BUG_START) then plays;
  at time up dispatch `BUG_RESULT`. Result card with tier text.
- price: like a question, but after selecting a team a big slider (₹10 to ₹100, step 10) appears in the bottom
  half with that team's ProductArt and price hint; LOCK. Spotlight shows a crowd reacting by verdict.
- auction: one ticket at a time: big ticket card, a bid board with one paddle per team (coins left, already-won teams
  greyed) plus rAIvan's paddle. Host enters bids on the phone; the top bid glows and bounces. SOLD: "Going once...
  twice... SOLD!" hammer animation, ticket flies to the winner. rAIvan can win (nobody gets it).
- megaorder: pairs shown side by side with a combo name; same lock flow with the 4 MEGA options; reveal per pair with
  handshake or broken-heart animation.
- mood: one team at a time, quick (about 2.5 s each): tiny customers walk out under a rain cloud, or dance in.
  NEVER show the maths. Text from `MOOD.text`.
- mic: wheel of teams (already-picked teams faded); a kid taps SPIN → wheel lands → `MIC_PICK`; then the team, its
  Speaker's name (`memberWithRole(team,'speaker')`) and Bolt's question from `MIC_QUESTIONS[act]`, with a mic animation.
- board: 3 ranked boards (👥 Customers, 😊 Happiness, 🪙 Coins) with bars and FLIP re-sorting, plus each team's
  Building by stage. The Success board is shown LOCKED (🔒 "Unlocks on Show Day").
- break: snack break with a fun idle animation.
- pitch: the pitching team on stage: big avatar, name, Speaker's name, 45 s TimerRing, and their story strip
  (history entries) playing as a slideshow behind. Voting phase: "Show 1 to 5 fingers!", ticks appear as the host enters
  each team's vote (do not show the stars).
- awards: reveal 5 → 1 with drumroll, card flip, confetti; Banana Peel shows its funny `why` lines; at #1 the Success
  board unlocks, buildings rise, champion celebration.
- end: thank-you scene, all teams' avatars dancing.

The always-visible "leaderboard" is the team strip meters (and a compact ranked side panel during reveals).

## 7. Admin phone (admin agent)
Same yellow theme but simpler, cleaner, plainer (still rounded, still the 3D button). Portrait 9:16, thumb-friendly.
- Header: room code, connection dot (green = screen seen in last 4 s), current step name + act.
- Big primary button: `nextLabel(state)` → `NEXT`. Secondary: Undo, timer controls (pause/resume/+15 s).
- Context panel by step: players entry (name + class 5/6/7 chips, list with delete), team count (4 or 6), Make teams,
  roles editor, product spin fallback, team names inputs, lock status per team (with "clear lock"), auction bid pad
  (pick team, +10/+20/+50, custom), votes entry (per voter team: 1 to 5 stars), awards progress.
- Settings sheet: sound, Bolt voice, jump to step (list of SCRIPT), manual meter adjust (+/−) per team, reset game
  (double confirm).
- Works offline-first; shows a clear "Waiting for the big screen…" state when no state yet.

## 8. Done means
`npx tsc --noEmit` passes for your files, `npx vite build` passes, and you checked your work visually with Playwright
screenshots (the screen at 1920x1080, the phone at 390x844). Use `npx playwright install chromium` if needed.
Start the dev server with `npx vite --port 5173 --host 127.0.0.1` in the background.
