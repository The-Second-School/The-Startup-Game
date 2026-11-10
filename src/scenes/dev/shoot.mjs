// node src/scenes/dev/shoot.mjs <scene> <ms,ms,...> [teams] [prefix]
// Plays the real ActScene and screenshots at the given times into shots/scenes/.
import { chromium } from 'playwright';
const [scene = 'welcome', times = '1000', teams = '4', prefix = ''] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = [];
page.on('pageerror', e => errs.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(`http://127.0.0.1:5175/src/scenes/dev/scenes.html?scene=${scene}&teams=${teams}`);
const t0 = Date.now();
for (const t of times.split(',').map(Number)) {
  const wait = t - (Date.now() - t0);
  if (wait > 0) await page.waitForTimeout(wait);
  await page.screenshot({ path: `shots/scenes/${prefix}${scene}-${String(Math.round(t / 1000)).padStart(2, '0')}s.png` });
}
if (errs.length) console.log('ERRORS', scene, errs.slice(0, 5).join('\n'));
await browser.close();
console.log('ok', scene);
