// Keyboard fallback so the host can run the whole game from a laptop without the phone.
// Space / → = NEXT, Backspace = UNDO, P = pause/resume timer, 1..6 = team chip, Q/W/E/R = option 1..4,
// Enter = lock (or spin / start / make teams where that is the action). In the players and names steps
// letters type a name (digits 5/6/7 pick the class) and Enter adds it.
import { useEffect } from 'react';
import { QUESTIONS } from '../../game/content';
import { canAfford, currentStep, maxBid, teamById } from '../../game/engine';
import type { Grade } from '../../game/types';
import { sfx } from '../../audio';
import { useScreen } from '../../store/screenStore';
import { bus } from '../lib/bus';
import { stripOrder } from '../lib/order';
import { useUi } from '../lib/ui';
import { backspaceTyping, commitTyping, typeChar } from '../lib/typing';

const OPT_KEYS = ['q', 'w', 'e', 'r', 't'];

export function useKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tg = e.target as HTMLElement | null;
      if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return;
      const { state, dispatch } = useScreen.getState();
      const ui = useUi.getState();
      const step = currentStep(state);
      const st = state.step;
      const key = e.key;
      const lower = key.toLowerCase();

      // ---- Typing names (players + team names) ----
      if (step.kind === 'setup_players' || step.kind === 'setup_names') {
        const isChar = key.length === 1 && /[\p{L}'.\- ]/u.test(key);
        if (isChar && !(key === ' ' && !ui.typing)) { e.preventDefault(); typeChar(key); return; }
        if (step.kind === 'setup_players' && ['5', '6', '7'].includes(key)) { ui.setGrade(Number(key) as Grade); sfx.play('tap'); return; }
        if (key === 'Escape') { ui.setTyping(''); return; }
        if (key === 'Backspace' && ui.typing) { e.preventDefault(); backspaceTyping(); return; }
        if (key === 'Enter' && ui.typing.trim()) { e.preventDefault(); commitTyping(); return; }
      }

      if (key === ' ' || key === 'ArrowRight') {
        e.preventDefault();
        if (e.repeat) return;
        if (st.type === 'bugsmash' && st.phase === 'turn' && st.turnPhase === 'ready') { dispatch({ type: 'BUG_START' }); return; }
        if (st.type === 'mic' && st.phase === 'spin') { bus.emit('spin'); return; }
        dispatch({ type: 'NEXT' });
        return;
      }
      if (key === 'Backspace') { e.preventDefault(); dispatch({ type: 'UNDO' }); return; }
      if (lower === 'p') {
        if (state.timer.running) dispatch({ type: 'TIMER_PAUSE', now: Date.now() });
        else if (state.timer.remaining > 0) dispatch({ type: 'TIMER_RESUME', now: Date.now() });
        return;
      }

      const isChoice = (st.type === 'question' || st.type === 'price' || st.type === 'megaorder') && st.phase === 'open';

      // ---- Team keys ----
      if (/^[1-6]$/.test(key)) {
        const team = stripOrder(state)[Number(key) - 1];
        if (!team) return;
        if (isChoice) {
          if (st.locks[team.id] !== undefined) { sfx.play('buzz'); return; }
          dispatch({ type: 'SELECT_TEAM', teamId: st.selectedTeamId === team.id ? null : team.id });
          ui.setPick(null);
          return;
        }
        if (step.kind === 'setup_roles') { ui.setRolesTeam(team.id); sfx.play('tap'); return; }
        ui.setKbTeam(team.id);
        sfx.play('tap');
        return;
      }

      // ---- Option keys ----
      const oi = OPT_KEYS.indexOf(lower);
      if (oi >= 0) {
        if (isChoice && st.selectedTeamId) {
          const team = teamById(state, st.selectedTeamId);
          if (!team) return;
          if (st.type === 'question' && step.kind === 'question' && oi < 4) {
            const o = QUESTIONS[step.qId].options[oi];
            if (!canAfford(team, o.coins)) { sfx.play('buzz'); return; }
            ui.setPick(oi); sfx.play('pop');
          } else if (st.type === 'megaorder' && oi < 4) {
            ui.setPick(oi); sfx.play('pop');
          } else if (st.type === 'price' && oi < 2) {
            const cur = ui.pick ?? 50;
            ui.setPick(Math.max(10, Math.min(100, cur + (oi === 0 ? -10 : 10)))); sfx.play('tick');
          }
          return;
        }
        if (st.type === 'auction' && st.phase === 'bidding') {
          if (oi === 3) { dispatch({ type: 'BID', by: 'raivan', amount: st.bid.amount + 10 }); return; }
          if (oi < 3 && ui.kbTeam) {
            const bidder = teamById(state, ui.kbTeam);
            const amount = st.bid.amount + [10, 20, 50][oi];
            // Over the reserve limit (coins minus 50) or a team that already won: refuse with a buzz instead of a silent no-op.
            const won = Object.values(st.winners).some(w => w.by === ui.kbTeam);
            if (!bidder || won || amount > maxBid(bidder)) { sfx.play('buzz'); return; }
            dispatch({ type: 'BID', by: ui.kbTeam, amount });
          }
          return;
        }
        if (st.type === 'pitch' && st.phase === 'voting' && ui.kbTeam) {
          const pitcher = state.teams[st.index];
          if (pitcher && ui.kbTeam !== pitcher.id) dispatch({ type: 'VOTE', pitcherId: pitcher.id, voterId: ui.kbTeam, stars: oi + 1 });
          return;
        }
        return;
      }

      if (key === 'Enter') {
        e.preventDefault();
        if (isChoice) {
          if (st.selectedTeamId && ui.pick !== null) {
            dispatch({ type: 'LOCK', teamId: st.selectedTeamId, choice: ui.pick });
            ui.setPick(null);
          }
          return;
        }
        if (st.type === 'bugsmash' && st.phase === 'turn' && st.turnPhase === 'ready') { dispatch({ type: 'BUG_START' }); return; }
        if (st.type === 'pitch' && st.phase === 'ready') { dispatch({ type: 'PITCH_START' }); return; }
        if (step.kind === 'setup_products' || (st.type === 'mic' && st.phase === 'spin')) { bus.emit('spin'); return; }
        if (step.kind === 'setup_teams') { bus.emit('makeTeams'); return; }
        if (step.kind === 'setup_roles') { bus.emit('fillRoles'); return; }
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
}
