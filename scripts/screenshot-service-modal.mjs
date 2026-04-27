import puppeteer from 'puppeteer';
import path from 'node:path';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/ru', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2500));
// Scroll to services section
await page.evaluate(() => {
  const s = document.getElementById('services');
  if (s) s.scrollIntoView({ behavior: 'instant', block: 'start' });
});
await new Promise(r => setTimeout(r, 1500));
// Click first service card
const cards = await page.$$('#services ~ div button, #services + div button');
if (cards.length === 0) {
  // Try alternative selector
  const altCards = await page.$$('button[class*="aspect-square"]');
  if (altCards.length) await altCards[0].click();
} else {
  await cards[0].click();
}
await new Promise(r => setTimeout(r, 1500));
const file = path.resolve('_refs/local/v19-service-modal.png');
await page.screenshot({ path: file, fullPage: false });
console.log('OK ' + file);
await browser.close();
