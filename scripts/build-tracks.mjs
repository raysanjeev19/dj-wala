#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   DJ Wala — assemble tracks.json

   Step three of three. Takes the candidates found in step one and the
   verdicts recorded in step two, picks the first video per song that a
   real player agreed to cue, and dresses it with artist, album, duration
   and a square cover from the iTunes Search API.

     node scripts/find-candidates.mjs    # 1. search → candidates.json
     node scripts/check-embeds.mjs       # 2. verify → embed-verdicts.json
     node scripts/build-tracks.mjs       # 3. assemble → tracks.json

   The split exists because the two hard parts fail in different ways and
   are slow for different reasons: search is rate-limited by YouTube and
   cached on disk, while verification needs a browser and cannot be
   faked. Keeping them apart means a change to the song list does not
   re-verify eight hundred videos, and a re-verify does not re-search.

   Order matters inside a song's candidate list: find-candidates floats
   the uploads most likely to allow embedding to the front, so the first
   survivor is usually also the best-sounding one.
   ───────────────────────────────────────────────────────────── */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'tracks.json');

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const NOISE =
  /\b(official|video|audio|song|full|hd|4k|lyrical|lyrics|music|new|latest|movie|film|title|feat|ft)\b/gi;

/** The search query already names the song and the artist, which is a far
 *  better iTunes term than anything derived from a YouTube title — it is
 *  what a person would have typed. Strip the words aimed at YouTube. */
const itunesTerm = (seed) =>
  (seed.itunes ?? seed.q).replace(NOISE, ' ').replace(/\s{2,}/g, ' ').trim();

/** iTunes gives a square cover, a real artist, an album and an exact
 *  duration — four things YouTube will not tell us for free. */
async function itunes(term) {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        term
      )}&media=music&entity=song&country=IN&limit=1`,
      { headers: { 'User-Agent': UA } }
    );
    if (!res.ok) return null;

    const r = (await res.json()).results?.[0];
    if (!r) return null;

    // A "song" over fifteen minutes is not a song. Searching a Bollywood
    // number by its film name can match the film's own store entry, and
    // then every field — artist, album, cover, a 183-minute duration —
    // belongs to the movie. Better no metadata than confidently wrong
    // metadata.
    const secs = Math.round((r.trackTimeMillis ?? 0) / 1000);
    if (secs > 900) return null;

    return {
      artist: r.artistName,
      album: r.collectionName,
      duration: secs || null,
      cover: r.artworkUrl100?.replace('100x100bb', '400x400bb') ?? null,
    };
  } catch {
    return null; // iTunes is a nicety, not a dependency
  }
}

/* ── Run ──────────────────────────────────────────────────────── */

const seeds = JSON.parse(await readFile(join(ROOT, 'scripts', 'candidates.json'), 'utf8'));
const verdicts = JSON.parse(await readFile(join(ROOT, 'scripts', 'embed-verdicts.json'), 'utf8'));

const tracks = [];
const stranded = [];

for (const [i, seed] of seeds.entries()) {
  const tag = `[${String(i + 1).padStart(3, '0')}/${seeds.length}]`;

  // Playable is not the same as being the song, and the length gives both
  // impostors away.
  //
  // Too short: labels post 20-second teasers and 7-second promos on the
  // same channels as the real upload. They cue cleanly and report no
  // error — the shipped playlist had two of them.
  //
  // Too long: search also returns jukeboxes, full albums and hour-long
  // "non-stop party mix" uploads, which match the song name because the
  // song is somewhere inside them. One of those got in at forty minutes.
  const MIN_SECONDS = 90;
  const MAX_SECONDS = 12 * 60;

  const isSong = (c) => {
    const d = verdicts[c]?.duration ?? 0;
    return verdicts[c]?.ok && d >= MIN_SECONDS && d <= MAX_SECONDS;
  };

  const id = seed.candidates.find(isSong);

  if (!id) {
    // Say which wall it hit: nothing embeddable at all is a different
    // problem from everything embeddable being the wrong length.
    const playable = seed.candidates.filter((c) => verdicts[c]?.ok);
    stranded.push(seed);
    console.warn(
      playable.length
        ? `${tag} ✗ ${seed.name} — ${playable.length} playable, none a song-length upload`
        : `${tag} ✗ ${seed.name} — no candidate is embeddable`
    );
    continue;
  }

  const it = await itunes(itunesTerm(seed));

  tracks.push({
    id,
    // The hand-written name wins over everything. See seeds.mjs.
    title: seed.name,
    // …and a hand-written artist wins over iTunes, for the handful of
    // remixes and covers whose original is what iTunes actually indexes.
    artist: seed.artist ?? it?.artist ?? '',
    album: it?.album ?? '',
    duration: it?.duration ?? null,
    // The 16:9 YouTube thumbnail is the fallback; the disc crops it to a
    // circle either way, it just loses the edges of a wide frame.
    cover: it?.cover ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    rotation: seed.rotation,
    bpm: seed.bpm,
  });

  console.log(`${tag} ✓ ${seed.name} — ${tracks.at(-1).artist || '(no artist)'}`);
  await sleep(200); // polite to iTunes
}

await writeFile(OUT, JSON.stringify(tracks, null, 2) + '\n');

/* ── Keep the crawlable copy in step ──────────────────────────
   The page a crawler is served has a wordmark and almost no words —
   everything a visitor reads is drawn from tracks.json by JavaScript.
   index.html carries an sr-only track list so there is something real to
   index; it is written here so it can never drift from what actually
   plays. Both the list and the JSON-LD count come from this same run. */

const escape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const listHtml =
  '      <ol>\n' +
  tracks
    .map((t) => `        <li>${escape(t.title)}${t.artist ? ` — ${escape(t.artist)}` : ''}</li>`)
    .join('\n') +
  '\n      </ol>';

const INDEX = join(ROOT, 'index.html');
let html = await readFile(INDEX, 'utf8');

const START = '<!-- seo:tracks:start -->';
const END = '<!-- seo:tracks:end -->';

if (html.includes(START) && html.includes(END)) {
  html =
    html.slice(0, html.indexOf(START) + START.length) +
    '\n' +
    listHtml +
    '\n      ' +
    html.slice(html.indexOf(END));

  // numTracks in the MusicPlaylist block, so the structured data agrees
  // with the page.
  html = html.replace(
    /("@type": "MusicPlaylist",)/,
    `$1\n            "numTracks": ${tracks.length},`
  );
  html = html.replace(/"numTracks": \d+,\n\s*"numTracks": \d+,/, `"numTracks": ${tracks.length},`);

  await writeFile(INDEX, html);
  console.log(`index.html: crawlable list updated (${tracks.length} tracks)`);
} else {
  console.warn('index.html: seo:tracks markers missing — crawlable list not updated');
}

const byRotation = {};
for (const t of tracks) byRotation[t.rotation] = (byRotation[t.rotation] ?? 0) + 1;

console.log(`\n${tracks.length} playable tracks written to tracks.json`);
console.log(byRotation);

if (stranded.length) {
  console.log(`\n${stranded.length} songs had no embeddable upload and were dropped:`);
  for (const s of stranded) console.log(`  [${s.rotation}] ${s.name}`);
}

const noCover = tracks.filter((t) => t.cover.includes('ytimg')).length;
const noDuration = tracks.filter((t) => !t.duration).length;
if (noCover || noDuration) {
  console.log(`\n${noCover} on a YouTube thumbnail, ${noDuration} without a duration.`);
}
