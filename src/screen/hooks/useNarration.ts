// Bolt reads key lines aloud when settings.voice is on (scenes narrate themselves).
import { useEffect, useRef } from 'react';
import { MIC_QUESTIONS, MOOD, QUESTIONS } from '../../game/content';
import { currentStep } from '../../game/engine';
import { memberWithRole } from '../../game/helpers';
import type { GameState } from '../../game/types';
import { voice } from '../../audio';

function lineFor(s: GameState): string | null {
  const step = currentStep(s);
  const st = s.step;
  if (st.type === 'question' && step.kind === 'question') {
    const q = QUESTIONS[step.qId];
    if (st.phase === 'intro') return q.boltIntro;
    if (st.phase === 'open') return q.title;
    if (st.phase === 'spotlight') { const t = s.teams[st.spotlight]; return t ? st.stories[t.id] ?? null : null; }
  }
  if (st.type === 'price') {
    if (st.phase === 'open') return 'Pick the best price for your product!';
    if (st.phase === 'spotlight') { const t = s.teams[st.spotlight]; return t ? st.stories[t.id] ?? null : null; }
  }
  if (st.type === 'megaorder' && st.phase === 'spotlight') return st.outcomes[st.spotlight]?.text ?? null;
  if (st.type === 'mood' && st.phase === 'team') {
    const t = s.teams[st.index]; const m = t ? st.pending[t.id] : null;
    if (!m) return null;
    return m.kind === 'left' ? MOOD.text.left(-m.customers) : m.kind === 'joined' ? MOOD.text.joined(m.customers) : MOOD.text.same;
  }
  if (st.type === 'mic' && st.phase === 'picked') {
    const t = s.teams.find(x => x.id === st.teamId);
    const sp = t ? memberWithRole(t, 'speaker') : null;
    const act = 'act' in step ? step.act : 1;
    return `${sp ? sp.name + ' from ' : ''}${t?.name ?? ''}, here is my question. ${MIC_QUESTIONS[act] ?? ''}`;
  }
  if (st.type === 'pitch' && st.phase === 'voting') return 'Show one to five fingers!';
  if (st.type === 'awards' && st.reveal > 0) {
    const r = st.results[st.reveal - 1]; const t = s.teams.find(x => x.id === r?.teamId);
    return r && t ? `The ${r.title} goes to... ${t.name}!` : null;
  }
  return null;
}

export function useNarration(state: GameState) {
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!state.settings.voice) { last.current = null; return; }
    const line = lineFor(state);
    if (!line || line === last.current) return;
    const delay = state.step.type === 'awards' ? 2200 : 300;
    const id = setTimeout(() => {
      last.current = line;
      voice.say(line.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, ''));
    }, delay);
    return () => clearTimeout(id);
  }, [state]);
}
