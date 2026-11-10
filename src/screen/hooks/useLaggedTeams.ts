import { useEffect, useState } from 'react';
import type { Team } from '../../game/types';

/**
 * Meter values that trail the real ones by `lag` ms, so the strip and leaderboards count up
 * AFTER the story card has popped its delta pills. Names, members and order are always live.
 */
export function useLaggedTeams(teams: Team[], lag = 1500): Team[] {
  const [shown, setShown] = useState(teams);
  useEffect(() => {
    if (shown === teams) return;
    const id = setTimeout(() => setShown(teams), lag);
    return () => clearTimeout(id);
  }, [teams, shown, lag]);
  return teams.map(t => {
    const o = shown.find(x => x.id === t.id);
    return o ? { ...t, customers: o.customers, happiness: o.happiness, coins: o.coins } : t;
  });
}
