# Admin notes

## How to test without the big screen (dev only, stripped from the production build)
- `/#/admin-preview?step=<SCRIPT id>&phase=<sub-phase>&teams=4|6` fakes a realistic state with the real engine and is fully interactive (local reducer, Undo works).
  Examples: `step=a1q1&phase=open|revealed|spotlight`, `step=price&phase=open`, `step=mega&phase=spotlight`, `step=bugs&phase=ready|playing|result`,
  `step=auction&phase=bidding|sold|bidding2`, `step=mood2&phase=team`, `step=mic1&phase=picked`, `step=pitch&phase=talking|voting`, `step=awards&phase=2`.
- `/#/admin-hostsim?room=TEST` is a stand-in host that runs the real screen store, so `/#/admin?room=TEST` can be tested live in a second tab.

## Engine / screen issues found (not fixed, worked around)
1. Timer clocks: `endsAt` is the screen's clock but the phone sends `now: Date.now()` for TIMER_PAUSE / TIMER_RESUME and shows `timerRemaining(state)` using its own clock. On two different devices with skewed clocks the countdown on the phone is off and pause can lose or gain time. Suggest the screen ignores `a.now` and uses its own `Date.now()`, and the state carries `remaining` for display.
2. `BUG_RESULT` applies its happiness delta every time it is received, so a double tap or re-send stacks it. The admin only offers the fallback once per team and tells the host to use Undo to change it.
3. `nextLabel` for `bugsmash` shows "Next team" after the last team's result (the phase then goes to `done`). Cosmetic.
4. `bugsmash` (ready/playing) and `mic` (spin) make NEXT a no-op, so the admin disables the big button and offers fallbacks (BUG_START, BUG_RESULT, MIC_PICK).
5. Awards are computed once when the step is entered. ADJUST after that does not update `step.results` (the admin preview shows what the screen will show).
6. `LOCK` for price accepts any number 10..100, not only multiples of 10 (the admin only sends multiples).

## Behaviour choices
- The admin sends its own heartbeat (`hello` every 2 s) so the screen answers with its state; the green dot is "state seen in the last 4 s". If the state is older, a full-screen "Waiting for the big screen…" overlay covers the app (the app underneath stays mounted so typed text is not lost).
- Text inputs for team names commit on Enter or blur, so typing does not fill the undo stack.
- The in-panel SOLD button was dropped: the big primary button already reads "SOLD!" while bidding.
