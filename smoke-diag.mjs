import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()));
page.on('pageerror', (err) => console.log('[pageerror]', err.message));

console.log('STEP: goto');
await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded', timeout: 15000 });

console.log('STEP: wait entry gate');
await page.waitForSelector('text=Enter in silence', { timeout: 15000 });

console.log('STEP: click start');
await page.click('text=Start');

console.log('STEP: wait 1500ms');
await page.waitForTimeout(1500);

console.log('STEP: check nav.group exists');
const navCount = await page.locator('nav.group').count();
console.log('nav.group count:', navCount);

console.log('STEP: measure frame rate over 3s');
const fps = await page.evaluate(() => new Promise((resolve) => {
  let frames = 0;
  const start = performance.now();
  function tick() {
    frames += 1;
    if (performance.now() - start < 3000) {
      requestAnimationFrame(tick);
    } else {
      resolve(frames / 3);
    }
  }
  requestAnimationFrame(tick);
}));
console.log('FPS:', fps);

console.log('STEP: hover nav');
await page.hover('nav.group', { timeout: 30000 });

console.log('STEP: wait 300ms');
await page.waitForTimeout(300);

console.log('STEP: check About link visible');
const aboutVisible = await page.locator('nav.group >> text=About').isVisible().catch((e) => 'ERR:' + e.message);
console.log('About visible:', aboutVisible);

console.log('STEP: click About');
await page.click('nav.group >> text=About', { timeout: 10000 });

console.log('STEP: wait 2500ms');
await page.waitForTimeout(2500);

console.log('STEP: screenshot');
await page.screenshot({ path: 'D:\\Projects\\Website Portfolio\\diag-about.png' });

console.log('DONE');
await browser.close();
