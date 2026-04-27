import puppeteer from 'puppeteer';
import path from 'node:path';

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto('http://localhost:3000/ru', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2000));
await page.evaluate(() => window.scrollTo(0, 850));
await new Promise((r) => setTimeout(r, 1200));
const card = await page.$('a[href^="#case-"]');
if (card) {
  await card.hover();
  await new Promise((r) => setTimeout(r, 800));
}
const file = path.resolve('_refs/local/v3-client-hover.png');
await page.screenshot({ path: file, fullPage: false });
console.log('OK  ' + file);
await browser.close();
