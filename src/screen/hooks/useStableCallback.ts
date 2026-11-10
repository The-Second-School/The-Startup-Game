import { useCallback, useLayoutEffect, useRef } from 'react';

/** A callback whose identity never changes (safe for child effects that depend on it). */
export function useStableCallback<A extends unknown[]>(fn: (...a: A) => void) {
  const ref = useRef(fn);
  useLayoutEffect(() => { ref.current = fn; });
  return useCallback((...a: A) => ref.current(...a), []);
}
