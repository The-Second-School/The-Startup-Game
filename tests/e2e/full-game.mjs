// Full scripted playthrough with REAL taps on the big screen and real clicks on the phone admin.
// Usage: node tests/e2e/full-game.mjs [baseUrl] [outDir]
import { chromium } from 'playwright';
import fs from 'fs';
const BASE = process.argv[2] || 'http://localhost:5173';
const OUT = process.argv[3] || '/tmp/e2e';
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: +(process.env.VW||1920), height: +(process.env.VH||1080) }, recordVideo: { dir: OUT, size: { width: 1280, height: 720 } }, hasTouch: true });
const scr = await ctx.newPage();
const errs = [];
scr.on('pageerror', e => errs.push('screen: ' + e.message));
scr.on('console', m => { if (m.type() === 'error') errs.push('screen console: ' + m.text().slice(0, 160)); });
await scr.goto(BASE + '/#/');
await scr.waitForFunction(() => window.__sg);
const adm = await ctx.newPage();
await adm.setViewportSize({ width: 390, height: 844 });
adm.on('pageerror', e => errs.push('admin: ' + e.message));
await adm.goto(BASE + '/#/admin');
await adm.waitForSelector('.primary', { timeout: 10000 });
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const sleep = ms => scr.waitForTimeout(ms);
const st = () => scr.evaluate(() => { const g = window.__sg; const s = g.useScreen.getState().state; const step = g.currentStep(s); return { id: step.id, kind: step.kind, phase: s.step.phase ?? s.step.type, st: s.step, teams: s.teams.map(t => ({ id: t.id, name: t.name, coins: t.coins, locks: null })), nPlayers: s.players.length, nTeams: s.teams.length, idx: s.stepIndex }; });
const taps = () => scr.evaluate(() => [...document.querySelectorAll('[data-tap]')].map(e => e.dataset.tap));
const tap = async (id, wait = 450) => {
  const el = scr.locator(`[data-tap="${id}"]`).first();
  await el.waitFor({ state: 'visible', timeout: 8000 });
  await el.click({ force: true });
  await sleep(wait);
};
const selectTeam = async (t) => {
  for (let a = 0; a < 5; a++) {
    await tap(`chip-${t}`, 500);
    const sel = await scr.evaluate(() => window.__sg.useScreen.getState().state.step.selectedTeamId);
    if (sel === t) return true;
    await sleep(900);
  }
  log('  could not select', t); return false;
};
const hostBtn = async () => { const t = (await adm.locator('.primary').innerText()).trim(); const dis = await adm.locator('.primary').isDisabled(); return { t, dis }; };
const host = async (wait = 700) => { const { t, dis } = await hostBtn(); if (dis) { log('  host disabled:', t); return false; } await adm.locator('.primary').click(); log('  host>', t); await sleep(wait); return true; };
let shot = 0;
const snap = async (label) => { await scr.screenshot({ path: `${OUT}/s${String(shot++).padStart(3, '0')}-${label}.png` }); };

// ---- Lobby + story ----
await sleep(1500); await snap('lobby');
while ((await st()).kind !== 'setup_players') { const s = await st(); log('story', s.id); await sleep(1800); await snap(s.id); await host(900); }

// ---- Players: type 16 names on the on-screen keyboard ----
const names = ['Aarav','Riya','Kabir','Isha','Vihaan','Anaya','Arjun','Diya','Om','Myra','Sai','Kiara','Dev','Pari','Ira','Zoya'];
let i = 0;
for (const n of names) {
  const grade = 5 + (i % 3); i++;
  await tap(`grade-${grade}`, 250);
  for (const ch of n) await tap(`k-${ch.toUpperCase()}`, 140);
  await tap('k-add', 350);
}
await snap('players-added'); log('players', (await st()).nPlayers);
await host();

// ---- Teams ----
await tap('teamcount-4'); await tap('make-teams', 1500); await snap('teams'); log('teams', (await st()).nTeams);
await host();
// ---- Roles ----
await sleep(1200); await snap('roles');
for (let k = 0; k < 4; k++) { if ((await st()).kind !== 'setup_roles') break; if (!(await host(900))) break; }
// ---- Products ----
if ((await st()).kind === 'setup_products') { for (let k = 0; k < 6 && (await taps()).includes('spin-product') && !(await hostBtn()).t.match(/^(Next|Name)/i); k++) { await tap('spin-product', 6500); await snap('products' + k); } await host(); }
// ---- Names ----
if ((await st()).kind === 'setup_names') {
  const tn = ['Rocket Kids', 'Chai Champs', 'Byte Bros', 'Star Girls'];
  for (const name of tn) { for (const ch of name) await tap(ch === " " ? "k-space" : `k-${ch.toUpperCase()}`, 120); await tap('k-add', 500); }
  await snap('names'); await host();
}

// ---- Main game loop ----
let lastKey = '', same = 0, guard = 0;
while (guard++ < 900) {
  const s = await st();
  if (s.kind === 'end') { await sleep(3500); await snap('end'); break; }
  const key = `${s.id}/${s.phase}/${JSON.stringify(s.st).length}`;
  same = key === lastKey ? same + 1 : 0; lastKey = key;
  if (same > 6) { log('STUCK at', key, 'taps', await taps(), 'host', await hostBtn()); await snap('STUCK-' + s.id); await host(); same = 0; continue; }
  log(s.kind, s.id, s.phase);
  const ids = await taps();
  if ((s.kind === 'question' || s.kind === 'megaorder') && s.phase === 'open') {
    await sleep(2500);
    const teams = await scr.evaluate(() => window.__sg.useScreen.getState().state.teams.map(t => t.id));
    let n = 0;
    for (const t of teams) {
      if (!(await taps()).includes(`chip-${t}`)) continue;
      await sleep(300); if (!(await selectTeam(t))) continue;
      await tap(`opt-${(n++ + (s.id.length)) % 4}`, 400);
      await tap(`chip-${t}`, 700); // tapping the selected chip again locks the pick
    }
    await snap(s.id + '-locked'); await host(1500); continue;
  }
  if (s.kind === 'price' && s.phase === 'open') {
    await sleep(2500);
    const teams = await scr.evaluate(() => window.__sg.useScreen.getState().state.teams.map(t => t.id));
    for (const t of teams) {
      if (!(await taps()).includes(`chip-${t}`)) continue;
      await sleep(300); if (!(await selectTeam(t))) continue;
      for (let k = 0; k < 3; k++) await tap('price-plus', 250);
      await tap(`chip-${t}`, 700);
    }
    await snap('price-locked'); await host(1500); continue;
  }
  if (s.kind === 'mic' && ids.includes('mic-spin')) { await tap('mic-spin', 5500); await snap('mic'); await host(); continue; }
  if (s.kind === 'bugsmash' && ids.includes('bug-start')) {
    await tap('bug-start', 1200);
    for (let k = 0; k < 30; k++) {
      const bug = scr.locator('[data-bug], .v2-bug').first();
      if (await bug.count()) await bug.click({ force: true, timeout: 600 }).catch(() => {});
      else await scr.mouse.click(300 + (k * 97) % 1300, 600 + (k * 53) % 380);
      await sleep(350);
    }
    await sleep(2500); await snap('bugsmash'); continue;
  }
  await snap(s.id + '-' + String(s.phase).replace(/\W/g, ''));
  await sleep(900);
  const ok = await host(1200);
  if (!ok) { await sleep(2500); }
}
log('DONE. errors:', errs.length); errs.slice(0, 20).forEach(e => log(' ', e));
await ctx.close();
const vids = fs.readdirSync(OUT).filter(f => f.endsWith('.webm')); log('videos', vids.join(', '));
await b.close();
