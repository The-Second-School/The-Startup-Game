import { useMemo, useState } from 'react';
import { ActScene } from '../../scenes';
import { recapLines } from '../../game/engine';
import type { SceneId } from '../../game/types';
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
  return (
    <div className="scr-full scr-scene">
      <ActScene sceneId={sceneId} teams={teams} recap={recap} onDone={onDone} />
      <ReadyHint show={done} />
    </div>
  );
}
