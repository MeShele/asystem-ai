import puppeteer from 'puppeteer';
import path from 'node:path';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-cache'] });
const page = await browser.newPage();
await page.setCacheEnabled(false);
await page.setViewport({ width: 1440, height: 1100 });
await page.goto('http://localhost:3000/ru?nocache=' + Date.now(), { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 3000));
await page.evaluate(() => {
  const s = document.getElementById('services');
  if (s) s.scrollIntoView({ behavior: 'instant', block: 'start' });
});
await new Promise(r => setTimeout(r, 2500));
const file = path.resolve('_refs/local/v29c-fresh.png');
await page.screenshot({ path: file, fullPage: false });
console.log('OK ' + file);
await browser.close();
