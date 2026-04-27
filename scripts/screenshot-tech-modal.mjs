import puppeteer from 'puppeteer';
import path from 'node:path';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/ru', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2500));
await page.evaluate(() => {
  const s = document.getElementById('stack');
  if (s) s.scrollIntoView({ behavior: 'instant', block: 'start' });
});
await new Promise(r => setTimeout(r, 1500));
// Pause marquee by hovering then click first button with "Next.js 16" text
const nextBtn = await page.evaluateHandle(() => {
  const btns = [...document.querySelectorAll('button')];
  return btns.find(b => b.textContent?.includes('PostgreSQL'));
});
if (nextBtn) {
  await (nextBtn.asElement())?.click();
}
await new Promise(r => setTimeout(r, 1500));
const file = path.resolve('_refs/local/v22-tech-modal.png');
await page.screenshot({ path: file, fullPage: false });
console.log('OK ' + file);
await browser.close();
