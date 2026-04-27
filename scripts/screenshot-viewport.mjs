import puppeteer from 'puppeteer';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const url = process.argv[2] || 'http://localhost:3000/ru';
const outName = process.argv[3] || 'viewport';
const scrollY = Number(process.argv[4] || 0);
const vpH = Number(process.argv[5] || 900);

const outDir = path.resolve('_refs/local');
await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

for (const vp of [{ l: 'desktop', w: 1440, h: vpH }, { l: 'mobile', w: 375, h: vpH }]) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 2000));
  if (scrollY > 0) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await new Promise((r) => setTimeout(r, 1200));
  }
  const file = path.join(outDir, `${outName}-${vp.l}-y${scrollY}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`OK  ${file}`);
  await page.close();
}

await browser.close();
