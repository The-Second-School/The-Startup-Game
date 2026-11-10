import { useEffect, useState } from 'react';

/** Steps through `times` (ms from start) after `key` changes; returns how many marks have passed. */
export function useTimeline(key: unknown, times: number[]) {
  const [n, setN] = useState(0);
  const sig = times.join(',');
  useEffect(() => {
    setN(0);
    const ids = sig.split(',').filter(Boolean).map((t, i) => setTimeout(() => setN(i + 1), Number(t)));
    return () => ids.forEach(clearTimeout);
  }, [key, sig]);
  return n;
}

/** True once `ms` has passed since `key` changed. */
export function useAfter(key: unknown, ms: number) {
  return useTimeline(key, [ms]) >= 1;
}
