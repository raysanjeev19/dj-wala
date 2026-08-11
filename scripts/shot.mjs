#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   DJ Wala — screenshot at a real device size

   `--window-size` does not do what you want below about 500px: macOS
   headless Chrome clamps the window, so a 390px phone renders at 500 and
   the screenshot is a crop of a layout no phone will ever see. The only
   way to lay out at a true phone width is to override the device metrics
   over the DevTools Protocol, which is what this does.

     node scripts/shot.mjs 390 844 out.png
     node scripts/shot.mjs 390 844 out.png --playing --list
   ───────────────────────────────────────────────────────────── */

import { spawn } from 'node:child_process';
import { writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = process.env.SITE ?? 'http://127.0.0.1:4173';
const CHROME =
  process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const [width = '390', height = '844', out = 'shot.png'] = process.argv.slice(2);
const flags = process.argv.slice(2).filter((a) => a.startsWith('--'));

const PORT = 9444 + (Number(width) % 50);
const PROFILE = join(ROOT, 'scripts', `.chrome-shot-${width}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--no-first-run',
  '--mute-audio',
  '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  'about:blank',
]);
chrome.stderr.on('data', () => {});

let ws;
let msgId = 1;

function send(method, params = {}) {
  const id = msgId++;
  return new Promise((resolve, reject) => {
    const onMessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id !== id) return;
      ws.removeEventListener('message', onMessage);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    };
    ws.addEventListener('message', onMessage);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

try {
  let wsUrl = null;
  for (let i = 0; i < 40 && !wsUrl; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
      if (res.ok) wsUrl = (await res.json()).webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    if (!wsUrl) await sleep(250);
  }
  if (!wsUrl) throw new Error('Chrome never opened its debugging port');

  ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });

  // The whole point: lay out at the phone's real width and pixel ratio.
  await send('Emulation.setDeviceMetricsOverride', {
    width: Number(width),
    height: Number(height),
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

  await send('Page.enable');
  await send('Page.navigate', { url: SITE });
  await sleep(5000); // fonts, backdrop, the entrance animations

  if (flags.includes('--playing')) {
    await send('Runtime.evaluate', {
      expression: "document.body.classList.add('is-playing')",
    });
  }
  if (flags.includes('--list')) {
    await send('Runtime.evaluate', { expression: "document.getElementById('listBtn').click()" });
  }
  if (flags.length) await sleep(1200);

  // What actually overflows, reported alongside the picture — a screenshot
  // of a too-wide page looks like a crop, not like a bug.
  const { result } = await send('Runtime.evaluate', {
    expression: `(() => {
      const de = document.documentElement;
      const over = [...document.querySelectorAll('body *')]
        .filter(n => {
          const r = n.getBoundingClientRect();
          return r.width && (r.right > de.clientWidth + 1 || r.left < -1);
        })
        .filter(n => !n.closest('.bg') && !n.closest('.yt-host'))
        .map(n => n.tagName + '.' + (typeof n.className === 'string' ? n.className.split(' ')[0] : ''));
      return JSON.stringify({
        vw: de.clientWidth, vh: de.clientHeight,
        scrollW: de.scrollWidth, scrollH: de.scrollHeight,
        overflowing: [...new Set(over)],
      });
    })()`,
    returnByValue: true,
  });
  console.log(`${width}×${height}  ${result.value}`);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(out, Buffer.from(shot.data, 'base64'));
  console.log(`→ ${out}`);
} finally {
  ws?.close();
  chrome.kill();
  await rm(PROFILE, { recursive: true, force: true });
}
