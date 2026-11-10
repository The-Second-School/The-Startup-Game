# Design research: The Startup Game

Scope: look, motion, type, touch, colour, sound for a ~200 inch single-touch classroom screen (1920x1080 canvas, ~4.4 m wide, viewers 2 to 8 m, kids 10 to 13).
Evidence labels: [V] verified from a source I fetched; [D] derived by me (maths or contrast calc); [K] general knowledge, not re-verified this session.

Caveat up front: design.duolingo.com is a JavaScript site; fetches returned only a redirect/empty shell. Duolingo's exact UI numbers below come from a third-party reverse-engineered spec, not from Duolingo. Treat them as "close enough to copy the feel", not official.

## 1. Duolingo visual language

Brand facts
- Feather Bold: custom display face by Johnson Banks (concept) and Fontsmith (font). Letterforms come from Duo's wing/feather shape; plain simplified capitals because wing-serif caps felt overwhelming. [V] [Monotype](https://cms-prod.monotype.com/resources/duolingo-custom-font-inspired-their-owl-mascot-duo)
- Product UI uses DIN Next Rounded (shown as "DIN Round" in the spec below). Feather is for headlines only. [V] via [reverse-engineered spec](https://www.shadcn.io/design/duolingo/raw)
- Shape language: characters are built from simple geometry (body, wings, big eyes, detached feet); humans follow the same shape rules so they feel like one world. [V] [Building Character](https://blog.duolingo.com/building-character/)
- Style evolved from flat pointed shapes and muted tones to rounder, brighter forms (Duolingo KIDS, 2018). Principle: "the fewest details needed to get the point across", lots of empty space, exaggerate key features, angle shapes to lead the eye to the UI. [V] [Shape language](https://blog.duolingo.com/shape-language-duolingos-art-style/)
- Characters speak the exercise sentence and have a unique animation on correct answers; mid-lesson animations reward streaks of correct answers. [V] Building Character link above.

UI values (third-party spec of duolingo.com, [V] for the spec, not for Duolingo itself)
| Token | Value |
|---|---|
| Feather Green (primary) | #58CC02, lip/pressed #58A700, soft #D7FFB8, mint #A5ED6E |
| Macaw blue | #1CB0F6 (secondary text, focus ring) |
| Cardinal red | #FF4B4B (error) |
| Fox orange | #FF9600 (streak) |
| Bee yellow | #FFC800 (gold) |
| Beetle purple | #CE82FF |
| Ink / body | #3C3C3C, strong #4B4B4B, muted #777777, disabled #AFAFAF |
| Hairline / hover | #E5E5E5 / #F7F7F7 |
| Primary button | h 50px, radius 16px, no border, a flat 3 to 4px darker slab underneath; press = translate down by lip height, lip disappears |
| Secondary button | white fill, 2px border #AFAFAF (some versions #E5E5E5), text Macaw |
| Input | h 48px, radius 8px, 2px #E5E5E5 border, focus 2px #1CB0F6 |
| Radii | 8 / 12 / 16 / full |
| Elevation | no blur shadows at all; depth only comes from the flat lip |
| Type scale | Feather 64/48px display, DIN Round 700 for headings and labels, uppercase labels with +0.8px tracking |

How the mascot talks (patterns, [V] from the Building Character and 60fps pieces; tone notes [K])
- Short, warm, a little cheeky; one idea per bubble; never scolds. Wrong answer = gentle correction, not a red alarm.
- Reactions scale with the win: small win = subtle wing flap; milestone = big spin; lesson done = confetti plus characters. [V] [60fps design](https://60fpsdesign.substack.com/p/fun-in-every-frame)
- Motion is character-led and instant (Lily's slow clap is an immediate, hard-to-miss cue). No exact durations or easing are published. [V]

Sound (Duolingo-specific facts are thin; [V] only the generic points) [Soundcy overview](https://soundcy.com/article/what-does-duolingo-sound-like)
- Bright major-key cues for correct, soft low tones for wrong, jingles 3 to 5 s only for key moments, same sound always means the same thing, restraint avoids annoyance.

Free font stand-ins
- Feather Bold stand-ins: Baloo 2 ExtraBold, Fredoka Bold, Nunito Black. DIN Next Rounded stand-ins: Nunito 800, Varela Round, Baloo 2 600/700.

## 2. Reproducing the illustration style in SVG

Rules distilled (mix of [V] principles above and [K] how the app art is built)
- Few big shapes: circles, rounded rects, ellipses, one or two beziers. No outlines on most figures; shapes separate by colour only. Where a stroke exists it is a darker shade of the fill, not black.
- Each object = 4 flat layers: (1) base fill, (2) shadow shape in a darker tone clipped to the lower/right side, (3) highlight shape in a lighter tone on upper/left, (4) tiny white specular dot or sliver. Never blends, never gradients.
- Keep one light direction everywhere: top-left. Shadow layers sit bottom-right.
- Eyes: large white circles, dark pupil, one white glint. Eyes carry the personality; spend detail there.
- Detached limbs (feet, hands) as separate rounded shapes slightly overlapping the body.

SVG recipe (no app code, just structure)
- One `<g>` per object; use `<clipPath>` of the base shape so shadow/highlight layers can be simple big ellipses that get clipped. This gives clean crescents without path math.
- Stroke settings: `stroke-linejoin="round" stroke-linecap="round"`, stroke width ~3 to 4 percent of object width, stroke colour = edge shade of the fill.
- Shared white border: draw the whole object a second time behind it with `stroke="#fff" stroke-width=2x` (the "sticker outline") to get the modest white border.
- Colour tokens: each hue gets 4 stops: highlight (fill lightened ~12 percent L), base, shade (darkened ~12 percent), edge (darkened ~22 percent). Generate in OKLCH, change only L and a hair of chroma, then freeze as constants.
- Use `shape-rendering="geometricPrecision"`; at 200 inches, hairline details above 1920px vanish, so no feature thinner than 6px at 1080p.

## 3. Motion

Spring maths [D]. Motion defaults: stiffness 1, damping 10, mass 1 for physics; duration-based default bounce 0.25; `visualDuration` sets when most movement is done and bounce happens after. [V] [Motion spring](https://motion.dev/docs/spring), [React transitions](https://motion.dev/docs/react-transitions). Damping ratio z = damping / (2 * sqrt(stiffness * mass)); overshoot = exp(-pi*z / sqrt(1-z^2)).

| Use | stiffness / damping / mass | z | overshoot | feel |
|---|---|---|---|---|
| Button press down | 900 / 40 / 1 | 0.67 | ~6% | snappy, little wobble |
| Button release / hover pop | 600 / 22 / 1 | 0.45 | ~20% | boing back |
| Card/chip pop-in | 420 / 18 / 1 | 0.44 | ~21% | the "Duolingo pop" |
| Big hero / winner reveal | 260 / 12 / 1 | 0.37 | ~29% | very bouncy |
| Soft settle (layout moves, scoreboard) | 200 / 22 / 1 | 0.78 | ~2% | calm, no jelly |
Duration-based shortcut: `bounce 0.35, visualDuration 0.4s` for pop-ins; `bounce 0.5, visualDuration 0.6s` for celebrations; `bounce 0` for anything with numbers that must be read.

Timings [D/K] (tuned for far viewing; slower than phone UI because 4 m wide objects need longer to be perceived)
- Micro feedback (press, tap ack): 80 to 120 ms down, spring back ~250 ms. Sound fires on pointerdown, not click.
- Element enter: 350 to 450 ms. Exit: 200 to 250 ms (exits shorter than entries).
- Screen transition: 500 to 600 ms; never block input for more than 300 ms.
- Celebration (correct, round win): 1.2 to 2.0 s. Winner/podium: up to 4 s, with a skip-on-tap.
- Stagger: 60 to 90 ms per item for up to 6 items; cap total stagger at ~500 ms. Leaderboard rows: 120 ms apart, bottom to top (last place first) for suspense.
- Easing for non-spring: enter `cubic-bezier(0.34, 1.56, 0.64, 1)` (back-out, overshoot); exit `cubic-bezier(0.4, 0, 1, 1)`; settle `cubic-bezier(0.22, 1, 0.36, 1)`.

Squash and stretch / anticipation
- Anticipation: before a pop, scale to 0.92 for ~80 ms, then spring to 1.0 with overshoot to ~1.08.
- Squash on press: scaleY 0.94 / scaleX 1.04 plus translateY by lip height. Release: scaleY 1.06 / scaleX 0.97 then settle.
- Keep total volume feel: x and y scales should multiply to ~1.
- Idle life: mascots and answer cards bob 2 to 3 percent scale or 6 to 10 px y, 2.4 to 3.2 s sine loop, phase-offset per item so nothing moves in lockstep.
- Confetti: flat 12 to 20 px rounded squares and circles in team colours, 60 to 90 pieces, gravity ~1800 px/s2, fade at 1.6 s. Use transform/opacity only; at 4K-ish fill rates avoid blur and filters.

Reduced motion [V] [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion): large scaling and panning are the main triggers. Honour `prefers-reduced-motion: reduce` by replacing scale/translate with opacity and colour changes, bounce 0, no confetti rain (use a static burst); Windows 11 toggle is Settings > Accessibility > Visual effects > Animation effects. Also offer a host-side "calm mode" switch in the admin page, since a school PC may have animations disabled by accident.

## 4. Large-format typography

Geometry [D]: 200 in diagonal at 16:9 = 4.43 m wide, so 1 px on a 1920 canvas = 2.3 mm; 100 px = 23 cm; screen height 2.49 m.
Legibility rule of thumb [K, not re-verified]: minimum letter (cap) height = distance / 200, comfortable = distance / 100. At 8 m: floor 40 mm (~17 px cap, ~25 px font), comfortable 80 mm (~35 px cap, ~50 px font). Use "comfortable" because kids are distracted, glare exists, and LED/projection contrast is lower than a monitor.

Minimum sizes on the 1920x1080 canvas (font-size)
| Role | Min | Target |
|---|---|---|
| Question / headline | 72 px | 96 to 140 px |
| Option text, team names, big numbers | 56 px | 64 to 80 px |
| Body / supporting line | 44 px | 48 px |
| Smallest allowed label (timers, tags) | 36 px | 40 px |
| Anything below 36 px | never for kids to read | admin-only |
- Weight 700 to 800 only; thin weights break up at distance. Line-height 1.15 to 1.25 for headings, 1.35 for body. Letter-spacing +0.01em on big text. Max 8 words per question line, 2 lines max, 40 characters per line max at 56 px.
- Contrast [D] (calculated by me, WCAG formula): ink #2A2352 on bg #FFF4B8 = 12.9:1. Target >= 7:1 for all text because far viewing and glare; WCAG minimum is 4.5:1, 3:1 for large text (>=24 px or 18.7 px bold). [V] [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- Never put white text on the vivid fills: white on the team/option fills measures only 2.1 to 3.5:1 (see section 6). Use ink text on fills, or white text only on the dark edge shade.
- Never use yellow, pale yellow, or light orange text on the yellow background.

Fonts (Devanagari support checked against the Google Fonts metadata endpoint, [V])
| Font | Devanagari | Rounded | Weights | Verdict |
|---|---|---|---|---|
| [Baloo 2](https://fonts.google.com/specimen/Baloo+2) | yes (also Latin) | yes, soft and chunky | variable 400 to 800 | Best single choice; one family covers English and Marathi/Hindi; closest to the Duolingo feel in heavy weights |
| Nunito | no (Latin, Cyrillic, Vietnamese) | yes | 200 to 1000 | Great for English UI text; falls back to Baloo 2 for Devanagari |
| Fredoka | no (Latin, Hebrew) | yes, very bubbly | variable 300 to 700 plus width axis | Fun display face for English-only headlines |
| Mukta | yes | no (humanist sans) | 200 to 800 | Good neutral Devanagari body fallback, not playful |
| Noto Sans Devanagari | yes | no | 100 to 900 | Safe last-resort fallback |
- Recommended stack: `font-family: "Baloo 2", "Nunito", "Noto Sans Devanagari", system-ui, sans-serif;` Self-host the woff2 (no internet dependence in class) and subset to latin + devanagari. Use weight 800 for headlines, 700 for options, 600 minimum elsewhere.
- Baloo 2's Latin has tall ascender/descender space; add `line-height` explicitly and test Devanagari matras (ि, ु, ृ) so they don't clip inside rounded buttons. Pad button text 8 to 12 px extra top/bottom.
- Kid readability: avoid ALL CAPS paragraphs, avoid italics for anything read from far away, keep numerals tabular for scores (`font-variant-numeric: tabular-nums`).

## 5. Touch on a big single-touch screen

Targets [V]/[D]. NN/g says 1 cm x 1 cm minimum, physical not pixel, ~2 mm gap, larger for primary actions and very large screens (Target's app ~2 cm). [V] [NN/g](https://www.nngroup.com/articles/touch-target-size/). Children's touch accuracy is lower and varies by age; see the UF MTAGIC studies [Anthony et al.](https://init.cise.ufl.edu/?p=2686) (I only got the abstract; no mm figures). My recommendation is therefore a deliberate overshoot [D]:
- Primary buttons: >= 400 x 160 px (92 x 37 cm). Answer options: >= 520 x 220 px. Gap between adjacent targets >= 48 px (11 cm) so one kid's arm/hand does not hit a neighbour.
- Hit area bigger than the visual: add an invisible 16 to 24 px padding ring via `::after`.
- Act on `pointerdown` for the sound/press animation, commit the action on `pointerup` inside the target; allow slide-off cancel.
- Debounce each target 250 ms to stop double-fires from IR/capacitive jitter.

Single-touch pitfalls
- Two fingers on a single-touch panel typically produce one ghost point midway between them [K, test it on your panel]. Design so only one kid answers at a time (turn-based or host-triggered "lock-in"), and ignore a `pointerdown` while another pointer is active.
- Pinch/zoom/pan: set `touch-action: none` on the game root (stops browser pan/zoom, all events reach your code) or `manipulation` where you only want to kill double-tap zoom. MDN notes `none` blocks low-vision zoom, acceptable for a kiosk. [V] [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
- Long-press = context menu: `oncontextmenu = e => e.preventDefault()`, plus `user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent` on everything except admin inputs. Prevent image drag: `draggable="false"` / `-webkit-user-drag: none`. [K]
- Also: `overscroll-behavior: none` on html and body to stop pull-to-refresh and swipe-back; `html, body { overflow: hidden; height: 100% }`; block `wheel` with ctrl and `gesturestart` events. [K]
- Windows edge swipes: Windows 11 edge swipe is in Settings > Bluetooth & devices > Touch; turn the left/right edge swipe toggles off. Policy: HKLM\SOFTWARE\Policies\Microsoft\Windows\EdgeUI, DWORD `AllowEdgeSwipe` = 0, then reboot (article is Windows 10 era; same key is commonly used on 11). [V] [Intuiface](https://support.intuiface.com/hc/en-us/articles/24875354537244-Disable-Edge-Swipe-Gestures-on-Windows)
- Edge's own swipe navigation (back/forward/refresh) in kiosk mode: policy `KioskSwipeGesturesEnabled` = 0 (REG_DWORD, HKLM\SOFTWARE\Policies\Microsoft\Edge; needs Edge restart). [V] [MS Learn policy](https://learn.microsoft.com/en-us/DeployEdge/microsoft-edge-browser-policies/kioskswipegesturesenabled)
- Kiosk launch: `msedge.exe --kiosk https://YOUR_URL --edge-kiosk-type=fullscreen --no-first-run` (F11/F12 blocked; `--kiosk-idle-timeout-minutes=0` keeps it from closing; restart after close needs Assigned Access). [V] [MS Learn kiosk](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-configure-kiosk-mode). Chrome alternative [K]: `chrome.exe --kiosk --overscroll-history-navigation=0 --disable-pinch URL`.
- The bottom edge is where the taskbar can pop up on swipes; keep the lowest interactive element >= 120 px above the screen bottom and test it on the real panel.
- Windows 11 notification toasts and Update restarts will interrupt a live game: turn on Do Not Disturb, set Active Hours, and pause updates for the lesson day. [K]

Bottom-half layout [D]
- Screen is 2.49 m tall; bottom half = y 540 to 1080 px, 1.24 m. Kids' reach height depends on the mount height, which I do not know: measure the tallest tap kids can comfortably make (shorter Std 5 child) and set the "reach line" there. Default assumption: all touch targets between y = 560 and y = 960 px.
- Top half = read-only: question, timer, scoreboard, mascot, progress. Bottom half = all taps: options, team buzzers, lock-in, "next".
- Left/right 5 percent margins (96 px) are no-touch zones to dodge edge swipes and bezel parallax.
- Put answers in a single row of 2 or 4 wide cards across the bottom (kids stand in front of "their" card); avoid drag gestures longer than ~60 cm; drag-and-drop is ok only horizontally.
- Host controls (start, skip, reveal, pause) live only on the 9:16 phone admin page, never on the big screen.

## 6. Proposed palette (flat, 3D "edge" for each)

Light-yellow base [D, contrast calculated]
| Token | Hex | Note |
|---|---|---|
| bg (page) | #FFF4B8 | main light-yellow theme |
| bg-deep (bottom band / stripes) | #FFE97A | second flat layer; 1.1:1 vs bg, purely decorative |
| surface (cards) | #FFFBE0 | lightest layer inside cards |
| surface-edge | #F2D45C | card lip, 1.32:1 vs bg; add 6 px white border to separate |
| border-white | #FFFFFF | modest white border: 6 px (cards), 4 px (buttons), 3 px (chips) |
| ink | #2A2352 | 12.9:1 on bg, 13.8:1 on surface |
| ink-soft | #5A4E86 | 6.6:1 on bg, 7.0:1 on surface; secondary text only |

Six team colours (fill / edge). Text on fills: ink. Edge/bg is the non-text contrast (>= 3:1 needed, WCAG 1.4.11).
| Team | Fill | Edge | ink on fill | edge vs bg |
|---|---|---|---|---|
| Red | #FF5A5F | #D6393F | 4.7 | 4.2 |
| Orange | #FF9A1F | #D27300 | 6.8 | 3.1 |
| Green | #4CC41F | #3A9A12 | 6.3 | 3.3 |
| Blue | #2AABF0 | #1B84C4 | 5.6 | 3.7 |
| Purple | #B57BFF | #8A52D6 | 5.0 | 4.4 |
| Pink | #FF72C6 | #D14C9E | 5.8 | 3.6 |

Four option colours (A, B, C, D) chosen to differ from the team hues, so "option" and "team" never get confused; each also gets a shape icon (circle, triangle, square, star) for colour-blind safety.
| Option | Fill | Edge | ink on fill | edge vs bg |
|---|---|---|---|---|
| A Sky | #3FA2FF | #2578D1 | 5.4 | 4.0 |
| B Mint | #1FC8A0 | #139A78 | 6.7 | 3.2 |
| C Violet | #8F73FF | #6A4FD6 | 4.2 | 5.1 |
| D Coral | #FF7F5C | #D95A3A | 5.8 | 3.5 |

Notes
- Feedback colours: correct = Green (#4CC41F / #3A9A12), wrong = Red; always pair with icon plus a motion/sound so it works without colour.
- White on any fill fails (2.1 to 3.5:1). If you want white text, put it on the edge shade (white on edge: Red 4.65, Purple 4.9, Violet 5.7, Sky 4.5, others 3.4 to 4.1, so only large text).
- Fill vs bg is only 1.9 to 3.1:1; the edge colour and white border do the separating work. That is why each element needs the lip.
- Red/Green pair is a colour-blind problem; differentiate with icons and position, and avoid red-vs-green as the only signal.
- Lip depth at 1080p: buttons 10 to 14 px (about 5x Duolingo's 3 to 4 px because the whole canvas is ~4x larger than a phone UI), cards 12 px, chips 6 px. Radii: buttons 40 px, cards 48 px, chips full pill; inner layers keep radius = outer minus border.

## 7. Sound: Web Audio recipes and Speech

Rules [V] [MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices): create/resume the AudioContext inside a user gesture (the host's "Start game" tap on the big screen does this once); schedule with `currentTime` and AudioParam methods; exponential ramps cannot reach 0, ramp to 0.001 and then stop.
Master chain: sources -> per-cue gain -> master gain (0.6) -> DynamicsCompressor (threshold -18, ratio 4) -> destination. Peak cue level -12 dBFS; classroom reverb is bad, keep sounds short and bright. Keep each cue under 1.5 s, apart from fanfare. Add +-3 percent random detune each play so repeats do not fatigue.

Recipes (osc type, frequency, envelope). All values [K], tune by ear on the real speakers.
- Pop (tap/select): sine, freq 520 Hz falling to 260 Hz over 90 ms (exponential); gain 0 to 0.8 in 5 ms, then to 0.001 over 110 ms. Add a 12 ms white-noise burst through a highpass at 2 kHz for the "click".
- Ding (correct): two sines, 880 Hz and 1320 Hz (a fifth up) plus a quiet 1760 Hz; gain attack 5 ms, exponential decay 600 ms. For a happy 2-note rise, play 784 Hz (G5) then 1047 Hz (C6), 110 ms apart.
- Whoosh (transition): white noise buffer 400 ms through a bandpass, Q 1.2, centre sweeping 400 to 3000 Hz (exponential, 350 ms); gain swell 0 to 0.5 over 150 ms, then fade out over 250 ms. Reverse sweep for exit.
- Buzz (wrong, soft): two sawtooth oscillators at 150 Hz and 156 Hz (beating), lowpass 700 Hz, gain 0.3 for 220 ms, drop pitch to 110 Hz in last 100 ms. Keep it silly, not harsh; kids should laugh, not feel shamed.
- Fanfare (win): square waves through lowpass 3 kHz, notes C5 E5 G5 C6 at 0, 120, 240, 360 ms (each 140 ms), final C6 plus E6 plus G6 chord held 700 ms with decay; add a triangle one octave below for body.
- Drumroll (suspense): noise burst train through bandpass 200 Hz Q 1; schedule 40 hits at 35 ms stepping to 25 ms (accelerating), gain ramping 0.1 to 0.7 over 2 to 3 s; end with a loud pop plus a short cymbal (noise through highpass 6 kHz, decay 900 ms).
- Tick (timer, last 5 s): triangle 1000 Hz, 30 ms; pitch +50 Hz each second.
- Rules: fire on pointerdown; one sound per action; mute toggle on the admin page; start the context with a visible "Tap to start" screen (autoplay policy); cap simultaneous voices at 8.

Speech synthesis (Web Speech API)
- API: `speechSynthesis.getVoices()` returns the device's voices and may be empty on first call; register `onvoiceschanged` and re-run. [V] [MDN getVoices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices)
- Edge-only "Online (Natural)" voices are cloud voices shown in the list; on en-IN they are Microsoft Neerja Online (Natural) (female) and Microsoft Prabhat Online (Natural) (male) [K, names recalled, not confirmed on a page; check on your PC]. Hindi (hi-IN) and Marathi (mr-IN) have natural voices too (e.g. Swara, Madhur; Aarohi, Manohar) [K, unconfirmed].
- Pitfalls: Natural voices need internet and can be blocked by the `ConfigureOnlineTextToSpeech` policy; Edge 150 had an intermittent bug where Natural voices came back as "Microsoft undefined Online (Natural) - undefined" and speech fell back to Microsoft David; fix was updating Edge and restarting. [V] [MS Tech Community](https://techcommunity.microsoft.com/discussions/edgeinsiderdiscussions/edge-version-150-javascript-speechsynthesis-getvoices-undefined-voices/4538591)
- Picking logic (describe, do not code here): wait for `voiceschanged` (with a 2 s timeout); drop voices whose name contains "undefined"; rank candidates: lang `en-IN` and name contains "Natural" and "Neerja" > any en-IN Natural > en-IN local > en-GB Natural > any en; store the chosen voice name in localStorage and show it on the admin page with a "Test voice" button; always have a local fallback (Microsoft Heera/Ravi en-IN local if installed, else default).
- Delivery for kids: rate 0.95 to 1.0, pitch 1.05 to 1.15, volume 1; speak 1 short sentence per call; cancel on skip (`speechSynthesis.cancel()`); Chrome stalls long utterances at ~15 s, so chunk text. Pre-generate nothing offline: have a text-on-screen fallback every time since voices can fail silently.
- Sync: show the spoken line as big on-screen text at the same time (kids at 8 m in a noisy room will not catch all audio).

## 8. Anti-slop checklist (kids' game UI)

1. Purple-to-blue gradient hero / glow shadows. Do: flat colour, a solid darker lip, no blur anywhere.
2. Uniform rounded cards with a soft drop shadow on white. Do: 3 stacked flat layers (lip, fill, inner panel) and a white border; vary shape (pill, blob, badge) per role.
3. One radius everywhere. Do: nested radii (outer 48, inner 36) and pill for chips so shapes feel built, not pasted.
4. Emoji as icons. Do: custom SVG icons in the same 4-layer style as the mascot, 6 to 8 px chunky strokes.
5. Stock illustrations / generic robot mascot. Do: one original mascot with a name, big eyes, voice lines; it appears in every screen state (idle, thinking, cheering, sad-but-silly).
6. Inter/Roboto/system font and thin weights. Do: Baloo 2 700 to 800, big, tight, with some size jumps (3x between headline and body).
7. Tiny labels, 14 to 24 px grey text. Do: nothing under 36 px on the big screen; hide detail on the host phone instead.
8. Equal weight on everything, centred stacks of cards. Do: one hero per screen, off-grid placement, tilt tags 2 to 4 degrees, overlap elements, let the mascot break the frame.
9. Fade-in-up on everything, 0.3 s ease. Do: springs with overshoot, staggered, anticipation; some things squash, others slide, others pop.
10. Pure white and light grey backgrounds with a single accent. Do: committed yellow theme, with 2 yellow tones plus ink; colour is team identity, never decoration.
11. Generic copy ("Great job!", "Submit", "Error"). Do: write in the mascot's voice, local and specific ("Arre wah!", team names the kids picked, startup jokes), 6 to 8 variants per event, never repeat twice in a row; Marathi/Hinglish flavour where the class would use it.
12. Colour as the only state signal. Do: shape + icon + motion + sound + colour for correct/wrong/locked/selected.
13. Placeholder-looking confetti or generic fireworks. Do: confetti in the winning team's own colours and shapes from the game (coins, rockets, lightbulbs), with a pop-in squash.
14. Sound-less or one-sound UI. Do: every tap, state change and reveal has a distinct cue; cues share one key (C major) so they harmonise.
15. Dark mode, glassmorphism, neon. Do: none of these; keep it chunky, sunny, tactile, readable at 8 m.
16. Layout designed on a laptop and scaled up. Do: design at 1920x1080 directly, test by viewing the screen from 8 m (or on a TV across a room) and printing a mock at 1:1 on the wall.

## Open items to verify on the real hardware
- Exact screen mount height and kids' reach line; one-touch vs ghost-point behaviour when two kids touch; whether bottom-edge swipe shows the taskbar; whether Neerja/Prabhat appear in `getVoices()` on that PC (and that it has internet); speaker loudness at 8 m; actual brightness/glare on the yellow background.
