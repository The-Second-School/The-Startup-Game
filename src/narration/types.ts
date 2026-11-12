// Narration: what Bolt (or Jhootu) says on each screen. One Narration per screen "moment". Lines are spoken in order.
import type { Tone } from '../audio/voice';

export type { Tone };
export type Mascot = 'bolt' | 'fibbot';
export type Pose = 'idle' | 'wave' | 'talk' | 'think' | 'cheer' | 'sad' | 'point' | 'shock';

export interface NarrLine {
  /** Shown in the small transcript. */
  text: string;
  /** What is SAID when it must differ from the text (pronunciation, no symbols). */
  say?: string;
  tone?: Tone;
  pose?: Pose;
  /** Extra pause after this line, in ms (default 450). Use it to give kids breathing room. */
  gap?: number;
}

export interface Narration {
  /** Unique per moment. It must change whenever the narration should be spoken again (include phase, team index ...). */
  id: string;
  lines: NarrLine[];
  /**
   * Shown in the transcript when ALL lines have been spoken. Required whenever there are 2+ lines and the screen does
   * not repeat the information (kids and host re-read it). Keep it about as long as one line.
   */
  summary?: string;
  /** false = Bolt only, no transcript (the screen already shows the same text big, e.g. the question). */
  showText?: boolean;
  mascot?: Mascot;
}
