import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const shotDir = 'C:\\Users\\SONNYL~1\\AppData\\Local\\Temp\\claude\\d--Projects-SonnyTech\\15efc419-03f1-406f-86c3-f8aa3b83a4f3\\scratchpad\\stage2-shots';
fs.mkdirSync(shotDir, { recursive: true });

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));

await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('text=Enter in silence');
await page.click('text=Start');
await page.waitForTimeout(1200);
await page.screenshot({ path: path.join(shotDir, '1-home.png') });

async function goTo(name) {
  await page.hover('nav.group');
  await page.click(`nav.group >> text=${name}`);
  await page.waitForTimeout(2200);
}

// Forward through all pages
for (const name of ['About', 'Projects', 'Tech Stack', 'Blog', 'What They Say', 'Contact']) {
  await goTo(name);
  const safeName = name.replace(/\s+/g, '-');
  await page.screenshot({ path: path.join(shotDir, `forward-${safeName}.png`) });
}

console.log('FORWARD_DONE');

// Backward nav: Contact -> About (should float, not fall)
await goTo('About');
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(shotDir, 'backward-About.png') });

// Open Store
await page.click('text=Store');
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(shotDir, 'store-list.png') });

// Add to cart + checkout flow
const addToCartButtons = await page.locator('.product-card .btn-primary').all();
if (addToCartButtons.length) {
  await addToCartButtons[0].click();
}
await page.waitForTimeout(300);
await page.click('.cart-button');
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(shotDir, 'store-checkout.png') });

const completeBtn = page.locator('.complete-purchase-button');
if (await completeBtn.count()) {
  await completeBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(shotDir, 'store-processing.png') });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(shotDir, 'store-complete.png') });
}

// Exit store back to site
await page.click('text=Exit to site');
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(shotDir, 'back-to-site.png') });

console.log('CONSOLE_ERRORS:', JSON.stringify(errors));
console.log('DONE');
await browser.close();
