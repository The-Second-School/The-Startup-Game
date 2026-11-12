// Narration for Show Day: the pitches, the star voting, the awards countdown and the thank-you end screen.
import { currentStep, success } from '../../game/engine';
import { PITCH_MS, productById } from '../../game/content';
import { memberWithRole } from '../../game/helpers';
import type { AwardResult, GameState } from '../../game/types';
import { teamName } from '../../screen/lib/game';
import type { NarrLine, Narration } from '../types';

function pitchNarr(s: GameState): Narration | null {
  if (s.step.type !== 'pitch') return null;
  const st = s.step;
  const team = s.teams[st.index];
  if (st.phase === 'done' || !team) {
    return {
      id: 'pitch-done',
      lines: [
        { text: 'What a show! Every startup has pitched.', tone: 'cheer', pose: 'cheer', gap: 700 },
        { text: 'Now it is time for the Golden Trophy!', tone: 'excited', pose: 'point' },
      ],
      summary: 'Every startup has pitched. Time for the Golden Trophy!',
    };
  }
  const name = teamName(team);
  const speaker = memberWithRole(team, 'speaker');
  const product = productById(team.productId);
  const secs = PITCH_MS / 1000;

  if (st.phase === 'voting') {
    return {
      id: `pitch-${st.index}-voting`,
      lines: [
        { text: `Time to vote for ${name}! Show 1 to 5 fingers!`, tone: 'excited', pose: 'point', gap: 700 },
        { text: 'Be fair! One finger means okay, five fingers means amazing.', pose: 'talk' },
      ],
      summary: `Vote for ${name}: show 1 to 5 fingers. Be fair!`,
    };
  }
  if (st.phase === 'talking') {
    return {
      id: `pitch-${st.index}-talking`,
      lines: [{ text: `${speaker ? speaker.name : 'Speaker'}, the stage is yours! Everyone else, listen closely.`, tone: 'excited', pose: 'cheer' }],
    };
  }
  const lines: NarrLine[] = [
    { text: `Show Day pitch for ${name}!`, tone: 'excited', pose: 'cheer', gap: 600 },
    { text: `${speaker ? speaker.name : 'The Speaker'} will tell the story of ${product ? product.name : 'this startup'}. You have ${secs} seconds.`, pose: 'talk', gap: 600 },
    { text: 'Everybody else, listen well. You will give stars after!', pose: 'point' },
  ];
  return { id: `pitch-${st.index}-ready`, lines, summary: `${name} pitches next. ${secs} seconds, then everyone gives stars.` };
}

function spokenReason(res: AwardResult, s: GameState): string {
  const team = s.teams.find(t => t.id === res.teamId);
  if (!team) return '';
  switch (res.id) {
    case 'banana': return 'You slipped the most today, but you kept smiling. That is the real winner spirit!';
    case 'pitch': return 'The other teams loved your pitch!';
    case 'customer': return `You won ${team.customers} customers!`;
    case 'happiness': return `Your customers are the happiest. You have ${team.happiness} happiness!`;
    case 'champion': return `Your Success score is ${success(team)} out of 100!`;
  }
}

function awardsNarr(s: GameState): Narration | null {
  if (s.step.type !== 'awards') return null;
  const st = s.step;
  const r = st.reveal;
  if (r === 0) {
    return {
      id: 'awards-intro',
      lines: [
        { text: 'Awards time!', tone: 'cheer', pose: 'cheer', gap: 600 },
        { text: 'Five awards are waiting. We count down from number 5 to number 1!', tone: 'excited', pose: 'talk', gap: 600 },
        { text: 'Who will win the Golden Trophy? Drumroll please!', tone: 'excited', pose: 'point' },
      ],
      summary: 'Five awards, counting down from 5 to 1. Who wins the Golden Trophy?',
    };
  }
  const res = st.results[r - 1];
  const team = res ? s.teams.find(t => t.id === res.teamId) : null;
  if (!res || !team) return null;
  const name = teamName(team);
  const champ = res.id === 'champion';
  const banana = res.id === 'banana';
  const lines: NarrLine[] = [
    { text: `Award number ${res.rank}: ${res.title}!`, tone: 'excited', pose: 'point', gap: 400 },
    { text: 'And the winner is...', tone: 'excited', pose: 'think', gap: 1500 },
    { text: `${name}!`, tone: banana ? 'normal' : 'cheer', pose: banana ? 'talk' : 'cheer', gap: 700 },
    { text: spokenReason(res, s), tone: banana ? 'calm' : champ ? 'cheer' : 'excited', pose: banana ? 'talk' : 'cheer', gap: 500 },
  ];
  if (champ) {
    lines.push({ text: 'Congratulations! You win the Golden Trophy!', tone: 'cheer', pose: 'cheer', gap: 900 });
    lines.push({ text: 'Look! The hidden Success board is open now. It shows how every team did.', tone: 'excited', pose: 'point' });
  }
  return { id: `awards-${r}`, lines, summary: `${res.title}: ${name}!` };
}

function endNarr(): Narration {
  return {
    id: 'end',
    lines: [
      { text: 'Thank you for playing! You were wonderful!', tone: 'cheer', pose: 'cheer', gap: 700 },
      { text: 'You built real startups in Techistan. Keep asking, keep building and always be honest.', tone: 'excited', pose: 'talk', gap: 700 },
      { text: 'See you next time, startup stars!', tone: 'cheer', pose: 'wave' },
    ],
    summary: 'Thank you for playing! Keep asking, building and being honest.',
  };
}

export function showNarration(s: GameState): Narration | null {
  switch (currentStep(s).kind) {
    case 'pitch': return pitchNarr(s);
    case 'awards': return awardsNarr(s);
    case 'end': return endNarr();
    default: return null;
  }
}
