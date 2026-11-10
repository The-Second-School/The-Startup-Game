// Tiny event bus so keyboard shortcuts can trigger on-screen actions that live inside views (spin, start...).
export type BusEvent = 'spin' | 'start' | 'makeTeams' | 'fillRoles';
type Fn = () => void;
const subs = new Map<BusEvent, Set<Fn>>();

export const bus = {
  on(ev: BusEvent, fn: Fn) {
    if (!subs.has(ev)) subs.set(ev, new Set());
    subs.get(ev)!.add(fn);
    return () => { subs.get(ev)?.delete(fn); };
  },
  emit(ev: BusEvent) { subs.get(ev)?.forEach(f => f()); },
  has(ev: BusEvent) { return (subs.get(ev)?.size ?? 0) > 0; },
};
