// Local (screen-only) UI state that is not part of the game: the option a Lock Master has tapped
// before locking, keyboard-selected teams, and the keyboard typing buffer.
import { create } from 'zustand';
import type { Grade } from '../../game/types';

interface UiStore {
  pick: number | null;            // option index (question / mega) or price in rupees (price)
  setPick: (p: number | null) => void;
  kbTeam: string | null;          // team picked with number keys where the engine has no selection (auction, votes, names)
  setKbTeam: (id: string | null) => void;
  typing: string;
  setTyping: (t: string) => void;
  grade: Grade;
  setGrade: (g: Grade) => void;
  rolesTeam: string | null;       // team whose members are shown in the roles view
  setRolesTeam: (id: string | null) => void;
}

export const useUi = create<UiStore>(set => ({
  pick: null,
  setPick: pick => set({ pick }),
  kbTeam: null,
  setKbTeam: kbTeam => set({ kbTeam }),
  typing: '',
  setTyping: typing => set({ typing }),
  grade: 5,
  setGrade: grade => set({ grade }),
  rolesTeam: null,
  setRolesTeam: rolesTeam => set({ rolesTeam }),
}));
