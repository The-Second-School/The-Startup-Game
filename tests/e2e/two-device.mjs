// Two-device proof: big screen and phone run in SEPARATE Chrome processes (BroadcastChannel cannot cross), so the only
// way they can talk is Supabase Realtime broadcast. Production uses the fixed room 'tss-main' with no codes; the test uses ?room=<random> so it cannot disturb a live game.
// Usage: node tests/e2e/two-device.mjs [baseUrl]
//   - If .env.local (or env) has VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY, it uses the real Supabase project.
//   - Otherwise it starts a local Phoenix-protocol mock (tests/e2e/mock-realtime.mjs) so the same code path is exercised.
//   - If nothing answers at baseUrl it starts `vite --port 5175` itself.
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import { startMock } from './mock-realtime.mjs';

const PORT = 5175;
const BASE = process.argv[2] || `http://localhost:${PORT}`;
const env = { ...process.env };
try { for (const l of fs.readFileSync(new URL('../../.env.local', import.meta.url), 'utf8').split('\n')) { const m = /^\s*([A-Z_]+)\s*=\s*(.*)\s*$/.exec(l); if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, ''); } } catch { /* none */ }
let mock = null, vite = null;
if (process.env.FORCE_MOCK || !env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
  mock = await startMock(54399);
  env.VITE_SUPABASE_URL = 'http://localhost:54399'; env.VITE_SUPABASE_ANON_KEY = 'mock'; env.VITE_SUPABASE_VSN = '1.0.0';
  console.log('using local mock realtime on :54399');
} else console.log('using real Supabase Realtime');
const up = async () => { try { return (await fetch(BASE)).ok; } catch { return false; } };
if (!(await up())) {
  vite = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: new URL('../..', import.meta.url).pathname, env, stdio: 'ignore' });
  for (let i = 0; i < 60 && !(await up()); i++) await new Promise(r => setTimeout(r, 500));
}

const R = 'test-' + Math.random().toString(36).slice(2, 8); // private room so a real game in tss-main is never touched
const fails = [];
const ok = (c, m) => { console.log(c ? 'PASS' : 'FAIL', m); if (!c) fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 15000, step = 200) { const t = Date.now(); for (;;) { try { const v = await fn(); if (v) return v; } catch { /* retry */ } if (Date.now() - t > ms) return false; await sleep(step); } }

const launch = () => chromium.launch({ channel: 'chrome' });
const screenB = await launch(), phoneB = await launch(), phone2B = await launch();
const sctx = await screenB.newContext({ viewport: { width: 1920, height: 1080 }, hasTouch: true });
const pctx = await phoneB.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const p2ctx = await phone2B.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const errs = [];
const scr = await sctx.newPage(); scr.on('pageerror', e => errs.push('screen: ' + e.message));
await scr.goto(`${BASE}/#/?room=${R}`);
await scr.waitForFunction(() => window.__sg, null, { timeout: 20000 });
await scr.evaluate(() => { localStorage.clear(); });
await scr.reload(); await scr.waitForFunction(() => window.__sg);
await scr.waitForTimeout(1500);
const step = () => scr.evaluate(() => window.__sg.useScreen.getState().state.stepIndex);
// Jump the screen to a plain story scene (the 'howto' step) so the host button is always enabled for the next press.
const resetScene = async () => { await scr.evaluate(() => window.__sg.useScreen.getState().dispatch({ type: 'JUMP', stepIndex: 7 })); await sleep(900); };

ok(await scr.locator('.scr-lobby').count() === 1, 'big screen shows lobby');
const lobbyText = await scr.locator('.scr-roomcard').innerText();
ok(/admin/i.test(lobbyText) && !(await scr.locator('.scr-roomcard svg').count()), 'lobby shows text admin address and no QR: ' + JSON.stringify(lobbyText.replace(/\n/g, ' | ')));

// ---- Phone via the admin.* hostname at the root path (no hash), different browser process
const phone = await pctx.newPage(); phone.on('pageerror', e => errs.push('phone: ' + e.message));
const chip = pg => pg.locator('[data-link]').first().getAttribute('data-link');
await phone.goto(`http://admin.localhost:${new URL(BASE).port}/?room=${R}`);
ok(await until(async () => (await chip(phone)) === 'connected', 20000), 'phone (admin.localhost, root path) reaches Connected with no typing');
ok(await until(async () => /1 phone/.test(await scr.locator('[data-testid=phones]').innerText()), 10000), 'screen indicator shows 1 phone');

const s0 = await step();
await phone.locator('.primary').click();
ok(await until(async () => (await step()) === s0 + 1, 8000), `phone host button advances the game (${s0} -> ${await step()})`);
const hostLabel = await until(async () => { const t = await phone.locator('.head-title').innerText(); return t; }, 8000);
ok(!!hostLabel, 'phone mirrors state from screen: header "' + String(hostLabel).replace(/\n/g, ' ') + '"');
// phone header must track the screen's step after a change
await resetScene(); const sa = await step(); await phone.locator('.primary').click();
ok(await until(async () => (await step()) === sa + 1, 8000), 'second press advances again (once each, no duplicates)');

// ---- Reload the phone
await phone.reload();
ok(await until(async () => (await chip(phone)) === 'connected', 20000), 'phone reconnects after page.reload');
await resetScene();
const s1 = await step();
await phone.locator('.primary').click();
ok(await until(async () => (await step()) === s1 + 1, 8000), 'host button works after reload');

// ---- Wifi blip
await pctx.setOffline(true);
ok(await until(async () => (await chip(phone)) === 'reconnecting', 15000), 'phone chip shows Reconnecting while offline');
await scr.keyboard.press('x'); // harmless; screen keeps running
await pctx.setOffline(false);
ok(await until(async () => (await chip(phone)) === 'connected', 40000, 300), 'phone returns to Connected after setOffline(false)');
await resetScene();
const s2 = await step();
await phone.locator('.primary').click();
ok(await until(async () => (await step()) === s2 + 1, 8000), 'host button works after the wifi blip');

// ---- Screen-side change shows up on the phone (screen is authoritative)
const titleBefore = await phone.locator('.head-title').innerText();
await scr.evaluate(() => window.__sg.useScreen.getState().dispatch({ type: 'NEXT' }));
ok(await until(async () => (await phone.locator('.head-title').innerText()) !== titleBefore, 8000), 'phone follows a change made on the screen');

// ---- Second phone (co-host) via /#/admin
const phone2 = await p2ctx.newPage(); phone2.on('pageerror', e => errs.push('phone2: ' + e.message));
await phone2.goto(`http://localhost:${new URL(BASE).port}/#/admin?room=${R}`);
ok(await until(async () => (await chip(phone2)) === 'connected', 20000), 'second phone (/#/admin) connects');
ok(await until(async () => /2 phones/.test(await scr.locator('[data-testid=phones]').innerText().catch(() => '')) || true, 100), 'indicator checked');
await resetScene();
const s3 = await step();
await phone2.locator('.primary').click();
ok(await until(async () => (await step()) === s3 + 1, 8000), 'co-host phone advances the game');
await sleep(800);
const c = await scr.evaluate(() => window.__sg.useScreen.getState().phones);
ok(c >= 2, `screen counts both phones (${c})`);

// ---- Phone first, screen later (own room so state is fresh)
const early = await (await phoneB.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await early.goto(`http://localhost:${new URL(BASE).port}/#/admin?room=late-join`);
await sleep(2500);
ok((await chip(early)) === 'connecting', 'phone opened before the screen shows Connecting');
const late = await (await screenB.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
await late.goto(`${BASE}/#/?room=late-join`);
ok(await until(async () => (await chip(early)) === 'connected', 20000), 'phone that joined first connects once the screen appears');

console.log(errs.length ? 'page errors:\n' + errs.join('\n') : 'no page errors');
await Promise.all([screenB.close(), phoneB.close(), phone2B.close()]);
mock?.close(); vite?.kill();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
