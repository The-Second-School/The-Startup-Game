import { useCallback, useState, type ReactNode } from 'react';
import { SCRIPT } from '../game/content';
import { currentStep } from '../game/engine';
import type { GameState } from '../game/types';
import { AdminCtx, type AskOpts, type Send } from './ctx';
import { actLabel, actOf, guide, stepTitle } from './info';
import { Btn } from './kit';
import { StatusChip } from './StatusChip';
import { MoreSheet } from './MoreSheet';
import { ChoicePanel } from './panels/Choices';
import { AuctionPanel, BugPanel, MicPanel } from './panels/Live';
import { NamesPanel, PlayersPanel, ProductsPanel, RolesPanel, TeamsPanel } from './panels/Setup';
import { AwardsPanel, PitchPanel } from './panels/Show';

function Dots() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
      <g fill="currentColor"><circle cx="5" cy="12" r="2.4" /><circle cx="12" cy="12" r="2.4" /><circle cx="19" cy="12" r="2.4" /></g>
    </svg>
  );
}

function Panel({ state }: { state: GameState }): ReactNode {
  const step = currentStep(state);
  switch (step.kind) {
    case 'setup_players': return <PlayersPanel />;
    case 'setup_teams': return <TeamsPanel />;
    case 'setup_roles': return <RolesPanel />;
    case 'setup_products': return <ProductsPanel />;
    case 'setup_names': return <NamesPanel />;
    case 'question': case 'price': case 'megaorder': return <ChoicePanel />;
    case 'bugsmash': return <BugPanel />;
    case 'auction': return <AuctionPanel />;
    case 'mic': return <MicPanel />;
    case 'pitch': return <PitchPanel />;
    case 'awards': return <AwardsPanel />;
    default: return null;
  }
}

interface ShellProps { state: GameState | null; send: Send; room: string; connected: boolean; link?: 'connecting' | 'connected' | 'reconnecting'; realtime?: boolean }

export default function Shell({ state, send, room, connected, link = connected ? 'connected' : 'connecting', realtime = true }: ShellProps) {
  const [more, setMore] = useState(false);
  const [cool, setCool] = useState(false);
  const [dialog, setDialog] = useState<{ o: AskOpts; done: (v: boolean) => void } | null>(null);
  const ask = useCallback((o: AskOpts) => new Promise<boolean>(res => setDialog({ o, done: v => { setDialog(null); res(v); } })), []);

  if (!state) {
    return (
      <div className="adm">
        <header className="head"><StatusChip link={link} /><div className="head-title">Host</div></header>
        <main className="main main-center">
          <div className="wait-title">Waiting for the big screen<span className="dots" /></div>
          <div className="wait-sub">{realtime ? 'Open the game on the big screen. This phone connects by itself.' : 'Phone sync over the internet is not set up on this build, so this phone only works in the same browser as the big screen.'}</div>
        </main>
      </div>
    );
  }

  const step = currentStep(state);
  const act = actLabel(actOf(state.stepIndex));
  const progress = state.stepIndex / (SCRIPT.length - 1);
  const g = guide(state);
  const blocked = g.disabled || !connected || cool;

  const press = () => {
    if (blocked) return;
    navigator.vibrate?.(12);
    send(g.action ?? { type: 'NEXT' });
    setCool(true);
    setTimeout(() => setCool(false), 450);
  };

  return (
    <AdminCtx.Provider value={{ state, send, room, ask, connected }}>
      <div className="adm">
        <header className="head">
          <StatusChip link={link} />
          <div className="head-title"><span className="head-act">{act}</span>{stepTitle(step)}</div>
          <div className="progress" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <i style={{ width: `${Math.max(1.5, progress * 100)}%` }} />
          </div>
        </header>

        <main className="main" key={step.id}>
          {!connected && <div className="lost">Lost the big screen. Reconnecting<span className="dots" /></div>}
          <div className="say">{g.say}</div>
          <Panel state={state} />
        </main>

        <div className="bottom">
          <Btn tone="soft" size="xl" className="morebtn" onClick={() => setMore(true)} label="More options"><Dots /><span>More</span></Btn>
          <Btn tone="sun" size="xl" className="primary" disabled={blocked} onClick={press}>{!connected ? 'Reconnecting' : g.label}</Btn>
        </div>

        <MoreSheet open={more} onClose={() => setMore(false)} />

        {dialog && (
          <div className="modal-wrap" onClick={() => dialog.done(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} role="alertdialog">
              <div className="modal-title">{dialog.o.title}</div>
              {dialog.o.body && <div className="modal-body">{dialog.o.body}</div>}
              <div className="row">
                <Btn tone="soft" size="lg" style={{ flex: 1 }} onClick={() => dialog.done(false)}>{dialog.o.cancel ?? 'Cancel'}</Btn>
                <Btn tone={dialog.o.danger ? 'bad' : 'sun'} size="lg" style={{ flex: 1 }} onClick={() => dialog.done(true)}>{dialog.o.ok ?? 'OK'}</Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminCtx.Provider>
  );
}
