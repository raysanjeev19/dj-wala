# DJ Wala — handover

**For whoever picks this up next, human or model.** Read this first, then
[`README.md`](README.md) for how the code works and
[`docs/PRD.md`](docs/PRD.md) for why it is the way it is.

Last updated: 12 Aug 2026.

---

## What it is

An always-on web radio for the songs that fill an Indian dance floor. One page,
no build step, no framework, no backend. A hidden YouTube iframe does the
audio; everything visible is hand-written chrome over three photographs of a
club.

It is the third in a family — [hornokplease.xyz](https://hornokplease.xyz)
(Truck Wala) and [deluxesalon.in](https://deluxesalon.in) (Deluxe Saloon) came
first — and deliberately shares their design rules: the artwork carries the
colour, the chrome stays neutral glass, and one motion vocabulary is used
everywhere.

## Where everything lives

| | |
|---|---|
| Live | https://dj-wala.vercel.app |
| Repo | https://github.com/raysanjeev19/dj-wala |
| Hosting | Vercel, project `dj-wala`, account `raysanjeev19`, scope `sanjeev-rays-projects` |
| Deploys | Automatic. `git push origin main` ships it. No build command. |
| Local | `python3 -m http.server 4173` — the ingest tooling needs this running |

`scripts/`, `source/` and `docs/` are excluded from the deploy by
`.vercelignore`; they are dev-only and 404 in production, which is intended.

## State

Working and verified:

- **92 tracks**, every one confirmed to play — punjabi 14, bolly 23, baraat 17,
  retro 21, after 13, mix 4
- Three club photographs, cross-faded on each track change, each with its own
  crop focus for portrait
- Player bar modelled on Deluxe Saloon's capsule; two rows below 26rem
- Rotation filter, playlist panel, shuffle
- Air horn → plays 18–24s of a YouTube clip over the music, via a second player
- Beat: strobe on the downbeat, magenta bass swell at half speed, both on bpm
- PWA installable, service worker caches the shell only
- SEO: canonical/OG/JSON-LD on the live URL, 1200×630 OG image, sr-only
  description and track list for crawlers, sitemap, robots

---

## What is still open

### 1. Playlist links — blocked on the owner

Both "listen elsewhere" buttons are **removed from the UI**, deliberately. They
used to point at each service's home page under a caption promising a playlist,
which reads as a broken link rather than an unfinished feature.

To bring them back, fill in `PLAYLISTS` at the top of `app.js`:

```js
const PLAYLISTS = {
  ytm: '',      // https://music.youtube.com/playlist?list=…
  spotify: '',  // https://open.spotify.com/playlist/…
};
```

A filled URL makes its button appear; an empty one removes it. Nothing else to
change.

**Status:** the owner was given two one-click links
(`docs/playlist-links.txt`) that build the set on YouTube — open, press Save.
No playlist URL has come back yet. The Spotify identifiers supplied so far
(`72749164`, `7278449164`) are not Spotify links and 404; what is needed is
app → playlist → Share → Copy link.

**Do not try to create these playlists programmatically.** It needs the owner's
OAuth — a Google Cloud project and a consent screen — for a job that is two
clicks by hand. This was considered and rejected.

### 2. Domain

Live on `dj-wala.vercel.app`. A `.vercel.app` subdomain is weak for search, and
ranking for "DJ Wala" is an explicit goal, so a real domain is the single
highest-value remaining task.

**`djwala.xyz` is taken and answers 200 — it belongs to someone else.** An
earlier version of `index.html` had `canonical`, `og:url` and the JSON-LD all
pointing at it, which told Google the real version of this page lived on their
site. That is fixed; do not reintroduce it.

After buying a domain: add it in Vercel, then update the URLs in `index.html`,
`sitemap.xml` and `robots.txt` — see the Deploy checklist in the README.

### 3. Google Search Console

Not set up. Nothing will rank until the site is submitted and the sitemap
registered. Do this after the domain, not before.

### 4. Optional

- `assets/drop.mp3` — drop a file there and the horn prefers it over the
  YouTube clip. See `app.js § Air horn`.
- The listener count is **not real** — a random walk banded by hour of day.
  It is mood lighting and says so in the code. Replacing it with a real
  heartbeat touches one function.

---

## Things that will waste your time if you do not know them

These were each found the expensive way.

### Embedding is the whole game

**The big Indian labels switch off embedding on their official uploads.** The
video loads in the iframe, then refuses to play — YouTube error 150. Of 1156
candidates verified, **842 were blocked this way.**

Nothing over plain HTTP will tell you this. oEmbed happily returns a title for
a blocked video. The first version of this site shipped 67 tracks of which
**only 21 made a sound**, and every check upstream had passed.

The only authority is a real player, which is what `scripts/check-embeds.mjs`
drives. That is why the ingest is three steps and not one, and why
`find-candidates.mjs` keeps **eight** candidates per song instead of trusting
the top result. Going from 1 to 8 candidates is what took the set from 21 to 92.

### Playable is not the same as being the song

Three impostors cue cleanly, report no error, and are not the track:

- **Teasers.** Labels post 20-second and 7-second promos on the same channels.
  Two shipped: "Nachde Ne Saare" was 20s, "Aankh Marey" was 7s.
- **Jukeboxes.** Hour-long "non-stop mix" uploads match a song by name because
  the song is somewhere inside. One shipped at 40 minutes.
- **Films.** Searching a Bollywood song by its film name ranks *YouTube Movies'
  listing for the film* above the song. Three tracks pointed at two-hour paid
  movies, and iTunes then matched the film's store entry too, giving a
  183-minute "song".

Hence the length bounds in `build-tracks.mjs` (90s–12min for songs,
10min–3hr for the `mix` rotation) and the title-match filter in
`find-candidates.mjs`.

### A channel's upload title is not a song name

`𝐊𝐚𝐥𝐚 𝐂𝐡𝐚𝐬𝐡𝐦𝐚 🕶️ | Baar Baar Dekho | …`, `: Dus Bahane 2.0`,
`SUMMER HIGH - AP DHILLON`. No regex fixes this, because it is marketing copy
that happens to contain the name. **Every seed carries a hand-written `name`.**

### The horn needs its own player

One YouTube player holds one video, and the song has to keep running
underneath, so the drop is a **second** hidden player. YouTube has no
"play until", so the stop is a timer that errs long on purpose — a drop cut
mid-word sounds broken, a beat of extra air does not.

### Do not `pgrep -f` your own script name

`until ! pgrep -f find-candidates.mjs; do sleep 5; done` matches its **own**
shell command line, so it waits on itself forever. This deadlocked the pipeline
once. Use `run_in_background` and wait for the completion event instead.

### macOS headless Chrome clamps windows

`--window-size=390,844` lays out at ~500px, so a phone screenshot is a crop of
a layout no phone will ever see. `scripts/shot.mjs` overrides device metrics
over the DevTools Protocol to get a true phone width. There is also a real
overflow report in its output — a too-wide page looks like a crop, not a bug.

### An animation beats a normal declaration

The wordmark sat half its own width right of centre for days. `.logo` had a
centring `translateX(-50%)`, and the `rise` entrance keyframes end on
`transform: none` with `fill-mode: both` — which wins. The fix is the
`.logo-slot` wrapper: the slot centres, the h1 animates.

---

## Rebuilding the playlist

Full detail in the README. Short version, with the site served locally:

```sh
node scripts/find-candidates.mjs     # ~10 min for a full set, cached after
node scripts/check-embeds.mjs        # ~5 min, needs a browser
node scripts/build-tracks.mjs        # ~1 min

node scripts/check-embeds.mjs --shipped   # verify what actually shipped
```

Songs are edited in `scripts/seeds.mjs`. `build-tracks.mjs` also rewrites the
crawlable track list inside `index.html`, so that can never drift from what
plays.

**Re-run the verify step every few months.** Videos get pulled, region-locked,
or have embedding switched off after the fact, and all three sound identical
from the player: silence.

## Owner's stated constraints

- The set must stay **above 60 tracks**.
- Wants high-tempo remix and DJ-mix material, 90s Hindi leaning.
- Communicates in Hinglish; replies in kind are expected.
