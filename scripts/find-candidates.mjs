#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   DJ Wala — candidate search

   Step one of two. For every song in seeds.mjs this collects up to
   CANDIDATES_PER_SEED video IDs that plausibly are that song, and writes
   them to candidates.json. It does not choose between them.

   Choosing happens in the browser, because the thing that disqualifies a
   video cannot be seen from here: the big labels switch off embedding on
   their official uploads, so the top result — the one an earlier version
   of this script took without asking — loads fine and then refuses to
   play anywhere but youtube.com. Two thirds of the playlist was silent
   for that reason.

   What tends to survive is the auto-generated "- Topic" upload, or a
   plain audio rip, rather than the label's own music video. Both show up
   further down the same results page, which is why we keep several.

     node scripts/find-candidates.mjs
   ───────────────────────────────────────────────────────────── */

import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SEEDS } from './seeds.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'scripts', 'candidates.json');
const CACHE = join(ROOT, 'scripts', '.search-cache.json');

const CANDIDATES_PER_SEED = 8;

/* YouTube rate-limits search in bursts rather than by average rate: a
   handful a few hundred ms apart earns a 429, the same number spread over
   seconds sails through. */
const PACE = 4000;
const RETRIES = 4;

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-IN,en;q=0.9' },
    });
    if (res.ok) return res.text();

    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= RETRIES) throw new Error(`${res.status} — ${url}`);

    const wait = 15000 * 2 ** attempt;
    console.log(`        … ${res.status}, backing off ${wait / 1000}s`);
    await sleep(wait);
  }
}

/** Every (videoId, title) pair on a results page, in rank order. YouTube
 *  splits titles into "runs" at styling boundaries, so they concatenate. */
function parseResults(html) {
  const out = [];
  const seen = new Set();
  const re = /"videoId":"([A-Za-z0-9_-]{11})".{0,600}?"title":\{"runs":\[(.*?)\]/gs;
  for (const m of html.matchAll(re)) {
    if (seen.has(m[1])) continue;
    const title = [...m[2].matchAll(/"text":"((?:[^"\\]|\\.)*)"/g)]
      .map((t) => JSON.parse(`"${t[1]}"`))
      .join('');
    if (!title) continue;
    seen.add(m[1]);
    out.push({ id: m[1], title });
  }
  return out;
}

const strip = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD') // "𝐊𝐚𝐥𝐚 𝐂𝐡𝐚𝐬𝐡𝐦𝐚" is maths-bold letters, not letters
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** How much of the song's name appears in this result's title. */
function score(resultTitle, wanted) {
  const hay = strip(resultTitle);
  const words = strip(wanted)
    .split(' ')
    .filter((w) => w.length > 2);
  if (!words.length) return 1;
  return words.filter((w) => hay.includes(w)).length / words.length;
}

/** Prefer uploads that are likely to allow embedding. A "- Topic" channel
 *  upload is auto-generated from the label's distribution feed and is
 *  almost always embeddable; a lyrical or audio version usually is too.
 *  This only reorders the shortlist — the browser still has the final say. */
function embedFriendliness(title) {
  const t = title.toLowerCase();
  let s = 0;
  if (t.includes('topic')) s += 3;
  if (/\b(audio|lyrical|lyrics)\b/.test(t)) s += 2;
  if (/\b(full video|video song|official video)\b/.test(t)) s -= 1;
  return s;
}

const cache = await readFile(CACHE, 'utf8')
  .then(JSON.parse)
  .catch(() => ({}));

const out = [];

for (const [i, seed] of SEEDS.entries()) {
  const tag = `[${String(i + 1).padStart(3, '0')}/${SEEDS.length}]`;
  const wanted = seed.name ?? seed.q;

  if (seed.id) {
    out.push({ ...seed, candidates: [seed.id] });
    console.log(`${tag} · ${wanted} (pinned)`);
    continue;
  }

  let results = cache[seed.q];
  const cached = Boolean(results);

  if (!cached) {
    try {
      const html = await get(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(seed.q)}`
      );
      results = parseResults(html);
      cache[seed.q] = results;
      await writeFile(CACHE, JSON.stringify(cache)); // checkpoint every hit
    } catch (err) {
      console.warn(`${tag} ✗ ${wanted} — ${err.message}`);
      await sleep(PACE);
      continue;
    }
  }

  // Keep only results that actually name the song, then float the ones
  // most likely to be embeddable to the front.
  const candidates = results
    .map((r) => ({ ...r, match: score(r.title, wanted) }))
    .filter((r) => r.match >= 0.6)
    .sort((a, b) => embedFriendliness(b.title) - embedFriendliness(a.title))
    .slice(0, CANDIDATES_PER_SEED);

  if (!candidates.length) {
    console.warn(`${tag} ✗ ${wanted} — nothing matched the name`);
  } else {
    console.log(`${tag} ✓ ${wanted} — ${candidates.length} candidates`);
  }

  out.push({ ...seed, candidates: candidates.map((c) => c.id) });

  if (!cached) await sleep(PACE);
}

await writeFile(OUT, JSON.stringify(out, null, 2) + '\n');

const ids = new Set(out.flatMap((s) => s.candidates));
console.log(
  `\n${out.length} songs, ${ids.size} distinct videos to test → scripts/candidates.json`
);
