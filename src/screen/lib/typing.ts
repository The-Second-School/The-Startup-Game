// Shared typing actions: used by the physical keyboard handler (useKeyboard) and the on-screen touch keyboard.
import { currentStep } from '../../game/engine';
import type { GameState } from '../../game/types';
import { uid } from '../../game/helpers';
import { useScreen } from '../../store/screenStore';
import { isDefaultName } from './game';
import { useUi } from './ui';

export const MAX_NAME = 24;

/** Smart title case: the next letter is a capital at the start of the text and after a space or hyphen. */
export const shouldCap = (typed: string) => typed === '' || /[\s-]$/.test(typed);
export const caseChar = (typed: string, ch: string) => (/\p{L}/u.test(ch) ? (shouldCap(typed) ? ch.toUpperCase() : ch.toLowerCase()) : ch);

/** The team that receives the next typed name: the one picked with a number key while it is still unnamed, else the first unnamed team. */
export function namingTeamId(state: GameState, kbTeam: string | null): string | null {
  const open = state.teams.filter(t => isDefaultName(t.name));
  return (open.find(t => t.id === kbTeam) ?? open[0])?.id ?? null;
}

export function typeChar(ch: string) {
  const { state } = useScreen.getState();
  const ui = useUi.getState();
  const step = currentStep(state);
  if (ch === ' ' && !ui.typing) return;
  if (step.kind === 'setup_names') {
    const id = namingTeamId(state, ui.kbTeam);
    if (!id) return;                      // every team is named: nothing left to type
    if (ui.kbTeam !== id) ui.setKbTeam(id);
  }
  if (ui.typing.length < MAX_NAME) ui.setTyping(ui.typing + caseChar(ui.typing, ch));
}

export function backspaceTyping() {
  const ui = useUi.getState();
  ui.setTyping(ui.typing.slice(0, -1));
}

/** Enter / Add / OK: adds a player or names the selected team. Returns true when something was committed. */
export function commitTyping(): boolean {
  const { state, dispatch } = useScreen.getState();
  const ui = useUi.getState();
  const step = currentStep(state);
  if (!ui.typing.trim()) return false;
  const name = ui.typing.trim().replace(/\s+/g, ' ');
  if (step.kind === 'setup_players') {
    dispatch({ type: 'ADD_PLAYER', player: { id: `k${uid()}`, name, grade: ui.grade } });
  } else if (step.kind === 'setup_names') {
    const target = namingTeamId(state, ui.kbTeam);
    if (!target) return false;
    dispatch({ type: 'SET_TEAM_NAME', teamId: target, name });
    const after = useScreen.getState().state;
    ui.setKbTeam(after.teams.find(t => isDefaultName(t.name))?.id ?? null);
  } else return false;
  ui.setTyping('');
  return true;
}
