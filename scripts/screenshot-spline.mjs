import puppeteer from 'puppeteer';
import path from 'node:path';

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto('http://localhost:3000/ru', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2000));
await page.evaluate(() => {
  const s = document.getElementById('services');
  if (s) s.scrollIntoView({ behavior: 'instant', block: 'start' });
});
// Wait long for Spline canvases to render
await new Promise(r => setTimeout(r, 18000));
const file = path.resolve('_refs/local/v27-spline-loaded.png');
await page.screenshot({ path: file, fullPage: false });
console.log('OK ' + file);
await browser.close();
