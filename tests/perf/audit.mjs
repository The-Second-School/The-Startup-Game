// Perf audit: loads the preview build for the big screen and the admin phone and records
// JS transferred, DCL/load, long tasks and average frame time (rAF sampling) over 10 s of an animated scene.
// Usage: npm run build && node tests/perf/audit.mjs [baseUrl] [--throttle=4] [--secs=10]
// With no baseUrl it starts `vite preview` itself on :4173.
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';

const args = process.argv.slice(2);
const flag = (n, d) => { const a = args.find(x => x.startsWith(`--${n}=`)); return a ? a.split('=')[1] : d; };
const THROTTLE = Number(flag('throttle', 1));
const SECS = Number(flag('secs', 10));
let BASE = args.find(a => !a.startsWith('--'));
let server = null;
if (!BASE) {
  BASE = 'http://localhost:4173';
  server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(BASE)).ok) break; } catch { /* wait */ } await new Promise(r => setTimeout(r, 200)); }
}

// stepIndex of the first animated scene (act1), read from the script source so the audit survives script edits
const src = fs.readFileSync('src/game/content.ts', 'utf8');
const body = src.slice(src.indexOf('export const SCRIPT'));
const entries = body.split('\n').filter(l => /^\s*\{ kind:/.test(l));
const sceneIdx = entries.findIndex(l => l.includes("sceneId: 'act1'"));
if (sceneIdx < 0) throw new Error('could not find act1 in SCRIPT');
const seed = { version: 1, stepIndex: sceneIdx, step: { type: 'scene', beat: 0 }, players: [], teams: [], settings: { teamCount: 4, sound: false, voice: false }, timer: { running: false, endsAt: null, remaining: 0, total: 0 }, micPicked: [], votes: {}, updatedAt: Date.now() };

const browser = await chromium.launch({ channel: 'chrome' });

async function measure(name, hash, viewport, seeded) {
  const ctx = await browser.newContext({ viewport, hasTouch: true });
  const page = await ctx.newPage();
  if (seeded) await page.addInitScript(s => { localStorage.setItem('sg-state-v1', JSON.stringify(s)); }, seed);
  await page.addInitScript(() => {
    window.__long = [];
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__long.push(e.duration); }).observe({ type: 'longtask', buffered: true });
  });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const reqs = new Map();
  cdp.on('Network.responseReceived', e => reqs.set(e.requestId, { url: e.response.url, type: e.type }));
  const done = [];
  cdp.on('Network.loadingFinished', e => { const r = reqs.get(e.requestId); if (r) done.push({ ...r, bytes: e.encodedDataLength }); });
  if (THROTTLE > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(`${BASE}/#/${hash}`, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const initial = done.filter(d => d.type === 'Script').reduce((a, d) => a + d.bytes, 0); // JS needed to show the route
  await page.waitForTimeout(1200); // let first scene settle; idle prefetch of scene chunks follows
  const nav = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd }; });
  const fp = await page.evaluate(() => Object.fromEntries(performance.getEntriesByType('paint').map(p => [p.name, p.startTime])));
  // Frame sampling
  const frames = await page.evaluate(secs => new Promise(res => {
    const t = []; let last = performance.now(); const end = last + secs * 1000;
    const tick = now => { t.push(now - last); last = now; if (now < end) requestAnimationFrame(tick); else res(t); };
    requestAnimationFrame(tick);
  }), SECS);
  const long = await page.evaluate(() => window.__long);
  const dom = await page.evaluate(() => ({ nodes: document.getElementsByTagName('*').length, anims: document.getAnimations().filter(a => a.playState === 'running').length }));
  const f = frames.slice(1);
  const sorted = [...f].sort((a, b) => a - b);
  const js = done.filter(d => d.url.endsWith('.js') || d.type === 'Script');
  const sum = a => a.reduce((x, y) => x + y.bytes, 0);
  const res = {
    name, throttle: THROTTLE,
    jsInitialKB: +(initial / 1024).toFixed(1),
    jsTotalKB: +(sum(js) / 1024).toFixed(1), jsFiles: js.length,
    totalKB: +(sum(done) / 1024).toFixed(1),
    fontKB: +(sum(done.filter(d => /\.woff2?$/.test(d.url))) / 1024).toFixed(1),
    dclMs: Math.round(nav.dcl), loadMs: Math.round(nav.load), fcpMs: Math.round(fp['first-contentful-paint'] ?? 0),
    longTasks: long.length, longTaskMs: Math.round(long.reduce((a, b) => a + b, 0)),
    frameAvgMs: +(f.reduce((a, b) => a + b, 0) / f.length).toFixed(2),
    frameP95Ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(2),
    framesOver33: f.filter(x => x > 33.4).length, frames: f.length,
    domNodes: dom.nodes, runningAnims: dom.anims,
    errors,
  };
  await ctx.close();
  return res;
}

const out = [
  await measure('screen (act1 scene)', '', { width: 1920, height: 1080 }, true),
  await measure('admin (phone)', 'admin', { width: 390, height: 844 }, false),
];
console.log(JSON.stringify(out, null, 1));
console.table(out.map(({ errors, ...r }) => r));
await browser.close();
server?.kill();
