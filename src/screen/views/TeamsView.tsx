// Make teams. All the kids swirl round the screen like a whirlpool (faster and faster, with near misses and a drumroll),
// then one by one every chip swoops along the same curve and squashes into its team box. Then the avatars hatch.
// Everything is placed with maths in stage coordinates and moved with transforms only.
import '../setup2.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Confetti, CountUp } from '../../ui';
import { makeTeams, suggestTeamCount } from '../../game/helpers';
import type { Grade, Team } from '../../game/types';
import { sfx } from '../../audio';
import { teamsSig } from '../../narration/lines/setupTeams';
import { useGame } from '../lib/ctx';
import { bus } from '../lib/bus';
import { GRADE_COLORS } from '../lib/grade';
import { inputLocked, lockInput, unlockInput } from '../lib/tap';
import { teamColors } from '../lib/game';
import { BigButton } from '../components/BigButton';
import { Hatch } from '../components/Hatch';
import { Tap } from '../components/Tap';
import { useStableCallback } from '../hooks/useStableCallback';
import { useDockAt } from '../../narration/useDockAt';

// ---------------------------------------------------------------- geometry (stage 1920 x 1080)
const COL_TOP = 292, COL_H = 576, SLOTS_TOP = 250;
const CHIP_H = 52;
const CX = 960, CY = 640;
const RINGS = [{ rx: 780, ry: 205, dir: 1, scale: 1 }, { rx: 470, ry: 118, dir: -0.8, scale: 0.9 }];
const IDLE_W = 0.45, MAX_W = 8.6;       // rad per second
const ACC = 4200;                       // ms of build-up before the swoops start
const SWOOP = 760, SQUASH = 340;

interface Geo { n: number; margin: number; gap: number; colW: number; cols: number; pitch: number; slotW: number; left: (ti: number) => number }
function geometry(n: number, maxM: number): Geo {
  const margin = 56, gap = n >= 5 ? 24 : 40;
  const colW = Math.floor((1920 - 2 * margin - (n - 1) * gap) / Math.max(1, n));
  const cols = maxM > 6 && colW >= 480 ? 2 : 1;
  const per = Math.ceil(maxM / cols);
  const slotsH = COL_H - SLOTS_TOP - 14;
  const pitch = Math.max(48, Math.min(68, Math.floor(slotsH / Math.max(1, per))));
  return { n, margin, gap, colW, cols, pitch, slotW: Math.floor(colW / cols) - 24, left: ti => margin + ti * (colW + gap) };
}
const slotPos = (g: Geo, ti: number, mi: number) => {
  const row = Math.floor(mi / g.cols), c = mi % g.cols;
  return { x: g.left(ti) + (g.colW * (c + 0.5)) / g.cols, y: COL_TOP + SLOTS_TOP + row * g.pitch + g.pitch / 2 };
};

// ---------------------------------------------------------------- the run plan
interface Plan { total: number; cheerAt: number; start: Map<string, number>; hatch: number[]; misses: Map<string, { at: number; team: number; x: number; y: number }> }
function planRun(teams: Team[], g: Geo): Plan {
  const maxM = Math.max(1, ...teams.map(t => t.members.length));
  const order: { id: string; team: number }[] = [];
  for (let s = 0; s < maxM; s++) teams.forEach((t, ti) => { if (t.members[s]) order.push({ id: t.members[s].playerId, team: ti }); });
  const stagger = Math.max(85, Math.min(240, Math.round(2600 / Math.max(1, order.length))));
  const start = new Map<string, number>();
  const last = teams.map(() => 0);
  order.forEach((o, k) => { const at = ACC + k * stagger; start.set(o.id, at); last[o.team] = Math.max(last[o.team], at + SWOOP); });
  const hatch = last.map(l => l + 260);
  const misses = new Map<string, { at: number; team: number; x: number; y: number }>();
  if (teams.length >= 2 && order.length >= 4) {
    const pool = order.slice().sort(() => Math.random() - 0.5).slice(0, Math.min(5, order.length));
    [1300, 2050, 2700, 3250, 3750].forEach((at, i) => {
      const o = pool[i]; if (!o) return;
      let team = Math.floor(Math.random() * teams.length);
      if (team === o.team) team = (team + 1) % teams.length;
      misses.set(o.id, { at, team, x: g.left(team) + g.colW / 2, y: COL_TOP + SLOTS_TOP + 40 });
    });
  }
  const cheerAt = Math.max(...hatch) + 100;
  return { total: cheerAt + 900, cheerAt, start, hatch, misses };
}

// ---------------------------------------------------------------- chips
interface ChipData { id: string; name: string; grade: Grade }
type Mode = 'idle' | 'run' | 'done';

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function Chips({ chips, slots, plan, mode, runKey }: { chips: ChipData[]; slots: Map<string, { x: number; y: number }>; plan: Plan | null; mode: Mode; runKey: string }) {
  const els = useRef(new Map<string, HTMLDivElement>());
  const pos = useRef(new Map<string, { x: number; y: number }>());
  const zs = useRef(new Map<string, number>());
  const ang = useRef([0, 0]);
  const latest = useRef({ chips, slots, plan });
  latest.current = { chips, slots, plan };

  useEffect(() => {
    const put = (id: string, x: number, y: number, rot: number, sx: number, sy: number, z: number) => {
      const el = els.current.get(id);
      if (!el) return;
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) rotate(${rot.toFixed(2)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
      if (zs.current.get(id) !== z) { zs.current.set(id, z); el.style.zIndex = String(z); }
      pos.current.set(id, { x, y });
    };

    if (mode === 'done') {
      for (const c of latest.current.chips) {
        const el = els.current.get(c.id);
        const s = latest.current.slots.get(c.id);
        if (!el) continue;
        el.style.display = s ? '' : 'none';
        if (s) put(c.id, s.x, s.y, 0, 1, 1, 5);
      }
      return;
    }

    let raf = 0;
    const t0 = performance.now();
    let last = t0;
    const from = new Map(pos.current);
    const landed = new Set<string>();
    const missed = new Set<string>();
    for (const el of els.current.values()) el.style.display = '';

    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      const t = now - t0;
      const { chips: cs, slots: sl, plan: pl } = latest.current;
      const running = mode === 'run' && !!pl;
      let w = IDLE_W;
      if (running) w = t < ACC ? IDLE_W + (MAX_W - IDLE_W) * Math.pow(t / ACC, 2.2) : MAX_W;
      ang.current[0] += (w * dt) / 1000;
      ang.current[1] -= (w * 0.8 * dt) / 1000;
      const n = cs.length;
      const two = n > 14;
      const c0 = two ? Math.ceil(n / 2) : n;
      const shake = running ? 9 * Math.pow(clamp01((t - 1000) / (ACC - 1000)), 1.6) : 0;

      cs.forEach((c, i) => {
        const r = two ? i % 2 : 0;
        const j = two ? Math.floor(i / 2) : i;
        const cnt = r === 0 ? c0 : n - c0;
        const ring = RINGS[r];
        const th = ang.current[r] + (Math.PI * 2 * j) / Math.max(1, cnt) + r * 0.6;
        const d = Math.sin(th);
        let x = CX + ring.rx * Math.cos(th);
        let y = CY + ring.ry * d + (running ? 0 : Math.sin(now / 520 + i * 1.3) * 6);
        let rot = Math.cos(th) * 5 * ring.dir;
        let sc = ring.scale * (0.94 + 0.12 * d);
        x += Math.sin(now * 0.071 + i * 2.1) * shake;
        y += Math.cos(now * 0.083 + i * 1.3) * shake;
        let z = 20 + Math.round(d * 10) + r * -6;
        let sx = 1, sy = 1;

        if (running && pl) {
          // near miss: the chip dives at a wrong box, then gets yanked back
          const m = pl.misses.get(c.id);
          if (m) {
            const u = (t - m.at) / 850;
            if (u > 0 && u < 1) {
              const k = Math.pow(Math.sin(Math.PI * u), 1.2) * 0.8;
              x = lerp(x, m.x, k); y = lerp(y, m.y, k);
              rot += Math.sin(u * Math.PI * 7) * 14 * k;
              sc *= 1 + 0.16 * k;
              z = 90;
              if (!missed.has(c.id)) { missed.add(c.id); sfx.play('whoosh'); }
            } else if (u >= 1 && missed.has(c.id) && !missed.has(c.id + '!')) { missed.add(c.id + '!'); sfx.play('tick'); }
          }
          const fin = sl.get(c.id);
          const s0 = pl.start.get(c.id);
          if (fin && s0 !== undefined && t >= s0) {
            const u = clamp01((t - s0) / SWOOP);
            const e = easeInOut(u);
            const arc = Math.sin(Math.PI * u);
            x = lerp(x, fin.x, e);
            y = lerp(y, fin.y, e) - 110 * arc;
            rot = lerp(rot, 0, e) + Math.sin(u * Math.PI * 2) * 8;
            sc = lerp(sc, 1, e) * (1 + 0.1 * arc);
            z = u >= 1 ? 8 : 100;
            if (u >= 1) {
              if (!landed.has(c.id)) { landed.add(c.id); sfx.play('pop'); }
              const v = clamp01((t - s0 - SWOOP) / SQUASH);
              const k = Math.exp(-6 * v) * Math.cos(14 * v) * 0.3;
              sx = 1 + k; sy = 1 - k;
              sc = 1;
            }
          }
          // the first moments: fly out of wherever the chip was (the boxes after a shuffle) into the whirl
          const f = from.get(c.id);
          if (f && t < 700) {
            const e0 = easeOut(t / 700);
            x = lerp(f.x, x, e0); y = lerp(f.y, y, e0);
          }
        }
        put(c.id, x, y, rot, sc * sx, sc * sy, z);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, runKey]);

  return (
    <div className="s2-chip-layer">
      {chips.map(c => {
        const g = GRADE_COLORS[c.grade];
        return (
          <div key={c.id} ref={el => { if (el) els.current.set(c.id, el); else els.current.delete(c.id); }} className="s2-chip" style={{ background: g.bg }}>
            <span className="s2-chip-grade" style={{ background: g.edge }}>{c.grade}</span>
            <span className="s2-chip-name">{c.name}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- view
export function TeamsView() {
  useDockAt(56, 136, 1100);
  const { state, dispatch, live } = useGame();
  const count = state.settings.teamCount;
  const players = state.players;
  const enough = players.length >= count;
  const teams = state.teams;
  const has = teams.length > 0;

  // Start the show whenever a NEW split appears (button, keyboard or the host's phone). A split that was already there on arrival just shows.
  const sig = teamsSig(teams);
  const [seen, setSeen] = useState(sig);
  const [run, setRun] = useState<string | null>(null);
  if (sig !== seen) { setSeen(sig); setRun(sig || null); }
  const running = !!run && has;

  const maxM = Math.max(1, ...teams.map(t => t.members.length));
  const geo = useMemo(() => geometry(Math.max(1, teams.length), maxM), [teams.length, maxM]);
  const plan = useMemo(() => (has ? planRun(teams, geo) : null), [sig]); // eslint-disable-line react-hooks/exhaustive-deps
  const [fire, setFire] = useState(0);

  useEffect(() => {
    if (!run || !plan) return;
    sfx.play('drumroll', { duration: ACC / 1000 });
    lockInput(plan.total + 200);
    const ids = [
      setTimeout(() => { sfx.play('cheer'); setFire(f => f + 1); }, plan.cheerAt),
      setTimeout(() => { setRun(null); unlockInput(); }, plan.total),
    ];
    return () => { ids.forEach(clearTimeout); unlockInput(); };
  }, [run, plan]);

  const make = useStableCallback(() => {
    if (!live || !enough || running || inputLocked()) return;
    dispatch({ type: 'MAKE_TEAMS', teams: makeTeams(players, count) });
  });
  useEffect(() => bus.on('makeTeams', make), [make]);

  // First visit: pre-select the team count that gives 4 to 5 kids per team (the host can still change it).
  const suggested = suggestTeamCount(players.length);
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !live || has || !players.length) return;
    seeded.current = true;
    if (count === 4 && suggested !== 4) dispatch({ type: 'SET_SETTING', key: 'teamCount', value: suggested });
  }, [live, has, players.length, count, suggested, dispatch]);
  const pickCount = (v: 3 | 4 | 5 | 6) => { if (live && !running && v !== count) dispatch({ type: 'SET_SETTING', key: 'teamCount', value: v }); };

  const chips = useMemo<ChipData[]>(
    () => (has ? teams.flatMap(t => t.members.map(m => ({ id: m.playerId, name: m.name, grade: m.grade }))) : players.map(p => ({ id: p.id, name: p.name, grade: p.grade }))),
    [has, teams, players],
  );
  const slots = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    teams.forEach((t, ti) => t.members.forEach((mem, mi) => m.set(mem.playerId, slotPos(geo, ti, mi))));
    return m;
  }, [teams, geo]);
  const classes = useMemo(() => Array.from(new Set(chips.map(c => c.grade))).sort((a, b) => a - b) as Grade[], [chips]);

  const mode: Mode = running ? 'run' : has ? 'done' : 'idle';
  const lo = Math.floor(players.length / count), hi = Math.ceil(players.length / count);
  const title = mode === 'idle' ? 'Time to make teams!' : mode === 'run' ? 'Here they come…' : 'Meet your teams!';

  return (
    <div className="scr-full">
      <div className="s2-head">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={mode} className="s2-title" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0, transition: { duration: 0.12 } }} transition={{ type: 'spring', stiffness: 420, damping: 26 }}>{title}</motion.div>
        </AnimatePresence>
        {classes.length > 0 && (
          <div className="s2-legend">
            <span className="s2-legend-label">Class</span>
            {classes.map(g => <span key={g} className="s2-gdot" style={{ background: GRADE_COLORS[g].edge }}>{g}</span>)}
          </div>
        )}
      </div>

      <div className="s2-info">{players.length} kids · {count} teams</div>

      {mode === 'idle' && (
        <motion.div className="s2-mix" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {players.length ? 'Big kids and small kids get mixed into every team!' : 'Add some players first!'}
        </motion.div>
      )}

      {has && (
        <div className="s2-boxes">
          {teams.map((t, ti) => {
            const c = teamColors(t);
            const sorted = t.members.slice().sort((a, b) => b.grade - a.grade);
            return (
              <motion.div key={`${t.id}-${t.avatarSeed}`} className="s2-box" style={{ left: geo.left(ti), top: COL_TOP, width: geo.colW, height: `calc(${COL_H}px + var(--fx, 0px))`, background: c.shades[0] }}
                initial={running ? { y: 160, opacity: 0 } : false} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 240, damping: 22, delay: ti * 0.08 }}>
                <div className="s2-box-egg">
                  <Hatch team={t} size={112} delay={Math.max(0, (plan?.hatch[ti] ?? 0) - 950)} instant={!running} restless burst />
                </div>
                <div className="s2-box-name" style={{ color: c.shades[4] }}>{t.name}</div>
                <div className="s2-dots">
                  {sorted.map((m, k) => (
                    <motion.span key={m.playerId} className="s2-dot" style={{ background: GRADE_COLORS[m.grade].edge }}
                      initial={running ? { scale: 0 } : false} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14, delay: running ? (plan?.hatch[ti] ?? 0) / 1000 + k * 0.05 : 0 }} />
                  ))}
                </div>
                {t.members.map((m, mi) => {
                  const p = slotPos(geo, ti, mi);
                  return <div key={m.playerId} className="s2-slot" style={{ left: p.x - geo.left(ti) - geo.slotW / 2, top: p.y - COL_TOP - CHIP_H / 2, width: geo.slotW, height: CHIP_H }} />;
                })}
              </motion.div>
            );
          })}
        </div>
      )}

      <Chips chips={chips} slots={slots} plan={plan} mode={mode} runKey={run ?? ''} />

      <AnimatePresence mode="wait" initial={false}>
        {mode === 'idle' && (
          <motion.div key="controls" className="s2-controls" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
            <div className="s2-count-text">
              <div className="s2-count-q">How many teams?</div>
              <div className="s2-count-sub">{players.length >= count ? (<><CountUp value={lo} />{hi !== lo && <>-<CountUp value={hi} /></>} kids each</>) : 'Not enough players'}</div>
            </div>
            <div className="s2-count-row">
              {([3, 4, 5, 6] as const).map(v => (
                <Tap key={v} id={`teamcount-${v}`} onTap={() => pickCount(v)} sound="pop" className="s2-count-tap">
                  <div className={`s2-count${v === count ? ' is-on' : ''}`}>
                    {v}
                    {v === suggested && players.length > 0 && <span className="s2-star">★</span>}
                  </div>
                </Tap>
              ))}
            </div>
            <BigButton id="make-teams" onTap={make} disabled={!enough} width={540} height={128} bounce>
              {enough ? 'Make teams!' : 'Add players first'}
            </BigButton>
          </motion.div>
        )}
        {mode === 'done' && (
          <motion.div key="shuffle" className="s2-shuffle" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
            <BigButton id="shuffle-teams" onTap={make} color="var(--paper)" edge="var(--paper-edge)" width={460} height={120}>Shuffle again</BigButton>
          </motion.div>
        )}
      </AnimatePresence>
      <Confetti fire={fire} count={110} />
    </div>
  );
}
