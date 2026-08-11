# डीजे वाला — DJ Wala

Bina cover charge ke club. An always-on web radio for the songs that fill an
Indian dance floor — Punjabi pop, Bollywood remixes, baraat dhol, retro club
and after-hours.

Third in the family alongside [hornokplease.xyz](https://hornokplease.xyz)
(Truck Wala) and [deluxesalon.in](https://deluxesalon.in) (Deluxe Saloon), and
built on the same idea: one illustrated scene, neutral glass chrome floating on
top, and a hidden YouTube iframe doing the actual audio.

**Picking this up cold? Start with [`HANDOVER.md`](HANDOVER.md)** — current
state, what is still open, and the mistakes that cost the most time. Full spec
in [`docs/PRD.md`](docs/PRD.md).

---

## Run it

No build step, no dependencies. Any static server will do:

```sh
python3 -m http.server 4173     # → http://127.0.0.1:4173
```

Node 18+ is only needed for the ingest script.

## Files

```
index.html      one page, hand-written
styles.css      design tokens + everything else
app.js          player, playlist, horn, presence — no framework
tracks.json     the set; generated, committed
sw.js           caches the shell, never the audio
scripts/
  seeds.mjs           the song list, by hand
  find-candidates.mjs 1. search   → candidates.json
  check-embeds.mjs    2. verify   → embed-verdicts.json
  build-tracks.mjs    3. assemble → tracks.json
  embed-test.html     the page check-embeds drives
  shot.mjs            screenshot at a true phone width
docs/PRD.md     what this is and why
docs/playlist-links.txt  one-click links to build the set on YouTube
```

## Rebuilding the playlist

Songs live in `scripts/seeds.mjs`. Each entry carries the display name, a
YouTube search query, a rotation and a bpm:

```js
{ name: 'Kala Chashma', q: 'Kala Chashma Baar Baar Dekho full video song',
  rotation: 'bolly', bpm: 105 },
```

Then, with the site being served locally (the verifier drives a browser against
it):

```sh
python3 -m http.server 4173          # in another shell

node scripts/find-candidates.mjs     # 1. search  → scripts/candidates.json
node scripts/check-embeds.mjs        # 2. verify  → scripts/embed-verdicts.json
node scripts/build-tracks.mjs        # 3. assemble → tracks.json
```

### Why it is three steps and not one

**The thing that breaks a playlist here is not findable over HTTP.** The big
Indian labels switch off embedding on their official uploads, so the video
loads in our iframe and then refuses to play — YouTube error 150. oEmbed
answers happily for those videos, which is exactly why an earlier
single-pass version of this shipped 67 tracks of which **only 21 made a
sound.** Nothing short of a real player will tell you.

So:

1. **`find-candidates.mjs`** searches YouTube once per song and keeps up to
   eight results whose *title actually contains the song's name* — taking the
   top result blindly lands you on YouTube Movies' listing for the film, which
   is a two-hour paid movie, not a song. It floats "- Topic" and audio uploads
   to the front, because those are auto-generated from the label's distribution
   feed and are usually embeddable where the music video is not. It chooses
   nothing; it only shortlists.

2. **`check-embeds.mjs`** launches headless Chrome over `embed-test.html`,
   which cues every candidate through the real IFrame API in eight parallel
   players and records the verdict. Headless is enough: those error codes come
   from a permission check, not from decoding audio.

3. **`build-tracks.mjs`** takes the first surviving candidate per song that is
   also **between 90 seconds and 12 minutes**, and adds artist, album, duration
   and a square cover from the iTunes Search API. The length bound matters:
   playable is not the same as being the song. Labels post 20-second teasers on
   the same channels as the real upload, and search returns hour-long "non-stop
   mix" jukeboxes that match by name. Two teasers and one 40-minute mix shipped
   before this check existed — all of them cued cleanly and reported no error.

Splitting them matters because the two slow parts are slow for different
reasons. Search is rate-limited by YouTube and cached on disk
(`scripts/.search-cache.json`); verification needs a browser and about three
minutes. Editing the song list does not re-verify eight hundred videos, and
re-verifying does not re-search.

Run `node scripts/check-embeds.mjs --shipped` to point the same harness at
`tracks.json` instead of the candidate pool — that checks what listeners
actually get, and names any song that has stopped working.

**Re-run step 2 every few months.** Videos get pulled, region-locked, or have
embedding switched off after the fact, and all three sound identical from the
player: silence.

### Fields you can override by hand

| Field | When to use it |
|---|---|
| `name` | Always. It is what the site displays. |
| `artist` | When iTunes matches the original instead of the remix (Kaanta Laga, Ringa Ringa). |
| `id` | To pin a specific video when no query phrasing finds it. |
| `itunes` | To search iTunes with something other than the YouTube query. |

## Things worth knowing before you change something

- **The playlist is 61 YouTube video IDs, and that is the whole library.** We
  host no audio and never will.
- **The listener count is not real.** It is a random walk whose band is set by
  the hour — mood lighting, not telemetry. `app.js § Presence` says so in the
  code. Swapping in a real heartbeat touches that one function and nothing else.
- **The backdrop is three photographs**, cross-faded on every track change
  (`app.js § Scenes`). All three are in the DOM from the start; only opacity
  moves, so a swap can never show a half-downloaded frame. Each carries its own
  `--focus`, because a portrait phone crops a 3:2 frame hard and the DJ is
  centre-right in two of them and hard left in the third — one shared value
  beheads him in one. The layers stacked over them (bass, strobe, vignette,
  scrim, grain) are what let a photograph carry an interface; keep them.
- **The air horn is synthesised**, not an MP3 — three detuned saw oscillators
  through a saturator, in `app.js § Air horn`. No asset, no licence. Three taps
  inside two seconds rewinds the track.
- **The horn has three sources, in order.** `DROP_CLIP` in `app.js` plays a
  marked span of a YouTube video (currently 18–24s of a viral remix) through a
  *second* hidden player — one player holds one video, and the song has to keep
  running underneath. Failing that, `assets/drop.mp3` if you put a file there.
  Failing that, the synth. Each falls through when it cannot play, so the
  button is never silent. YouTube has no "play until", so the stop is a timer;
  it errs long, because cutting a drop mid-word sounds broken and a beat of
  extra air does not.
  If you are thinking of a radio station's ident here: those are usually both
  copyrighted and trademarked. Fine locally; your call on a public site.
- **The beat is two layers, not one.** A hard white strobe hit on the downbeat
  (`steps(1, end)`, because a fade reads as a lamp dimming and a cut reads as a
  strobe) and a magenta bass swell at half speed, since the kick lands on every
  other beat and a swell on every one is just flicker. Both run off the track's
  bpm and both are switched off entirely under `prefers-reduced-motion` — a
  strobing club is exactly what that setting exists for.
- **The disc spin is deliberately not bpm-linked.** A record does not turn
  faster because the song is quicker. The bpm drives the strobe and the presence
  dot only.
- **Failed tracks are skipped, but only four in a row.** Three different things
  look identical from the player — the owner switched off embedding (error
  101/150), the video is gone (100), or it reports ENDED half a second after
  starting because it never really started. Skipping past one is right;
  skipping unconditionally means a run of broken videos races through the whole
  playlist in seconds and lands somewhere random with nothing playing. So
  `app.js § When a track will not play` counts them and stops with a message
  after `MAX_SKIPS`. An ENDED under five seconds counts as a failure, not an
  ending.
- **The player bar is one row on purpose.** It follows Deluxe Saloon's capsule:
  sleeve, then the song, then prev/play/next. That is why the timecode sits
  beside the seek rail rather than under it, and why shuffle lives in the
  playlist panel — a fifth button in the bar is what breaks the single row on a
  narrow phone.

## Keyboard

| Key | |
|---|---|
| `Space` / `K` | play / pause |
| `←` `→` | previous / next track |
| `H` | air horn |
| `←` `→` on the seek bar | scrub ±5s |
| `Esc` | close the playlist |

## Deploy

Static output, no build command. On Vercel: import the repo, framework preset
"Other", leave build and output settings empty.

Before going live:

1. Point the `og:url`, `canonical` and JSON-LD URLs in `index.html` at the real
   domain, and bump `?v=` on the OG image. Getting this wrong is expensive:
   they pointed at djwala.xyz, which someone else owns and which answers 200,
   so the page was telling Google its real version lived on their site.
2. Regenerate `assets/opengraph.jpg` if the look changed:
   `node scripts/shot.mjs 1200 630 assets/og.png --playing`, then convert.
3. Put the real playlist URLs in `PLAYLISTS` at the top of `app.js`. Each
   button appears only when its URL is filled in, and is removed otherwise —
   a button captioned "Open the playlist on Spotify" that lands on
   spotify.com reads as broken, not as unfinished. `docs/playlist-links.txt`
   has one-click links that build the set on YouTube.
4. Bump `CACHE` in `sw.js`. A stale shell serving a fresh `tracks.json` is the
   one bug that file can cause, and a new cache name is the fix.

## Rights

Every track streams from YouTube. We host nothing and claim nothing; all rights
stay with their owners. Takedown requests go to the address in the page footer.
