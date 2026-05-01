import puppeteer from 'puppeteer';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const url = process.argv[2] || 'http://localhost:3000/ru';
const outName = process.argv[3] || 'scrolled';

const outDir = path.resolve('_refs/local');
await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

for (const vp of [{ l: 'desktop', w: 1440, h: 900 }, { l: 'mobile', w: 375, h: 812 }]) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1500));

  // Slow scroll to trigger all whileInView observers
  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const step = Math.floor(vp.h * 0.6);
  for (let y = 0; y < totalHeight; y += step) {
    await page.evaluate((sy) => window.scrollTo(0, sy), y);
    await new Promise((r) => setTimeout(r, 250));
  }
  // Back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 800));

  const file = path.join(outDir, `${outName}-${vp.l}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`OK  ${file}`);
  await page.close();
}

await browser.close();
