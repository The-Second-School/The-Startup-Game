import { useMemo, useState } from 'react';
import { ActScene } from '../../scenes';
import { recapLines } from '../../game/engine';
import type { SceneId } from '../../game/types';
import { useStageH } from '../../ui';
import { useGame } from '../lib/ctx';
import { ReadyHint } from '../components/ReadyHint';
import { useStableCallback } from '../hooks/useStableCallback';

export function SceneView({ sceneId }: { sceneId: SceneId }) {
  const { state } = useGame();
  const [done, setDone] = useState(false);
  const teams = state.teams;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recap = useMemo(() => recapLines(state), [teams]);
  const onDone = useStableCallback(() => setDone(true));
  // Taller windows: the 1080 art is scaled up (to at most 1.2x) so it fills the height instead of leaving a blank band below.
  const grow = Math.min(1.2, useStageH() / 1080);
  return (
    <div className="scr-full scr-scene">
      <div style={{ position: 'absolute', inset: 0, transform: grow > 1 ? `scale(${grow})` : undefined, transformOrigin: '50% 0' }}>
        <ActScene sceneId={sceneId} teams={teams} recap={recap} onDone={onDone} />
      </div>
      <ReadyHint show={done} />
    </div>
  );
}
