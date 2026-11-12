// Mic Time. Spin phase: explain what Mic Time is. Picked: name the team, say what the question is about, ask it.
// Done: one cheerful line, the applause itself is played by the view.
import { currentStep } from '../../game/engine';
import { micQuestionFor } from '../../game/helpers';
import type { GameState, Team } from '../../game/types';
import type { Narration } from '../types';

export function micActOf(s: GameState): number {
  const step = currentStep(s);
  return 'act' in step ? step.act : 1;
}

/** What each act's question is about, in simple words. */
const TOPIC: Record<number, string> = {
  1: 'asking real people instead of guessing',
  2: 'testing small before building big',
  3: 'playing fair, with no fake reviews',
  4: 'profit, the money you keep',
  5: 'being a fair partner',
};
export const micTopic = (act: number) => TOPIC[act] ?? 'what your team learned';

/** The choice this team made that shapes its question (the same one micQuestionFor looks at), or null if it is the plain question. */
export function micChoiceOf(team: Team, act: number): { label: string; trap: boolean } | null {
  if (act === 4) return null;
  const last = [...team.history].reverse().find(h => h.act === act && h.stepId !== 'bugsmash' && !h.stepId.startsWith('mood'));
  return last ? { label: last.label, trap: !!last.trap } : null;
}

export const micSpinText = 'One team is picked by chance. Its Speaker answers a question for the whole class. Everyone else listens.';
export const MIC_CLAP = 'Great answer! Give them a big clap!';

export function micNarration(s: GameState): Narration | null {
  const st = s.step;
  if (st.type !== 'mic') return null;
  const step = currentStep(s);

  if (st.phase === 'spin') {
    return {
      id: `mic-${step.id}-spin`,
      lines: [
        { text: 'Mic Time! One team is picked by chance.', tone: 'excited', pose: 'point' },
        { text: 'Its Speaker answers a question for the whole class. Everyone else listens.', gap: 700 },
        { text: 'Tap SPIN to find out who!', tone: 'excited', pose: 'point' },
      ],
      summary: 'One team is picked by chance. Its Speaker answers, everyone else listens.',
      showText: false,
    };
  }

  const team = st.teamId ? s.teams.find(t => t.id === st.teamId) : undefined;
  if (!team) return null;
  const name = team.name.trim() || 'This team';

  if (st.phase === 'picked') {
    const act = micActOf(s);
    const question = micQuestionFor(team, act);
    const own = micChoiceOf(team, act) ? ' It comes from your own choice.' : '';
    return {
      id: `mic-${step.id}-picked-${team.id}-${s.micPicked.length}`,
      lines: [
        { text: `${name}, the wheel picked you!`, tone: 'excited', pose: 'cheer', gap: 600 },
        { text: `This question is about ${micTopic(act)}.${own}`, gap: 600 },
        { text: question, pose: 'point', gap: 1200 },
      ],
      summary: question,
      showText: false,
    };
  }

  // done
  return {
    id: `mic-${step.id}-done-${team.id}`,
    lines: [{ text: MIC_CLAP, tone: 'excited', pose: 'cheer' }],
    showText: false,
  };
}
