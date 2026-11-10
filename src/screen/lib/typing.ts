// Shared typing actions: used by the physical keyboard handler (useKeyboard) and the on-screen touch keyboard.
import { currentStep, teamById } from '../../game/engine';
import { uid } from '../../game/helpers';
import { useScreen } from '../../store/screenStore';
import { isDefaultName } from './game';
import { useUi } from './ui';

export const MAX_NAME = 24;

/** Smart title case: the next letter is a capital at the start of the text and after a space or hyphen. */
export const shouldCap = (typed: string) => typed === '' || /[\s-]$/.test(typed);
export const caseChar = (typed: string, ch: string) => (/\p{L}/u.test(ch) ? (shouldCap(typed) ? ch.toUpperCase() : ch.toLowerCase()) : ch);

export function typeChar(ch: string) {
  const { state } = useScreen.getState();
  const ui = useUi.getState();
  const step = currentStep(state);
  if (ch === ' ' && !ui.typing) return;
  if (ui.typing.length < MAX_NAME) ui.setTyping(ui.typing + caseChar(ui.typing, ch));
  if (step.kind === 'setup_names' && !ui.kbTeam) {
    const free = state.teams.find(t => isDefaultName(t.name)) ?? state.teams[0];
    if (free) ui.setKbTeam(free.id);
  }
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
    const target = teamById(state, ui.kbTeam) ?? state.teams.find(t => isDefaultName(t.name)) ?? null;
    if (!target) return false;
    dispatch({ type: 'SET_TEAM_NAME', teamId: target.id, name });
    const after = useScreen.getState().state;
    ui.setKbTeam(after.teams.find(t => isDefaultName(t.name))?.id ?? null);
  } else return false;
  ui.setTyping('');
  return true;
}
