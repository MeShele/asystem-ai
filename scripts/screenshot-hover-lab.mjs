import puppeteer from 'puppeteer';
import path from 'node:path';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/ru', { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise(r => setTimeout(r, 2000));
await page.evaluate(() => {
  const lab = document.getElementById('lab');
  if (lab) lab.scrollIntoView({ behavior: 'instant', block: 'start' });
});
await new Promise(r => setTimeout(r, 1500));
const cells = await page.$$('#lab ~ div a, #lab ~ div > a');
if (cells.length) { await cells[0].hover(); await new Promise(r => setTimeout(r, 800)); }
const file = path.resolve('_refs/local/v5-lab-hover.png');
await page.screenshot({ path: file, fullPage: false });
console.log('OK ' + file);
await browser.close();
