// The big-screen app: owns the game state, routes each script step to its view, plays cues.
import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion, useIsPresent } from 'motion/react';
import { RecipeBar, StageFrame } from '../ui';
import { prefetchScenes } from '../scenes';
import { sfx, voice } from '../audio';
import { currentStep } from '../game/engine';
import { SCRIPT } from '../game/content';
import type { GameState } from '../game/types';
import { useScreen } from '../store/screenStore';
import { Ctx, type Dispatch } from './lib/ctx';
import { actOf } from './lib/game';
import { installPointerGuard } from './lib/tap';
import { useUi } from './lib/ui';
import { useKeyboard } from './hooks/useKeyboard';
import { useGameSounds } from './hooks/useGameSounds';
import { useNarration } from './hooks/useNarration';
import { ViewFor } from './views';
import './screen.css';

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

  useKeyboard();
  useGameSounds(state);
  useNarration(state);

  const safeIndex = Math.max(0, Math.min(SCRIPT.length - 1, state.stepIndex));
  const step = SCRIPT[safeIndex] ?? currentStep(state);
  const showHeader = step.kind !== 'lobby';
  const key = `${safeIndex}-${step.id}`;

  return (
    <StageFrame>
      <div className="scr-root">
        <AnimatePresence initial={false}>
          <ViewShell key={key} state={state} dispatch={dispatch} />
        </AnimatePresence>
        <AnimatePresence>
          {showHeader && (
            <motion.div key="header" className="ui-header" initial={{ y: -140, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -140, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
              <div className="ui-header-bg" />
              <div className="ui-header-in"><RecipeBar act={actOf(step)} /></div>
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
        <ViewFor state={state} />
      </Ctx.Provider>
    </motion.div>
  );
}
