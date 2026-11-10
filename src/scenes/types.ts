import type { Team } from '../game/types';

/** Props for a big scene's art: ./acts/<sceneId>.tsx default export. Fills the whole 1920x1080 stage.
 *  `beat` is the narration beat now showing (0-based). Change what is happening on screen per beat. */
export interface SceneBodyProps {
  beat: number;
  beats: string[];
  teams: Team[];
  recap: { teamId: string; icon: string; text: string }[];
}

/** Props for a small question intro: ./intros/<anim>.tsx default export. Fills the stage, 3 to 6 s loop-safe. */
export type IntroBodyProps = Record<string, never>;
