// Small view helpers on top of the engine.
import { OPTION_STYLES, ROLE_PLAN, TEAM_COLORS } from '../../game/content';
import type { Deltas, RoleId, Step, Team } from '../../game/types';

export const teamColors = (t: Team) => TEAM_COLORS[((t.colorIndex % TEAM_COLORS.length) + TEAM_COLORS.length) % TEAM_COLORS.length];
export const teamBase = (t: Team) => teamColors(t).base;
export const teamShade = (t: Team, i: number) => teamColors(t).shades[Math.max(0, Math.min(4, i))];

export const optionStyle = (i: number) => OPTION_STYLES[i % OPTION_STYLES.length];

export function actOf(step: Step): number {
  if ('act' in step) return step.act;
  if (step.kind === 'pitch' || step.kind === 'awards' || step.kind === 'end') return 6;
  return 0;
}

export const coinText = (c: number) => (c === 0 ? 'Free' : c > 0 ? `+${c} 🪙` : `−${-c} 🪙`);

export const isDefaultName = (name: string) => !name.trim() || /^Team \d+$/.test(name.trim());
export const teamName = (t: Team | null | undefined) => (t ? (t.name.trim() || 'This team') : 'Nobody');

export function moodFor(d: Deltas | undefined): 'happy' | 'sad' | 'wow' | 'cool' {
  if (!d) return 'cool';
  const sum = d.customers + d.happiness + d.coins / 10;
  if (sum >= 10) return 'wow';
  if (sum > 0) return 'happy';
  if (sum < 0) return 'sad';
  return 'cool';
}

export const ROLE_SHORT: Record<RoleId, string> = { ceo: 'CEO', money: 'Money', lock: 'Lock', speaker: 'Speaker', time: 'Timer' };

/** Role sets a member can cycle through for this team size ([] = no job yet). */
export function roleCycle(team: Team): RoleId[][] {
  const n = Math.max(3, Math.min(5, team.members.length));
  return [[], ...(ROLE_PLAN[n] ?? ROLE_PLAN[4])];
}
export const sameRoles = (a: RoleId[], b: RoleId[]) => a.length === b.length && a.every((r, i) => r === b[i]);

/** Roles the team still needs (from the plan for its size). */
export function missingRoles(team: Team): RoleId[] {
  const plan = roleCycle(team).slice(1).flat();
  const have = new Set(team.members.flatMap(m => m.roles));
  return plan.filter(r => !have.has(r));
}

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/** Coins scale for bars: the biggest coin count, at least 300. */
export const coinMax = (teams: Team[]) => Math.max(300, ...teams.map(t => t.coins));
