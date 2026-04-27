import puppeteer from 'puppeteer';
import path from 'node:path';

const refs = [
  { name: 'activetheory', url: 'https://activetheory.net/' },
];

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

for (const ref of refs) {
  for (const vp of [{ l: 'desktop', w: 1440, h: 900 }, { l: 'mobile', w: 375, h: 812 }]) {
    const tag = `${ref.name}-${vp.l}`;
    const page = await browser.newPage();
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36');
    try {
      await page.goto(ref.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await new Promise((r) => setTimeout(r, 15000));
      await page.evaluate(() => window.scrollTo(0, window.innerHeight));
      await new Promise((r) => setTimeout(r, 2000));
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise((r) => setTimeout(r, 1000));
      const file = path.resolve('_refs', `${tag}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log(`OK  ${tag}  ->  ${file}`);
    } catch (err) {
      console.log(`ERR ${tag}  ${String(err).slice(0, 180)}`);
    }
    await page.close();
  }
}

await browser.close();
