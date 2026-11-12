// App-level sound cues for state events (from any source: tap, keyboard or phone).
// Animation-synced cues (delta pills, splats, wheel ticks) live inside the views. ONE OWNER PER CUE: Bug Smash's countdown,
// splats, result sting and the auction's drumroll / evil sting / gavel / SOLD fanfare are played by the views (they are timed
// to staged beats and to the narrator), so this hook must NOT play them. The hook only owns the coin ding when a bid arrives.
import { useEffect, useRef } from 'react';
import { currentStep, timerRemaining } from '../../game/engine';
import type { GameState } from '../../game/types';
import { sfx } from '../../audio';
import { useNow } from './useNow';

const lockCount = (s: GameState) =>
  s.step.type === 'question' || s.step.type === 'price' || s.step.type === 'megaorder' ? Object.keys(s.step.locks).length : 0;
const phaseOf = (s: GameState) => ('phase' in s.step ? s.step.phase : '');

export function useGameSounds(state: GameState) {
  const prev = useRef<GameState | null>(null);
  useEffect(() => {
    const p = prev.current;
    prev.current = state;
    if (!p || p === state) return;
    const st = state.step;
    if (p.stepIndex !== state.stepIndex) { sfx.play('whoosh'); return; }
    if (p.players.length < state.players.length) sfx.play('pop');
    else if (p.players.length > state.players.length) sfx.play('tap');
    const lc = lockCount(state), plc = lockCount(p);
    if (lc > plc) {
      sfx.play('lock');
      if (lc === state.teams.length && lc > 0) setTimeout(() => sfx.play('ding'), 350);
    }
    if ((st.type === 'question' || st.type === 'price' || st.type === 'megaorder') && p.step.type === st.type) {
      if (st.selectedTeamId && st.selectedTeamId !== (p.step as typeof st).selectedTeamId) sfx.play('tap');
    }
    const ph = phaseOf(state), pph = phaseOf(p);
    if (ph !== pph) {
      if (ph === 'open') sfx.play('pop');
      if (ph === 'revealed') sfx.play('whoosh');
      if (ph === 'done' && st.type !== 'mic') sfx.play('cheer');
      if (ph === 'talking') sfx.play('ding');
      if (ph === 'voting') sfx.play('pop');
      if (ph === 'bidding' && pph === 'intro') sfx.play('pop');
      if (ph === 'bidding' && pph === 'sold') sfx.play('whoosh');   // next billboard
      if (ph === 'turn' && pph === 'intro') sfx.play('pop');         // Bug Smash: first team's turn
    }
    if (st.type === 'auction' && p.step.type === 'auction' && st.bidLog.length > p.step.bidLog.length) sfx.play('coin');
    if (st.type === 'bugsmash' && p.step.type === 'bugsmash' && st.turn !== p.step.turn) sfx.play('whoosh');   // next team's turn
    if (Object.keys(state.votes).length && JSON.stringify(state.votes) !== JSON.stringify(p.votes)) sfx.play('pop');
    const named = state.teams.filter((t, i) => p.teams[i] && t.name !== p.teams[i].name).length;
    if (named) sfx.play('cheer');
    const prods = state.teams.filter((t, i) => p.teams[i] && t.productId && t.productId !== p.teams[i].productId).length;
    if (prods) sfx.play('ding');
    const roles = state.teams.some((t, i) => p.teams[i] && t.members !== p.teams[i].members && t.members.length === p.teams[i].members.length);
    if (roles && currentStep(state).kind === 'setup_roles') sfx.play('pop');
  }, [state]);

  // Timer: tick each second under 10 s, buzz at zero.
  const now = useNow(state.timer.running, 200);
  const lastSec = useRef(-1);
  useEffect(() => {
    if (!state.timer.running) { lastSec.current = -1; return; }
    const sec = Math.ceil(timerRemaining(state, now) / 1000);
    if (sec === lastSec.current) return;
    const was = lastSec.current;
    lastSec.current = sec;
    if (was === -1) return;
    if (sec === 0) sfx.play('buzz');
    else if (sec <= 10) sfx.play('tick');
  }, [now, state]);
}
