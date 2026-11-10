/**
 * Scene kit (owner: scenes agent A). Shared art + motion helpers for every big scene and intro.
 * Exports are STABLE: add new ones, do not rename or change props. Import from '../kit'.
 * Importing this file also loads kit.css (the k-* idle-loop classes).
 *
 * Style: flat colours only, no gradients, no blur, light from top-left, round caps, white sticker borders.
 *
 * ---- palette.ts ----
 *   INK, INK_SOFT, WHITE
 *   HUE.<name> = { hi, base, edge }  names: sun gold coin red coral orange saffron green mint teal blue sky purple raivan pink cream paper stone road wood steel tank
 *   SKIN[5], HAIR[4], SKIES.<tone> (sunrise | day | storm | gold | stage) = { bands, sun, far, farWin, cloud, cloudEdge }, type SkyTone, type Hue
 *
 * ---- shapes.tsx (SVG <g> primitives; use inside an <svg>) ----
 *   <Slab x y w h r? hue lip? border? />    rounded rect: lip + fill + clipped highlight (+ white border)
 *   <Ball cx cy r hue lip? border? glint? /> layered circle with crescent shade
 *   <Shape d hue lip? border? hi? shade? />  any path, layered
 *   <CloudShape x y w fill? edge? />         flat cloud
 *   starPath(R, r?, n?), gearPath(R, teeth?, depth?), rng(seed) -> () => 0..1 (deterministic)
 *
 * ---- motion.tsx ----
 *   SPRING.{pop,hero,move,settle,cam,snappy}, EASE.{backOut,exit,settle}, full (CSSProperties for a 1920x1080 box)
 *   <World cam={{x, y?, zoom?}}> ... <Layer depth={0..1.5}> ... </Layer> </World>   parallax camera (springs on change)
 *   <Svg w? h? x?>  full-height SVG canvas in stage px (round caps/joins on)
 *   <At x y w? h? anchor="tl"|"bc"|"c">  absolute DOM placement (bc = bottom-centre at x,y)
 *   useSubstep(beat, [ms, ms, ...]) -> number of marks passed since the beat started (sub-beat sequencing)
 *   useMaxBeat(beat) -> furthest beat reached
 *   <Wipe trigger colors? dir? />   big colour bands sweep across when trigger changes (not on first render)
 *   <Flash trigger color? />        full-screen flash on trigger change
 *   <Shake trigger strength?>children</Shake>  shake on trigger change
 *   <Burst fire x? y? colors? count? spread? up? />  flat confetti burst each time `fire` changes (0 = none)
 *   <Pop delay? from? rotate?>children</Pop>  spring pop-in with overshoot (works inside AnimatePresence)
 *
 * ---- sky.tsx (DOM, full stage) ----
 *   <Sky tone? horizon? />   banded flat sky, crossfades on tone change
 *   <Sun x? y? r? rays? />   sun with halo rings and turning rays (centre at x,y)
 *   <Clouds seed? count? yMin? yMax? minW? maxW? speed? fill? edge? opacity? />  drifting clouds
 *   <Stars seed? count? yMax? color? />  twinkles;  <Lightning x y h? delay? dur? />  looping flashing bolt
 *
 * ---- city.tsx (SVG <g>; put inside <Svg>) ----
 *   <FarSkyline width? baseY? seed? color? win? minH? maxH? />   one-colour silhouette city
 *   <NearSkyline width? baseY? seed? minH? maxH? lit? kinds? />   colourful buildings: water tanks, temple, domes, antennas, blinking windows
 *   <WaterTank x y s? />  <Temple x y w? />  <Dome x y w? hue? />
 *   <Bunting x1 y1 x2 y2 sag? colors? n? />  <Streetlight x y h? singing? delay? />
 *   <Ground y? width? road? pave? roadHue? />  <Bush x y s? hue? />  <Tree x y s? hue? />
 *   planSkyline(width, seed, minH, maxH, kinds)
 *
 * ---- people.tsx (each renders its own <svg>; size = height px, feet on the bottom edge) ----
 *   <Kid size? skin? hair? hairStyle?(0 short,1 ponytail,2 braids,3 puff) shirt?(Hue) pants? pose? mood? walking? flip? />
 *       pose: idle cheer gasp shiver hold point wave think;  mood: happy sad wow cold grin worried
 *   <Mayor size? pose?(wave announce trophy gasp cheer) mood?(happy wow grin) />
 *   <RobotChaiwala size? />
 *   <Crowd n? width? size? seed? pose? mood? hop? style? />  (pose/mood may be a function of index)
 *
 * ---- props.tsx (each renders its own <svg>; size = width px) ----
 *   <Trophy size? shine? />  <Lightbulb size? lit? />  <Gear size? hue? teeth? spin?(s/turn, negative = reverse)>icon at 0,0</Gear>
 *   <BigLock size? locked? hue? />  <Tiffin size? open? cold? hot? />  <Bug size? hue? />  <Sparkle size? color? delay? />
 *   <ThoughtCloud size?>svg children in 0..240 x 0..180</ThoughtCloud>
 *   <Firework x y r? color? delay? dur? />  (absolute, stage px)   <Poof size? color? edge? />  (plays once on mount)
 *   <SpotCone x w? top? bottom? color? opacity? />  (full-stage overlay)
 *   <FlyingBus size? hue? />  <FlyingRickshaw size? />   (face right; wrap in a div with className="k-fly" to zoom across)
 *   <StepIcon kind="problem|build|launch|money|grow|show" size? />
 *   <RecipeTrack active={1..6} width? />   big Startup Recipe strip, active step stamps in
 *   <StickerCard w h hue? rotate?>DOM children</StickerCard>
 *
 * ---- kit.css classes (CSS idle loops; tune with CSS vars --dur, --delay, etc.) ----
 *   k-bob(--bob) k-squash k-sway(--sway-a/--sway-b) k-drift(--dx) k-fly(--from/--to) k-blink k-eyes k-spin k-spin-rev
 *   k-pulse(--pulse) k-twinkle k-steam(--rise) k-shiver k-hammer k-belt(--belt) k-rise(--rise) k-fall(--fall/--fx)
 *   k-burst k-wiggle(--wig) k-flag k-prop k-note(--nx) k-walk-a k-walk-b k-hop(--hop) k-flash k-shake k-rays
 *   k-origin-bottom k-origin-top k-origin-left
 *   SVG rule: never put a k-* class on an element that also has a transform attribute; wrap it in a <g transform>.
 */
import './kit.css';

export * from './palette';
export * from './shapes';
export * from './motion';
export * from './sky';
export * from './city';
export * from './people';
export * from './props';
