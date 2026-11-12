// The big-screen app: owns the game state, routes each script step to its view, plays cues, narrates.
import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion, useIsPresent } from 'motion/react';
import { StageFrame } from '../ui';
import { prefetchScenes } from '../scenes';
import { sfx, voice } from '../audio';
import { currentStep } from '../game/engine';
import { SCRIPT } from '../game/content';
import type { GameState } from '../game/types';
import { useScreen } from '../store/screenStore';
import { useNarrator } from '../narration/useNarrator';
import { NarrationDock } from '../narration/NarrationDock';
import { VoiceChip } from '../narration/VoiceChip';
import '../narration/narration.css';
import { setFrozen, onFreeze } from './lib/freeze';
import { Ctx, type Dispatch } from './lib/ctx';
import { actOf } from './lib/game';
import { installPointerGuard } from './lib/tap';
import { useUi } from './lib/ui';
import { useKeyboard } from './hooks/useKeyboard';
import { useGameSounds } from './hooks/useGameSounds';
import { ProgressScreen } from './views/ProgressView';
import { ViewFor } from './views';
import './screen.css';

// Apply the saved voice setting at module load, before any child effect can ask the voice to speak.
voice.setEnabled(useScreen.getState().state.settings.voice);


export default function ScreenApp() {
  const state = useScreen(s => s.state);
  const dispatch = useScreen(s => s.dispatch);
  const connect = useScreen(s => s.connect);

  useEffect(() => {
    connect();
    installPointerGuard();
    prefetchScenes();
  }, [connect]);
  useEffect(() => { sfx.setEnabled(state.settings.sound); }, [state.settings.sound]);
  useEffect(() => { voice.setEnabled(state.settings.voice); }, [state.settings.voice]);
  useEffect(() => {
    const ui = useUi.getState();
    ui.setPick(null); ui.setKbTeam(null); ui.setTyping('');
  }, [state.stepIndex]);

  // Host "Freeze": stop everything in place (clock, timers, frames, animations) and pause speech + sound.
  useEffect(() => { onFreeze(on => { try { if (on) window.speechSynthesis?.pause(); else window.speechSynthesis?.resume(); } catch { /* ignore */ } sfx.freeze(on); }); }, []);
  useEffect(() => { setFrozen(state.frozen); }, [state.frozen]);

  useKeyboard();
  useGameSounds(state);
  useNarrator(state);

  const safeIndex = Math.max(0, Math.min(SCRIPT.length - 1, state.stepIndex));
  const step = SCRIPT[safeIndex] ?? currentStep(state);
  const key = `${safeIndex}-${step.id}`;

  return (
    <StageFrame>
      <div className="scr-root">
        <AnimatePresence initial={false}>
          <ViewShell key={key} state={state} dispatch={dispatch} />
        </AnimatePresence>
        <div className="scr-frame" style={{ pointerEvents: 'none', zIndex: 40 }}>
          <NarrationDock visible />
          <VoiceChip on={state.settings.voice} />
        </div>
        {state.frozen && <div className="scr-frozen" aria-hidden><span>❚❚ Paused</span></div>}
        {/* Host-controlled full-screen progress (More menu in the admin). The step's own view stays underneath. */}
        <AnimatePresence>
          {state.progressView && (
            <motion.div key="progress-overlay" className="scr-view" style={{ zIndex: 30 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <div className="scr-frame"><ProgressScreen act={actOf(step)} overlay /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StageFrame>
  );
}

const shell = {
  initial: { x: 200, opacity: 0, scale: 0.96 },
  animate: { x: 0, opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 280, damping: 28 } },
  exit: { x: -200, opacity: 0, scale: 0.97, transition: { type: 'spring' as const, stiffness: 320, damping: 34 } },
};

function ViewShell({ state, dispatch }: { state: GameState; dispatch: Dispatch }) {
  const present = useIsPresent();
  const ctx = useMemo(() => ({ state, dispatch, live: present }), [state, dispatch, present]);
  return (
    <motion.div className="scr-view" style={{ pointerEvents: present ? 'auto' : 'none', zIndex: present ? 2 : 1 }} variants={shell} initial="initial" animate="animate" exit="exit">
      <Ctx.Provider value={ctx}>
        <div className="scr-frame"><ViewFor state={state} /></div>
      </Ctx.Provider>
    </motion.div>
  );
}
