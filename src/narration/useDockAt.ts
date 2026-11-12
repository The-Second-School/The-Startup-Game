// A view calls useDockAt({ x, y, w }) to put the mascot + speech bubble where it fits its layout (for example right under the heading).
// Without it the dock sits at the top-left. The slot is released when the view goes away.
import { useEffect, useId } from 'react';
import { useNarr } from './store';

export function useDockAt(x: number, y: number, w = 1100) {
  const owner = useId();
  useEffect(() => {
    useNarr.getState().set({ dock: { x, y, w, owner } });
    return () => { if (useNarr.getState().dock?.owner === owner) useNarr.getState().set({ dock: null }); };
  }, [x, y, w, owner]);
}
