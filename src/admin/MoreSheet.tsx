import { useEffect, useState } from 'react';
import { SCRIPT } from '../game/content';
import { currentStep, timerRemaining } from '../game/engine';
import { useAdmin } from '../store/adminStore';
import { Num } from '../ui/primitives';
import { useA } from './ctx';
import { actLabel, actOf, fmtTime, signed, stepTitle } from './info';
import { Btn, Fold, Sheet, Switch, TeamDot, useNow } from './kit';

const SMALL = [-5, -1, 1, 5];
const COINS = [-50, -10, 10, 50];
const FIELDS = [['customers', 'Customers', SMALL], ['happiness', 'Happiness', SMALL], ['coins', 'Coins', COINS]] as const;

/** Everything that is not the main flow: undo, timer, fixes, jumping around, settings. Danger zone sits last. */
export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, send, ask, connected } = useA();
  const now = useNow(250);
  const clockOffset = useAdmin(s => s.clockOffset);
  const [danger, setDanger] = useState(false);
  // The sheet stays mounted between opens: the danger zone always starts collapsed.
  useEffect(() => { if (!open) setDanger(false); }, [open]);
  const cur = currentStep(state);
  const t = state.timer;
  const rem = timerRemaining(state, now + clockOffset);

  const undo = async () => {
    if (await ask({ title: 'Undo the last action?', body: 'The big screen goes back one step.', ok: 'Undo', cancel: 'Keep it' })) { send({ type: 'UNDO' }); onClose(); }
  };
  const jump = async (i: number) => {
    const ok = await ask({ title: `Jump to “${stepTitle(SCRIPT[i])}”?`, body: 'That step starts fresh. Team scores stay as they are.', ok: 'Jump' });
    if (ok) { send({ type: 'JUMP', stepIndex: i }); onClose(); }
  };
  // Two checks, cancel is the easy default on both. The second one needs the word RESET typed in.
  const reset = async () => {
    if (!(await ask({ title: 'Reset the whole game?', body: 'Nothing is deleted yet.', ok: 'Yes, keep going', cancel: 'No, keep playing', danger: true }))) return;
    if (!(await ask({
      title: 'Are you really sure?',
      body: 'All players, teams and scores will be deleted. The game goes back to the lobby. This cannot be undone.',
      ok: 'Reset everything', cancel: 'No, keep playing', danger: true, typeWord: 'RESET',
    }))) return;
    send({ type: 'RESET' });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="More">
      <Btn tone="soft" size="lg" onClick={undo} style={{ width: '100%' }}>Undo the last action</Btn>

      <Switch
        on={state.progressView}
        onChange={v => send({ type: 'SET_PROGRESS_VIEW', on: v })}
        label="Progress view"
        sub="Full-screen progress on the big screen, with Bolt narrating. The game pauses while it is on."
      />

      {t.total > 0 && (
        <div className="card">
          <div className="label"><span>Timer</span></div>
          <div className="row">
            <div className={`timer-time ${t.running && rem < 10_000 ? 'timer-low' : ''}`}><Num value={fmtTime(rem)} /></div>
            <Btn tone="soft" style={{ flex: 1 }} onClick={() => send(t.running ? { type: 'TIMER_PAUSE', now: Date.now() } : { type: 'TIMER_RESUME', now: Date.now() })}>{t.running ? 'Pause' : 'Resume'}</Btn>
            <Btn tone="soft" style={{ flex: 1 }} onClick={() => send({ type: 'TIMER_ADD', ms: 15_000 })}>Add 15 s</Btn>
          </div>
        </div>
      )}

      <Switch on={state.frozen} onChange={v => send({ type: 'SET_FROZEN', on: v })} label="Freeze the screen" sub="Stops everything on the big screen exactly where it is: animations, timer, voice and sound. Switch off to continue." />

      <Fold title="Fix a score" hint="Meters stay between 0 and 50">
        {state.teams.length === 0 && <div className="empty">No teams yet.</div>}
        <div className="stack">
          {state.teams.map(tm => (
            <div key={tm.id} className="adj">
              <div className="row"><TeamDot team={tm} size={28} /><b>{tm.name}</b></div>
              {FIELDS.map(([f, name, deltas]) => (
                <div key={f} className="adjrow">
                  <div className="adjval"><small>{name}</small><b><Num value={tm[f]} /></b></div>
                  {deltas.map(d => (
                    <Btn key={d} tone={d > 0 ? 'good' : 'soft'} onClick={() => send({ type: 'ADJUST', teamId: tm.id, field: f, delta: d })} style={{ flex: 1, padding: '6px 0' }}>{signed(d)}</Btn>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Fold>

      <Fold title="Jump to a step" hint="Starts that step fresh">
        <div className="jumplist">
          {SCRIPT.map((s, i) => {
            const act = actOf(i);
            const header = i === 0 || act !== actOf(i - 1);
            return (
              <div key={s.id + i}>
                {header && <div className="jump-act">{actLabel(act)}</div>}
                <Btn tone={s.id === cur.id ? 'sun' : 'soft'} onClick={() => jump(i)} className="jump-btn">
                  <span className="jump-n">{i + 1}</span>{stepTitle(s)}{s.id === cur.id ? ' (now)' : ''}
                </Btn>
              </div>
            );
          })}
        </div>
      </Fold>

      <Fold title="Settings">
        <Switch on={state.settings.sound} onChange={v => send({ type: 'SET_SETTING', key: 'sound', value: v })} label="Sound effects" sub="Plays on the big screen" />
        <Switch on={state.settings.voice} onChange={v => send({ type: 'SET_SETTING', key: 'voice', value: v })} label="Bolt’s voice" sub="Bolt reads lines out loud" />
        <div className="set-line"><span>Big screen</span><b className={connected ? 'ok' : 'no'}>{connected ? 'Connected' : 'Not connected'}</b></div>
      </Fold>

      <div className="danger">
        <button type="button" className="danger-toggle" aria-expanded={danger} onClick={() => setDanger(!danger)}>Danger zone</button>
        {danger && <button type="button" className="danger-reset" onClick={reset}>Reset the whole game</button>}
      </div>
    </Sheet>
  );
}
