# Overhaul contract (read this first)

The kids' game is being overhauled in one pass by several people working in parallel. Rules that apply to everyone:

## Ground rules
- Work ONLY inside the files you own (your brief lists them). Shared files (`src/game/*`, `src/ui/*`, `src/screen/screen.css`, `src/screen/views2.css`,
  `src/screen/ScreenApp.tsx`, `src/narration/{index,store,types,useNarrator}.ts*`, `src/audio/*`) are owned by someone else: if you need a change there,
  make the smallest possible `Edit` (one unique string, never rewrite the whole file) or work around it. Put NEW CSS in your own new css file
  (`import './yourfile.css'`), not in the shared ones. When you must change an existing rule in `screen.css` / `views2.css`, edit just that rule.
- Never run `git`. Never reformat files. Keep prop APIs backward compatible (only add optional props) unless the brief says otherwise.
- Check your work with `npx tsc -b` from the project root (must pass for your files; in-flight errors in files you do not own are not yours).
  Do not run the dev server unless you need a screenshot (your brief gives a port).
- Kid-friendly language: short sentences, easy words, no jargon. Texts are for 10 to 15 year olds (classes 5 to 10).
- The villain is **Fibbot** (renamed from rAIvan; code ids `fibbot`, component `Fibbot` in `src/ui`, css `scr-fibbot-*`). He is a fibbing, copying, cheating robot. NOT "10-headed".
- Minimum text size on the big screen is 36 px EXCEPT the narration transcript (32 px, deliberately small) and small badges.
- Dynamic numbers (anything that changes on screen) must use the shared rolling number component from `src/ui` (`CountUp` / `Num`, fixed by the ui agent) so digits never wobble.
- Animate only `transform` and `opacity` where possible; no big live blurs on moving content (use a dim layer + a small blur on STATIC backdrops only, short transitions).

## Layout contract (`src/screen/lib/layout.ts`)
Stage 1920x1080. Slim progress rail y 0..48 (only after the game started). Bolt (the narration dock) sits top-left, x 24..212, y 56..188, rendered by `ScreenApp`
(NOT by your view). Your view must NOT draw its own Bolt unless the brief says so. Things that sit "after Bolt" start at x = DOCK_W + 16 = 204 on the same row (y 56..).
Full-width content starts at CONTENT_TOP (196) when the transcript is showing, or at y 64 when the dock is Bolt-only (`showText: false`).
Kids can only touch y >= 560. Use all the vertical space: no big dead gaps between the top row and the content. Consistent paddings (multiples of 8; 24/32/40).
Where it genuinely fits, use "Bolt top-left, question/title box right after him" on every screen (same position everywhere = uniform).

## Narration contract (`src/narration/*`)
`narrationFor(state)` returns `{ id, lines, summary?, showText?, mascot? } | null`. `id` must change whenever the narration should be spoken again
(include step id, phase, team index ...). `lines[i] = { text, say?, tone?, pose?, gap? }` where `tone` is `normal | excited | cheer | whisper | villain | calm`.
- 2+ lines => ALWAYS give a `summary` (about as long as one line; shown in the transcript after the lines were spoken, tagged "In short").
- 1 line => no summary needed. `showText: false` when the same words are already big on screen (e.g. the question itself).
- `say` is only for pronunciation tweaks (the voice engine already fixes A.I., who, psst, uh-oh, cash, rupees, Fibbot).
- Tips / secrets are whispered (`tone: 'whisper'`). Winners / sold / cheers are `excited` or `cheer`. Fibbot lines use `mascot: 'fibbot'`, `tone: 'villain'`.
- The hook waits for the voice to finish each line, then pauses `gap` ms (default 450). Give kids breathing room: `gap: 900` after important lines.
- Scenes (`kind: 'scene'`) and question intro animations narrate themselves (scenes agents), so `narrationFor` returns null for them.
- Wherever narration is genuinely suitable, add it. Every screen a kid or host looks at should have a voice and a small transcript.

## Game rules you must know (the engine is already updated; do not edit `src/game/*`)
- Script (see `SCRIPT` in content.ts): setup order is players -> teams -> names -> roles -> products -> how-to. Each act: story scene -> main choice(s) -> at most 1-2 side activities -> leaderboard -> full-screen progress step.
  Act 1 (q1, q2, mic, board, progress), Act 2 (q, bug smash, mood check, board, progress), Act 3 (q, auction, mic, board, progress, break, recap board),
  Act 4 (price, q, mic, board, progress), Act 5 (q, mega order, mood check, board, progress), Show Day. Mood check only after Act 2 (looks at acts 1-2) and Act 5 (all acts, later acts count double).
- Classes (grades) are 5 to 10 (`GRADES` in types.ts). Teams are made by dealing kids snake-style from the oldest class down so every team mixes classes.
- Talk time is 5 minutes (`TALK_MS`); the timer must only show on screen during the LAST 60 s (`TIMER_SHOW_MS`).
- Price It Right: `buyersAt`, `PriceOutcome` (engine computes on reveal: `st.outcomes[teamId]`). 10 interested customers; each sale earns price - cost; coins + profit/2; customers + buyers - 4.
- Auction: Fibbot bids by himself (engine). `BID {by: teamId, amount}` is the only bid action; the engine appends Fibbot's counter-bid to `bidLog` automatically. `st.villainCap` is secret (never show it).
- `WHY[qId][optionIndex]` (content.ts) explains why each option changes coins/customers/happiness; `WHY_ELSE`; `BONUS_WHY` explains the +5 s Bug Smash bonus. `moodFor()` results carry `why`. Use them in narration and on reveal cards.
- `micQuestionFor(team, act)` in helpers.ts builds a decision-aware Mic Time question.
- `state.progressView` (admin toggle) shows the full-screen progress overlay; action `SET_PROGRESS_VIEW {on}` toggles it.
- `useNarr` store (`src/narration/store.ts`) tells you the narrator state (`done`, `index`, `line`) if a view wants to time something to the voice.
