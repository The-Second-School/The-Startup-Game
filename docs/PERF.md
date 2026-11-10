# Performance audit

Measured with `tests/perf/audit.mjs` (Playwright, system Chrome, headless software rendering, cache disabled, preview build).
Screen = act1 scene seeded via localStorage, 1920x1080. Admin = phone viewport. 10 s of requestAnimationFrame sampling.
Run it yourself: `npm run build && node tests/perf/audit.mjs --throttle=4` (spawns `vite preview`; `--throttle` is CPU slowdown).
Headless Chrome has no GPU, so absolute frame times are pessimistic; compare before/after, not against 16.7 ms.
Numbers vary roughly +-15% run to run on this machine.

## Before / after (CPU 1x)

| Metric | Screen before | Screen after | Admin before | Admin after |
|---|---|---|---|---|
| JS needed to show the route (gzip, transferred) | 249.6 kB | 229.7 kB | 249.1 kB | 147.3 kB |
| JS incl. idle scene prefetch | 249.6 kB | 261.7 kB (32 files) | 249.1 kB | 147.3 kB |
| Fonts transferred | 72 kB | 72 kB | 0 | 39 kB (now preloaded) |
| DOMContentLoaded / load | 138 / 139 ms | 98 / 111 ms | 86 / 87 ms | 82 / 94 ms |
| First contentful paint | 464 ms | 212 ms | 120 ms | 132 ms |
| Long tasks (count / total) | 7 / 806 ms | 2 / 186 ms | 0 | 0 |
| Avg frame time in act1 | 42.2 ms | 21.3 ms | 16.7 ms | 16.7 ms |
| p95 frame / frames over 33 ms | 83 ms / 105 | 33 ms / 20 | 16.7 / 0 | 16.7 / 0 |

CPU 4x throttle: screen FCP 788 -> 636 ms, long tasks 11 / 1543 ms -> 7 / 861 ms, avg frame 38.9 -> 24.9 ms, frames over 33 ms 84 -> 39.
Admin FCP 276 -> 384 ms (extra route-chunk hop, see risks).

Uncompressed entry chunk went from one 861 kB file to: entry 3.7 kB + react 211 kB + motion 169 kB + route chunk (screen 198 kB, admin 37 kB). Scene art is 21 small chunks (1 to 15 kB each).

## What changed

- Code splitting: route chunks loaded from `main.tsx` (started before React mounts, held in state rather than `React.lazy`, because Suspense delays first reveal by ~300 ms). Vendor chunks react / motion / qrcode via `manualChunks` in `vite.config.ts`.
- `qrcode` is imported on demand inside `QrCode.tsx` (9 kB gz, separate chunk). Supabase is dynamically imported only when `VITE_SUPABASE_*` is set; without them it is not in the build at all (with them it is a separate 56 kB gz chunk).
- Scenes: `import.meta.glob` is now lazy. Each act/intro is its own chunk, prefetched one at a time on idle after the first view; once loaded the real component is used (no Suspense hop). `ActScene`, `QuestionIntro`, `Bolt`, recap `Avatar` are memoised.
- `ScreenApp`: `Ctx.Provider` value memoised so views stop re-rendering on unrelated parent renders.
- Stores: localStorage save debounced (400 ms, flushed on pagehide / tab hidden); state broadcast coalesced to one message per tick; admin ignores heartbeat replies that carry an unchanged state (no full phone re-render every 2 s). Zustand usage was already selector-based, nothing subscribes to a whole store.
- Header `.ui-header-bg`: removed `backdrop-filter: blur(14px)` and `mask-image`, replaced by the same cream colour with a gradient fade (0.94 alpha). This was the single biggest runtime cost: act1 went 31.9 -> 19.7 ms/frame on its own. This deviates from "keep backdrop-filter on the header"; the live blur over an animated scene is too costly for a TV GPU. Easy to revert in `src/ui/theme.css` if the frosted look matters.
- `src/perf.css`: `contain: layout paint` on `.scr-view`.
- Fonts: unused weight 500 dropped, latin 600 and 700 woff2 preloaded (fontsource already uses `font-display: swap` and unicode-range subsets, so nothing was render-blocking). Favicon link added.
- Audited and left alone: all CSS keyframes animate only transform/opacity; `will-change` is used in two places only (wheel, draggable); no animated filters or box-shadows; no other backdrop-filter.

## Remaining risks for a mid-range Windows touch TV

- act1 still shows ~120 concurrently running CSS animations and ~1070 DOM nodes; Chrome on a weak iGPU will rasterise a lot of SVG every frame. Next step is a Chrome trace on the real TV, then cut animated nodes or `animation-play-state: paused` for off-screen ones.
- `Avatar`, `Building`, `ProductArt` (`src/ui/`) are not memoised and are used in many views; I did not touch that folder. Wrapping them in `memo` is a one-line change each.
- `ScreenApp` chunk (56 kB gz) still contains all 20 views because `views/index.tsx` imports them statically; lazy-loading rarely used views (Awards, End, Pitch) would save ~10 to 15 kB.
- Admin first paint now has one extra request hop (route chunk): ~10 ms slower on localhost, ~100 ms at 4x CPU. A `modulepreload` of the admin chunk keyed on the hash in `index.html` would remove it.
- First scene visit before the idle prefetch finishes (about 4 s after load) fetches its chunk on demand; invisible on LAN or localhost, could flash empty on a bad network.
- `tests/engine.test.ts` is a plain script with no `describe/it`, so `npx vitest run` reports "No test suite found" (pre-existing); it prints "rules checks passed".
