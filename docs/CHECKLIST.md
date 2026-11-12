# Checklist: who owns which of the 94 points (see POINTS.md for the words)

Agents: UI = ui kit / Fibbot / numbers / shapes / Ready status. A1 = lobby, players, names, keyboard. A2 = teams, roles, products.
B1 = question + mega flow, shared choice components. B2 = Price It Right. C1 = bug smash + auction. C2 = mood + mic.
D = leaderboard, progress, break, recap, pitch, awards, end. F1 = story scenes (acts) + scene player. F2 = question intro animations. G = admin phone.
ME = engine, content, script, voice, narration engine, layout, rail, final integration and tests.

| # | Owner | # | Owner | # | Owner | # | Owner |
|---|-------|---|-------|---|-------|---|-------|
| 1 | ME (voice) + all text | 25 | D (+ME rail) | 49 | D | 73 | ME engine + C1 view + G admin |
| 2 | ME (voice) | 26 | ME hook + every narrator | 50 | C2 + ME engine | 74 | C1 |
| 3 | ME | 27 | ME engine + B1 + B2 | 51 | C2 | 75 | UI |
| 4 | A1 (+ answer in report) | 28 | F1 + B1 + B2 | 52 | ME + C2 (answer in report) | 76 | C1 |
| 5 | A1 | 29 | F1 + B1 + D | 53 | C2 | 77 | ME engine + C2 |
| 6 | F1 + F2 (focus kit by ME) | 30 | B1 (+A2 roles strip) | 54 | all view owners | 78 | C2 |
| 7 | A1 | 31 | B1 | 55 | C2 | 79 | G |
| 8 | G | 32 | B1 | 56 | D | 80 | D + G + ME |
| 9 | A2 | 33 | B1 | 57 | ME voice + F1 | 81 | D |
| 10 | A1 + A2 + G + ME | 34 | B1 (superseded by 38) | 58 | B1 + C1 + F1 | 82 | all |
| 11 | A2 | 35 | B1 | 59 | B1 | 83 | ME + F1 |
| 12 | A1 + A2 | 36 | B1 (superseded by 38) | 60 | B1 | 84 | F1 + F2 |
| 13 | A2 | 37 | B1 | 61 | D | 85 | G |
| 14 | all view owners | 38 | B1 | 62 | C1 | 86 | ME voice |
| 15 | ME rail | 39 | UI | 63 | C1 | 87 | B2 |
| 16 | A1 + A2 | 40 | B1 | 64 | C1 | 88 | B2 |
| 17 | ME (answer) | 41 | B1 | 65 | C2 | 89 | B2 |
| 18 | ME content + UI art | 42 | UI + F1 + F2 | 66 | C1 + ME engine | 90 | UI (+ all adopt) |
| 19 | ME script + A1 + A2 | 43 | D | 67 | C2 + ME sfx | 91 | B1 + B2 |
| 20 | A1 | 44 | ME voice | 68 | ME script | 92 | B2 |
| 21 | A1 | 45 | B1 | 69 | B1 + F1 | 93 | B2 |
| 22 | F1 | 46 | B1 | 70 | F1 + F2 + B1 | 94 | B2 |
| 23 | UI | 47 | D + G + ME | 71 | B1 + F1 | | |
| 24 | F1 | 48 | B1 | 72 | C1 | | |

Verification: `npx tsc -b`, engine tests (`tests/engine.test.ts`), then one Playwright walk through the whole script at 1920x1080 and 390x844.
