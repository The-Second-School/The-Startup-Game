// Shared vertical layout of the 1920x1080 stage. Every view lays itself out below the slim header, with Bolt (the narration
// dock) at the top-left. Content that sits beside Bolt starts at DOCK_W; full-width content starts at CONTENT_TOP.
export const HEADER_H = 0;          // no header any more: progress shows after each act or by the host's overlay
export const DOCK_TOP = HEADER_H + 16;
export const DOCK_W = 188;           // Bolt column: things "after Bolt" start at x = DOCK_W + 16
export const DOCK_H = 132;           // Bolt column height; the transcript bubble is as tall
export const CONTENT_TOP = DOCK_TOP + DOCK_H + 8;   // 196: full-width content starts here when a transcript is showing
export const KID_TOP = 560;          // kids can only reach y >= 560
export const STAGE_W = 1920;
export const STAGE_H = 1080;
export const SIDE = 40;              // outer margin
