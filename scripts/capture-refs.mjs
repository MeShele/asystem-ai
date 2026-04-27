import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const refs = [
  { name: 'locomotive',    url: 'https://locomotive.ca/' },
  { name: 'ueno',          url: 'https://ueno.co/' },
  { name: 'instrument',    url: 'https://www.instrument.com/' },
  { name: 'offbrand',      url: 'https://offbrand.co/' },
  { name: 'threejs',       url: 'https://threejs.org/' },
];

const viewports = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'mobile',  width: 375,  height: 812 },
];

const outDir = path.resolve('_refs');
await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const results = [];

for (const ref of refs) {
  for (const vp of viewports) {
    const tag = `${ref.name}-${vp.label}`;
    const file = path.join(outDir, `${tag}.png`);
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36');
    try {
      await page.goto(ref.url, { waitUntil: 'networkidle2', timeout: 45000 });
      await new Promise((r) => setTimeout(r, 2500));
      await page.screenshot({ path: file, fullPage: true });
      const title = await page.title().catch(() => '');
      const h1 = await page.$eval('h1', (el) => el.innerText.trim()).catch(() => '');
      results.push({ tag, ok: true, title, h1, file });
      console.log(`OK  ${tag}  "${title}"  h1="${h1.slice(0, 80)}"`);
    } catch (err) {
      results.push({ tag, ok: false, error: String(err).slice(0, 200) });
      console.log(`ERR ${tag}  ${String(err).slice(0, 200)}`);
    }
    await page.close();
  }
}

await browser.close();
console.log('\nDone. Files in:', outDir);
