#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   DJ Wala — embeddability check

   Answers the one question ingest cannot: will this video actually
   play inside our iframe?

   Nothing over plain HTTP will tell you. oEmbed happily returns a title
   for a video whose owner has switched embedding off — which is the
   single most common reason an Indian music upload is silent on a
   third-party site, because the big labels disable it by default. A
   playlist can pass ingest completely and still have four songs in five
   that never make a sound.

   So we ask the player. This drives a real headless Chrome over
   scripts/embed-test.html, which cues every ID in tracks.json through the
   YouTube IFrame API and records what comes back:

     101 / 150  the owner does not allow embedding    ← the big one
     100        video removed or private
     5          player fault
     2          bad video id

   Headless is fine for this. Those codes come from a permission check,
   not from decoding audio, so they fire in a browser with no media stack.

   Usage — with the site already being served on :4173:
     node scripts/check-embeds.mjs             # vet the candidate pool
     node scripts/check-embeds.mjs --shipped   # vet tracks.json as shipped
   ───────────────────────────────────────────────────────────── */

import { spawn } from 'node:child_process';
import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = process.env.SITE ?? 'http://127.0.0.1:4173';
const PORT = 9333;
const PROFILE = join(ROOT, 'scripts', '.chrome-embed-check');

const CHROME =
  process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ERROR_MEANING = {
  2: 'bad video id',
  5: 'player fault',
  100: 'removed or private',
  101: 'embedding not allowed',
  150: 'embedding not allowed',
};

/* ── Drive Chrome over the DevTools Protocol ─────────────────
   The obvious approach — `--virtual-time-budget` plus `--dump-dom` — does
   not work here. Virtual time fast-forwards timers but still waits on
   real network, and sixty-odd iframe loads blow through any budget, so
   the page gets dumped mid-run. A real connection and a real clock is
   the only thing that finishes. */

async function main() {
  await rm(PROFILE, { recursive: true, force: true });

  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--mute-audio',
    '--autoplay-policy=no-user-gesture-required',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    'about:blank',
  ]);
  chrome.stderr.on('data', () => {}); // Chrome is chatty on stderr; ignore

  try {
    // --shipped vets tracks.json — what listeners actually get — rather
    // than the candidate pool it was chosen from.
    const src = process.argv.includes('--shipped') ? '?src=/tracks.json' : '';
    const target = await openPage(`${SITE}/scripts/embed-test.html${src}`);
    const result = await pollUntilDone(target);
    await report(result);
  } finally {
    chrome.kill();
    // Chrome keeps writing for a moment after SIGTERM, so a delete issued
    // straight away races it and throws ENOTEMPTY — which would otherwise
    // bury a completed run's results under a cleanup error. Give it a beat,
    // and never let tidying up fail the check.
    await sleep(500);
    await rm(PROFILE, { recursive: true, force: true }).catch(() => {});
  }
}

async function openPage(url) {
  // Chrome needs a moment before the debugging port answers.
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, {
        method: 'PUT',
      });
      if (res.ok) return (await res.json()).webSocketDebuggerUrl;
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error('Chrome never opened its debugging port');
}

/** One Runtime.evaluate over an open WebSocket. */
function evaluate(ws, expression, id) {
  return new Promise((resolve, reject) => {
    const onMessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id !== id) return;
      ws.removeEventListener('message', onMessage);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result?.result?.value);
    };
    ws.addEventListener('message', onMessage);
    ws.send(
      JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: { expression, returnByValue: true },
      })
    );
  });
}

async function pollUntilDone(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });

  let msgId = 1;
  const started = Date.now();
  let lastSeen = '';

  // The page tests ~2.6s per video; give it that plus a wide margin.
  const DEADLINE_MS = 10 * 60 * 1000;

  while (Date.now() - started < DEADLINE_MS) {
    await sleep(2000);

    const title = await evaluate(ws, 'document.title', msgId++);
    if (title !== lastSeen) {
      lastSeen = title;
      process.stdout.write(`\r${title.padEnd(40)}`);
    }

    const raw = await evaluate(ws, 'document.getElementById("out").textContent', msgId++);
    if (raw && raw !== 'running') {
      ws.close();
      process.stdout.write('\n');
      return JSON.parse(raw);
    }
  }

  ws.close();
  throw new Error('embed test did not finish inside the deadline');
}

async function report({ total, ok, verdicts }) {
  const label = process.argv.includes('--shipped') ? 'shipped' : 'candidate';
  console.log(`\n${ok}/${total} ${label} videos are playable in an embed.\n`);

  const reasons = {};
  for (const v of Object.values(verdicts)) {
    if (v.ok) continue;
    const key = v.error === null ? 'never cued' : `${v.error} ${ERROR_MEANING[v.error] ?? ''}`;
    reasons[key] = (reasons[key] ?? 0) + 1;
  }
  for (const [why, n] of Object.entries(reasons).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)} × ${why}`);
  }

  // Two different questions, two different files. A --shipped run must not
  // clobber the candidate verdicts, because build-tracks.mjs reads those to
  // decide what to ship in the first place.
  const shipped = process.argv.includes('--shipped');
  const verdictFile = shipped ? 'shipped-verdicts.json' : 'embed-verdicts.json';

  await writeFile(join(ROOT, 'scripts', verdictFile), JSON.stringify(verdicts, null, 2) + '\n');

  if (shipped) {
    // Name the failures, because on the shipped list every one is a song a
    // listener would have hit.
    const tracks = JSON.parse(await readFile(join(ROOT, 'tracks.json'), 'utf8'));
    const broken = tracks.filter((t) => !verdicts[t.id]?.ok);

    console.log(`\n${tracks.length - broken.length}/${tracks.length} shipped tracks play.`);
    if (broken.length) {
      console.log('\nBroken in the shipped playlist:');
      for (const t of broken) {
        const v = verdicts[t.id];
        const why = v?.error === null ? 'never cued' : `${v?.error} ${ERROR_MEANING[v?.error] ?? ''}`;
        console.log(`  [${t.rotation.padEnd(7)}] ${t.title.padEnd(28)} ${t.id}  — ${why}`);
      }
    }
  } else {
    // Per song: did any of its candidates survive?
    const seeds = JSON.parse(await readFile(join(ROOT, 'scripts', 'candidates.json'), 'utf8'));
    const stranded = seeds.filter((s) => !s.candidates.some((id) => verdicts[id]?.ok));

    console.log(`\n${seeds.length - stranded.length}/${seeds.length} songs have a playable video.`);
    if (stranded.length) {
      console.log('\nNo playable upload found for:');
      for (const s of stranded) console.log(`  [${s.rotation}] ${s.name}`);
    }
  }

  console.log(`\nVerdicts: scripts/${verdictFile}`);
}

await main();
