/* Graba la landing cuadro por cuadro (sin tirones) y arma un MP4 con ffmpeg.
   Requiere Node, Playwright con Chromium y ffmpeg.
     node record.js                         → out/landing.mp4 a 1920×1200 y 30 fps
     node record.js --stills 0,3,7.5        → capturas sueltas en out/still-*.jpg
   Opciones: --fps 30  --width 1440 --height 900 --scale 1.3333  --out out/landing.mp4 */
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { chromium } = require('playwright');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const FPS = +arg('fps', 30), WIDTH = +arg('width', 1440), HEIGHT = +arg('height', 900), SCALE = +arg('scale', 4 / 3);
const OUT = path.resolve(__dirname, arg('out', 'out/landing.mp4'));
const STILLS = arg('stills', null);
const ROOT = __dirname;

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const url = `http://localhost:${server.address().port}/?capture`;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: SCALE });
  page.on('pageerror', e => console.error('Error en la página:', e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__capture);
  await page.evaluate(() => window.__capture.ready);
  const duration = await page.evaluate(() => window.__capture.duration);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  if (STILLS) {
    for (const t of STILLS.split(',').map(Number)) {
      await page.evaluate(t => window.__capture.seek(t), t);
      const f = path.join(path.dirname(OUT), `still-${String(t).replace('.', '_')}.jpg`);
      await page.screenshot({ path: f, type: 'jpeg', quality: 92 });
      console.log(f);
    }
  } else {
    const frames = Math.round(duration * FPS);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < frames; i++) {
      await page.evaluate(t => window.__capture.seek(t), i / FPS);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % FPS === 0) process.stdout.write(`\r${i}/${frames} cuadros · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
    ff.stdin.end();
    await new Promise((r, j) => ff.on('close', c => c ? j(new Error('ffmpeg terminó con código ' + c)) : r()));
    console.log(`\nListo: ${OUT}`);
  }
  await browser.close();
  server.close();
})().catch(e => { console.error(e); process.exit(1); });
