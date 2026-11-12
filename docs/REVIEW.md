# Content and rules review

Scope: `src/game/content.ts`, `engine.ts`, `types.ts`, `helpers.ts`, tests. Balance tool: `npx -y tsx tests/sim.ts 500` (add `audit` to rate every option). Rules checks: `npx -y tsx tests/engine.test.ts`.

## 1. Story and questions
Findings and fixes (all in `content.ts`):
- Act scenes are animated per beat index (`src/scenes/acts/*`), so beat count and order are frozen. Only wording was changed.
- Act 4 teased the sharks before Price It Right, but sharks come after the price question. Beat now says "later today... boats will sail in".
- How-to never explained unhappy customers leaving (Customer Mood) or Mic Time. Both added into existing beats 1 and 4.
- a1q2 "Hide it" cost 10 coins with no reason (sock drawer). Now "Lock it in a strong box" (a lock costs coins). "Tell everyone first" cost 20 coins for shouting; story now says printed flyers.
- a2q1 title said "version 1" (jargon). Now "the first version of your product".
- Traps were not always worse than honest mistakes: "20 features" and "Cut price" scored about the same as the trap. Rebalanced (audit below). Trap penalties raised so every trap is the worst or second worst choice in its question.
- a2q1 and a5q1 had NO free honest option (a broke team was forced into the trap). Now "Build super fast" and "Cut price" are free. The test file asserts every question has a free honest option.
- a3q1 hid the rule that word of mouth needs happy customers. Added sub line "happy customers love to talk" (threshold stays hidden).
- Price hints for BookSwap, HomeworkBuddy, FarmFriend, RoomBot, PartyPal pointed at the wrong price (storybook cost vs a ₹10 swap). Reworded to point at the best price. Price result texts no longer claim a customer loss that the numbers do not apply.
- Mic Q4 used ₹100 / ₹60 (odd for tiffin); now ₹50 / ₹30.
- Bolt lines checked: short, simple, kid-safe. No change besides the above.

Option value audit (kid team, average final Success change vs baseline, 400 games): best honest option is always +3 to +8, honest mistakes -2 to -6 (copy/features/cut price), traps -6 to -12. Price: perfect +4, off by 10 -3, off by 20 -6, off 30+ -10.

## 2. Scoring balance
Changes: `SUCCESS_DIVISOR` 250 to 280 (all-smart teams were pinned at the 100 cap: 56% ties, mean 94). Auction bids keep a 50 coin reserve (`AUCTION_RESERVE`, `maxBid(team)`): random play used to go to 0 coins and become unwinnable. Odd team count in Mega Order fixed (section 4). Awards fixed (section 4). Start values and meter max unchanged.

Monte Carlo (500 games each, 4 teams unless noted). "kid" = 50% best choice, 15% trap, 35% random.

| Table | Winner | Avg success | Top avg / gap 1-2 | Tied top | Tiny Stall teams |
|---|---|---|---|---|---|
| 4 kids | n/a | 46 | 66 / 15 | 3% | 16% |
| 5 kids | n/a | 47 | 69 / 15 | 2% | 12% |
| 3 kids | n/a | 48 | 64 / 17 | 2% | 10% |
| 6 kids | n/a | 47 | 72 / 14 | 3% | 14% |
| smart + 3 kids | smart 82% | 82 vs 48 | 84 / 25 | 2% | 9% |
| honest-slow + 3 kids | honest 9% | 42 vs 49 | 66 / 15 | 3% | 12% |
| cheater + 3 kids | cheater 0% | 13 vs 42 | 55 / 14 | 3% | 38% |
| smart, honest, rich-only, cheater | smart 100% | 61 / 24 / 5 / 13 | 61 / 38 | 0% | 67% |
| all smart | n/a | 86 | 96 / 6 | 10% | 0% |
| 5 mixed (incl. cheater, rich) | smart 98% | 58 / 29 / 32 / 16 / 5 | 59 / 23 | 0% | 48% |

- Smart play usually wins (82% against kids, near 100% against clearly worse play), but kids' tables stay open: 44 to 49% of games are won by a team that was not leading after Act 3, and 15 to 30% finish within 5 points.
- Rich-only is the worst strategy (Success 5): coins alone never win. Cheater 13. Honest but slow is mid table (42 to 46), not punished.
- Nobody is eliminated: minimum coins ever 50 (reserve), Mega Order pairs best with worst, and mood only moves customers by 2 to 5.
- Ties at the top are 2 to 3% for kids; tie-break is Happiness, then Coins, then team order.
- Residual risk: a team of kids that falls for 3+ traps ends in Tiny Stall (about 1 in 7). Host can use Settings meter adjust for a morale rescue.
- Voting: teams can vote down rivals. Best Pitch does not touch Success, so stakes are low. Host should say "be fair".

## 3. Timings (4 teams, 20 kids; 5 teams adds about 10 percent)
Estimate = narration + discussion + host taps.

| Block | Estimate | Verdict |
|---|---|---|
| Lobby, welcome scene | 3 min | ok |
| Players (type 20 names), teams, roles, product wheel, names | 15 min | long but one-time; the longest is typing names (4 min) |
| How-to scene | 1 min | ok |
| 9 scenes in total | 5 min | ok (30 to 60 s each) |
| Question (7 of them: a1q1, a1q2, a2q1, a3q1, price, a4q2, a5q1) | 2.5 to 3 min each, 20 min | ok. Open phase 60 s is tight for the long a4q2 and a5q1 titles; host can add 15 s |
| Bug Smash | 3 min | ok |
| Auction (2 tickets) | 3.5 min | ok |
| Mega Order | 4 min | ok |
| Customer mood x5 | 20 s content but n+2 taps, 2 min in all | too many taps, see section 5 |
| Mic Time x5 | 1.5 to 2 min each, 9 min | longest block with no score effect. Keep Speaker answers to 30 s |
| Boards x5 | 0.5 min each, 3 min | ok |
| Snack break | 5 to 10 min | host decides |
| Pitch (45 s plus 30 s votes per team) | 6 to 7.5 min | ok |
| Finale scene, awards, end | 4 min | ok |

Total about 88 min (4 teams), 95 min (5 teams), 105 min (6 teams). Inside the 90 to 110 target. Too short: nothing. Too long if the room is slow: Mic Time (skip Acts 2 and 4 mic), setup.

## 4. Edge cases (all covered in `tests/engine.test.ts`)
- 3 to 6 teams, 12 to 30 players: full game plays to the end, meters stay in range, Success 0 to 100. Settings type widened to `3|4|5|6`; `suggestTeamCount(players)` added to `helpers.ts` (12-15: 4 or 3, 16-20: 4, 21-25: 5, 26-30: 6).
- Mega Order with odd teams: the middle team used to be left out with no outcome and no reward. Now `MegaState.solo` holds it and it receives a fair solo order (10 customers, 50 coins) when the last pair is shown. Pairs are still strongest with weakest.
- Mega Order logic: both pick 0 equal; 1 + 2 split; either 3 no deal; anything else (including no lock) broken. `LOCK` now rejects choices outside 0 to 3.
- Auction ticket count is `ceil(teams/2)` (was floor): 3 teams 2 tickets, 5 teams 3. A team that already won cannot bid again. A bid must be strictly higher, so a tie goes to the first bid entered. Fibbot winning gives nobody the ticket.
- Awards: champion is the top Success. Awards 2 to 4 now use a best-match search so every award goes to a different team (needs 4 or more teams) and each team gets the award it ranks best for. Before, Best Pitch went to whichever team was left over, so votes did not matter. Banana Peel is never the champion. With 3 teams one award must repeat. Ties: Happiness, Coins, team order.
- Team with 0 coins: can lock any free option (every question has one honest free option), cannot bid, never goes below 0.
- Undo is store level (`screenStore`), not in the engine. `JUMP` back into a question or auction replays its effects; use Undo instead.
- Known, not fixed: `BUG_RESULT` stacks if sent twice (admin notes it); Awards computed once at entry (ADJUST updates them only before the first reveal).

## 5. Controls (admin `info.ts` guide vs engine `nextLabel`)
Labels differ by design (the guide is more specific) but the actions match: every guide label maps to the same NEXT transition as the engine. Host taps per step (n teams): question n+4, mood n+2, bug smash n+1 (plus the Lock Master START each turn), auction 2 per ticket + 2, mega pairs+4, pitch 3 per team, awards 6.
Problems outside my files (please pass on):
1. `src/admin/panels/Live.tsx` lines 47 and 68: bid pad allows up to `team.coins`. Engine now refuses above `maxBid(team)` (coins minus 50), so the button looks active but does nothing. Use `maxBid` from `game/engine`, and show "Not enough coins" accordingly. `useKeyboard.ts` BID has the same gap.
2. `src/admin/panels/Setup.tsx` offers only 4 or 6 teams. The brief is 4 to 5 teams, and `suggestTeamCount` and 3/5 are now valid. Add 3 and 5 chips (types already allow it).
3. Mega Order with odd teams: `src/screen/views/MegaView.tsx` waits for all teams to lock (`allLocked`) and writes "choosing..." for the solo team; read `st.solo` to show "sits out, gets a solo order" and skip it. The solo reward appears as meter change plus history entry "Solo order" after the last pair; screen could show a small card.
4. `src/admin/info.ts` Mega copy says "N of teams locked"; exclude `st.solo`.
5. Customer mood: host taps once per team for a 2.5 s animation. Suggest the screen auto-advances through teams (engine already applies each team's change per index) so the host taps once.
6. `npx tsc --noEmit -p tsconfig.app.json` reports one existing error in `src/scenes/kit/props.tsx(133,55)`: unused `edge` (TS6133). Not touched.
7. Tiny Stall stage threshold (0 to 25) is where 10 to 17% of kid teams end; consider a kinder first stage name or show only the building, not the number.
