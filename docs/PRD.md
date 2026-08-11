# डीजे वाला — DJ Wala

**Product Requirements Document**
Version 1.0 · 11 Aug 2026 · Owner: Sanjay Ray

---

## 1. Summary

**DJ Wala** is a single-page, always-on web radio for the songs that actually play in
Indian pubs, clubs, bars and wedding floors. You open it, it starts, you don't touch
anything else. No login, no library, no skip-fatigue — just the floor.

It is the third site in the same family:

| Site | Subject | Feel |
|---|---|---|
| hornokplease.xyz | Truck Wala — 90s highway bangers | Trucker art, teal, dusty |
| deluxesalon.in | Deluxe Saloon — 90s Hindi film songs | Barbershop, warm sand, ambient |
| **djwala (this)** | **DJ Wala — club / pub / baraat floor fillers** | **Neon, smoke, night** |

Same DNA: one illustrated scene, neutral glass chrome floating on top, a hidden
YouTube iframe doing the actual audio, a live "who else is here" counter, and one
piece of playful desi interaction.

### One-line pitch
> Bina cover charge ke club. Press play.

---

## 2. Goals & non-goals

### Goals
- **G1** — Sound within 2 seconds of the first tap, on a mid-range Android on 4G.
- **G2** — It should feel like a *place*, not a player. The artwork does the work.
- **G3** — Zero-friction share: one URL, great link preview, works on WhatsApp.
- **G4** — Legally clean: we host nothing, we stream from YouTube, we credit and
  we have a takedown path.
- **G5** — Family resemblance. Someone who has seen Truck Wala should recognise
  this as the same hand.

### Non-goals (v1)
- No accounts, no auth, no user playlists, no likes.
- No audio hosting, no downloads, no MP3s. Ever.
- No real-time chat, no requests queue.
- No native app (a PWA install is the ceiling).
- No admin CMS. The track list is a JSON file in the repo.

---

## 3. Audience

| Segment | Why they open it | What they need |
|---|---|---|
| 18–30 house-party host | Needs a floor going, no aux-cord politics | Autoplay, shuffle, no ads |
| Bar / café owner | Ambient floor music, screen in a corner | Runs for hours untouched, no interruptions |
| Nostalgia scroller | Saw the link on Instagram | Loads fast, looks incredible, shareable |
| Wedding DJ / baraat | Needs a reference set | Rotations by mood (baraat, retro, Punjabi) |

Primary device: **mobile, portrait, one hand, thumb in the bottom third.** Design
mobile-first; desktop is the secondary case.

---

## 4. The music

### 4.1 Content thesis
Not "top EDM". This is the **Indian club canon** — the tracks that fill a floor in
Delhi, Chandigarh, Bombay, Bangalore, and at every sangeet in between.

### 4.2 Rotations (playlist categories)
Mirrors Deluxe Saloon's rotations idea. v1 ships **5 rotations, ~12–15 tracks each,
≈60–70 tracks total.**

| Rotation | Devanagari | Contents |
|---|---|---|
| Punjabi Pop | पंजाबी | Diljit, AP Dhillon, Honey Singh, Badshah, Karan Aujla |
| Bollywood Floor | बॉलीवुड फ्लोर | Remix-era Bolly bangers — the ones the DJ never skips |
| Baraat Mode | बारात | Dhol-forward, brass, wedding-procession fillers |
| Retro Night | रेट्रो | 90s/2000s club classics — the throwback set |
| After Hours | आफ्टर आवर्स | Slower, deeper, EDM/house, 2am on the terrace |

Default on load: **shuffle across all rotations**, so a first-time visitor gets range.
Selecting a rotation reshuffles within it only.

### 4.3 Source of truth
`tracks.json` at the repo root, same schema as Truck Wala:

```json
{
  "id": "YouTube video ID",
  "title": "Clean display title",
  "artist": "Artist",
  "album": "Album / film",
  "duration": 213,
  "cover": "https://…/400x400bb.jpg",
  "rotation": "punjabi",
  "bpm": 100,
  "rawTitle": "Original YouTube title (kept for search + fallback)"
}
```

Two fields are new versus Truck Wala: `rotation` (for the category filter) and
`bpm` (drives the visual pulse — see §6.6).

### 4.4 Ingest pipeline
`scripts/build-tracks.mjs`, run manually, never at request time:

1. Read a source YouTube playlist ID (or a hand-written list of video IDs).
2. Pull title + duration per video.
3. Clean the title (strip `(Official Video)`, `| Full HD`, `4K`, channel spam).
4. Look the cleaned title up on the **iTunes Search API** (free, no key) for a
   proper artist, album and a 400×400 cover — this is exactly how Truck Wala gets
   its `mzstatic.com` cover art.
5. Hand-tag `rotation` and `bpm`.
6. Write `tracks.json`. Commit it. The site reads a static file; no runtime API calls.

**Fallback:** if iTunes has no match, use the YouTube thumbnail
(`i.ytimg.com/vi/<id>/hqdefault.jpg`) and leave `artist` blank — the UI already
handles an empty artist line.

### 4.5 Playback source — decision
**YouTube IFrame Player API**, a 1×1 iframe parked off-screen, quality hint `tiny`.

Why not Spotify as the player:
- The Spotify Embed/iFrame API gives no real transport control, forces Spotify's
  own chrome, and plays **30-second previews for non-Premium listeners** — which is
  most visitors. It cannot carry a custom player like this one.
- YouTube is where these songs actually live in India, and it needs no login.

**Spotify still ships** — as an *outbound link* in the topbar, alongside YouTube
Music, exactly like Deluxe Saloon does. Best of both: custom player on YouTube,
"take it with you" on Spotify.

---

## 5. Information architecture

Single page. No routes in v1.

```
┌─ backdrop (fixed, full-bleed illustration + vignette + grain + strobe) ─┐
│                                                                        │
│  topbar    [ 01:24 am ]   [ ● 214 on the floor ]   [ YTM ] [ Spotify ] │
│                                                                        │
│  airhorn ◀ (left rail, floating)                                       │
│                                                                        │
│                          डीजे                                          │
│                          वाला                                          │
│                                                                        │
│                                                        (dock, bottom)  │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  [ rotation pills: सब · पंजाबी · बॉलीवुड · बारात · रेट्रो · आफ्टर ] │   │
│   │  playlist popover (toggled)                                     │   │
│   │  "बजने दे भाई, अभी तो रात बाकी है"                    ⟳         │   │
│   │  ( disc )  Title                                                │   │
│   │            Artist                                               │   │
│   │            ────────●──────────────    1:42 / 3:33               │   │
│   │            ⤨   ⏮   ▶   ⏭   ☰                                   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

The hidden YouTube iframe sits outside all of this, 1×1, `aria-hidden`.

---

## 6. Feature specification

### 6.1 Backdrop
- One illustrated scene: a desi club floor — DJ behind a console, speaker stacks,
  laser fans through smoke, crowd in silhouette, a beer-and-neon glow. Warm neon,
  not a cold Western nightclub.
- Two `srcSet` renditions: `backdrop.jpg` (≥768px) and `backdrop-mobile.jpg`.
  Same pattern as Deluxe Saloon.
- Layers on top: `vignette` (radial darken to edges) + `grain` (tiled noise PNG at
  low opacity) — this is what stops a flat illustration looking like a stock photo.
- **Strobe layer:** a very low-opacity radial wash that pulses on the current
  track's BPM. Peak opacity ~0.06. This must be subtle enough to run for an hour
  without being tiring, and must be **disabled entirely** under
  `prefers-reduced-motion`.
- Preload the mobile rendition with `<link rel="preload" as="image">` — it is the LCP.

### 6.2 Topbar
Single CSS grid row so the three items share one centre line (Truck Wala's comment
on this is correct and we repeat the approach).
- **Clock** — local time, `hh:mm a`, mono font, updates each minute. On a club site
  the late hour is part of the mood; do not hide it.
- **Presence** — a live dot + count + label `on the floor`.
- **Links** — YouTube Music and Spotify icon buttons, `target="_blank"`,
  `rel="noopener noreferrer"`, with `aria-label` and `title`.

**Presence, honestly:** Truck Wala's counter is a seeded random walk (MIN…800,
±1–4 every 2.5–6s), not real. For DJ Wala we do the same **but scale it by hour of
day** — 40–120 at 3pm, 300–800 after 10pm. It is mood lighting, not telemetry. If we
ever want a real number, the upgrade path is a single Cloudflare Durable Object
heartbeat; out of scope for v1, and the UI does not change when we swap it.

### 6.3 Wordmark
`डीजे` / `वाला` stacked, Yatra One, painted onto the scene rather than boxed. An
`.sr-only` Latin `DJ Wala` sits alongside for crawlers and screen readers.
Positioned by three CSS variables (`--logo-x`, `--logo-top`, `--logo-size`) so it can
be nudged to fit the artwork without touching layout code.

### 6.4 Air horn (the signature interaction)
Truck Wala has the horn. Deluxe Saloon has the barber's chair. DJ Wala gets the
**pull-up air horn** — the single most recognisable sound in club culture.

- A floating left-rail button: siren icon + `बजा दे!` / `Pull up!`
- Tap → sounds the horn over the music. **Synthesised with the Web Audio API,
  not an MP3**: three detuned sawtooth oscillators swooping 300→880Hz into a
  held, wavering note, through a saturator and a lowpass. No asset to ship, no
  licence to clear, and it layers over the music because it never touches the
  iframe.
- Rate-limited: max 1 per 800ms, and the button does a quick scale/glow on press.
- Three taps inside two seconds triggers the rewind — the track restarts from
  0:00. Classic DJ move.

### 6.5 Bumper line
A rotating one-liner above the player, in Devanagari, `aria-live="polite"`, with a
↻ button to draw another. Truck Wala uses trucker shayari; ours uses DJ-booth and
floor lines. ~20 lines shipped. Examples:

- बजने दे भाई, अभी तो रात बाकी है
- वन मोर टाइम!
- डीजे वाले बाबू, मेरा गाना बजा दो
- नाच ले, कल की कल देखेंगे
- साउंड चेक, वन टू... वन टू

### 6.6 Player
- **Disc** — a vinyl record, not a cassette (that's Truck Wala's). Cover art inside
  a grooved ring, a hub in the centre. Spins while playing, eases to a stop on
  pause. Spin rate is fixed (33⅓ feel), *not* BPM-linked — a record does not speed
  up with the song.
- **Meta** — title, artist. Cross-fade on track change (fade out 40ms, swap, fade in),
  never a hard snap.
- **Seek** — custom slider, `role="slider"` with `aria-valuemin/max/now`, keyboard
  arrows, pointer drag with a `scrubbing` state so the playhead doesn't fight the
  drag.
- **Controls** — shuffle (on by default), prev, play/pause, next, playlist toggle.
  44×44px minimum hit targets.
- **Playlist popover** — scrollable `<ol>`, current track marked, tap to jump,
  closes on outside tap and on Escape.
- **Rotation pills** — horizontal scroll row above the playlist. Selecting one
  rebuilds the play order from that rotation only; `सब` (All) restores everything.
- **Media Session API** — set `navigator.mediaSession.metadata` (title, artist,
  artwork) and wire `play`/`pause`/`nexttrack`/`previoustrack` handlers, so the
  lockscreen and Bluetooth car controls work. Truck Wala does not do this; it is a
  large, cheap win for a site people will run in the background.

### 6.7 Autoplay reality
Browsers block unmuted autoplay. So:
- On load, boot the iframe, load the first track **cued, not playing**, and render
  the title so the UI is never empty.
- The play button is the first tap. It is the largest control in the dock.
- If autoplay is somehow permitted (returning visitor, PWA), start immediately.
- Never start muted-then-unmute. That reads as broken.

### 6.8 PWA
From Deluxe Saloon: `manifest.webmanifest`, maskable icons, `display: standalone`,
`theme_color`, and a dismissible install button that only appears once
`beforeinstallprompt` fires. Service worker caches the shell (HTML/CSS/JS/backdrop)
only — never the audio, which is YouTube's.

### 6.9 Rights & takedown
A quiet footer line, same posture as Deluxe Saloon: all audio streams from YouTube,
we host nothing, all rights with the owners, and a contact email for removal
requests.

---

## 7. Design system

### 7.1 Principle (inherited)
> The artwork carries all the colour. Everything the app draws on top is neutral
> glass, so it sits on any background image. — `hornokplease/styles.css`

We keep this exactly. The neon is *in the illustration*. The chrome stays glass.
This is why these sites can share code and still look like different places.

### 7.2 Tokens

```css
:root {
  /* Ground */
  --ink:        #08060F;   /* body bg behind the artwork; also theme-color */
  --shade:      #140E1F;   /* deep surface, matches deluxe's shade in role */

  /* Type */
  --sand:       #F2E7DA;   /* primary text — same family as deluxe's sand */
  --sand-dim:   rgba(242, 231, 218, 0.62);

  /* Accents — used sparingly, in chrome only */
  --neon:       #FF2E93;   /* laser magenta — active states, the presence dot */
  --strobe:     #22E1FF;   /* cyan — focus rings, seek fill */
  --brass:      #FFB627;   /* warm amber — ties back to Truck Wala / Deluxe */

  /* Glass (identical to Truck Wala) */
  --glass:       rgba(255, 255, 255, 0.10);
  --glass-line:  rgba(255, 255, 255, 0.20);
  --shadow-glass: 0 8px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.25);
  --text-shadow:  0 1px 6px rgba(0,0,0,.55);

  /* Motion — one vocabulary, copied verbatim from Truck Wala */
  --swift:  140ms cubic-bezier(.4,0,.2,1);   /* pointer feedback */
  --glide:  320ms cubic-bezier(.4,0,.2,1);   /* anything that travels */
  --settle: 620ms cubic-bezier(.16,1,.3,1);  /* entrances */
}
```

`theme-color` = `#08060F` (Truck Wala `#0a4a50`, Deluxe `#2b1a12` — ours is the
night one).

### 7.3 Type

| Role | Face | Why |
|---|---|---|
| Wordmark | **Yatra One** | Truck Wala's display face. Instant family recognition. |
| Body / Devanagari | **Baloo 2** (600/700/800) | Truck Wala's body face; real Devanagari coverage. |
| Clock, counter, timecode | **JetBrains Mono** (400/500) | Deluxe Saloon's mono. Tabular figures stop the clock jittering. |
| Small UI chrome | system UI stack | Baloo is too shouty at 13px — Truck Wala's own note, and it's right. |

Devanagari fallbacks before the webfont lands: `"Kohinoor Devanagari", "Nirmala UI",
"Noto Sans Devanagari"`.

### 7.4 Motion rules
- Entrance: topbar, wordmark and dock `rise` into place, staggered ~0.28s apart.
- Every transition uses one of the three curves above. Nothing gets an ad-hoc easing.
- `@media (prefers-reduced-motion: reduce)` kills the strobe, the disc spin and all
  entrance animations. The site must be fully usable and calm with motion off.

---

## 8. Technology

### 8.1 Recommendation: **vanilla HTML + CSS + JavaScript. No framework, no build step.**

| | Vanilla (recommended) | React + Vite + Tailwind |
|---|---|---|
| Precedent | hornokplease.xyz | deluxesalon.in |
| First paint | ~15KB JS, instant | ~120KB+ JS before anything moves |
| Fits the product? | One screen, one player, one state object — yes | Router + component tree for a page with no routes |
| Build step | None. Edit, refresh. | Node toolchain, dep upgrades, lockfile |

This site is **one screen**. The entire app state is `{tracks, order, pos, shuffle,
playing, scrubbing}` — Truck Wala proves that fits in ~600 readable lines of plain
JS with no state library. React would add a toolchain to solve a problem we don't
have. Vanilla also means the page is debuggable from View Source in three years.

**Language:** JavaScript (ES2022 modules), not TypeScript — no build step is the
whole point. JSDoc type comments on the non-obvious functions instead.

### 8.2 Stack

| Layer | Choice |
|---|---|
| Markup | Hand-written HTML, one `index.html` |
| Styles | Plain CSS, custom properties, no preprocessor |
| Script | ES modules, no bundler, no dependencies |
| Audio | YouTube IFrame Player API (1×1 hidden iframe) |
| Data | Static `tracks.json` |
| Tooling | One Node script for ingest (`scripts/build-tracks.mjs`) |
| Host | Vercel (both sibling sites are there), static output |
| Analytics | GA4 (`gtag.js`, async) + Vercel Web Analytics — cookieless, deferred |
| SEO | JSON-LD `WebSite` + `MusicPlaylist`, OG + Twitter card, canonical |

### 8.3 File layout

```
dj-wala/
├── index.html
├── styles.css
├── app.js
├── tracks.json
├── manifest.webmanifest
├── sw.js
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── backdrop.jpg          # ≥768px
│   ├── backdrop-mobile.jpg
│   ├── grain.png
│   ├── airhorn.mp3
│   ├── favicon.svg
│   ├── icon-192.png / icon-512.png / icon-maskable.png
│   ├── apple-touch-icon.png
│   └── opengraph.jpg         # 1200×630
├── scripts/
│   └── build-tracks.mjs
├── docs/
│   └── PRD.md                # this file
└── README.md
```

### 8.4 Performance budget
- LCP (backdrop) **< 2.0s** on 4G / mid-tier Android.
- Total JS shipped **< 20KB** uncompressed, excluding YouTube's own iframe.
- CSS **< 30KB**.
- Backdrop **< 220KB** mobile, **< 450KB** desktop (both progressive JPEG).
- No layout shift after first paint — CLS **0**.

### 8.5 Accessibility
- All controls are real `<button>`s with `aria-label`s.
- Seek bar is a proper `role="slider"`, keyboard-operable.
- Visible focus ring in `--strobe` on every interactive element.
- Live regions on the bumper line and the presence count.
- Text contrast ≥ 4.5:1 against the artwork *at its brightest point* — this is why
  the vignette and text-shadow exist; verify against the real image, not a swatch.
- `<noscript>` explains that the player needs JS.

---

## 9. Content checklist

- [ ] Backdrop illustration (desktop + mobile crop)
- [ ] OG image, 1200×630
- [ ] Favicon SVG + PWA icon set
- [ ] Air horn sample, licence-clear
- [ ] ~65 tracks with YouTube IDs, tagged by rotation
- [ ] ~20 bumper lines in Devanagari
- [ ] Rights/takedown copy + contact email
- [ ] Domain (candidates: `djwala.xyz`, `bajadedj.xyz`, `djwale.club`)

---

## 10. Milestones

| # | Milestone | Contents | Exit criteria |
|---|---|---|---|
| **M0** | Skeleton | Repo, `index.html`, tokens in `styles.css`, placeholder backdrop | Page loads, tokens render |
| **M1** | Sound | YouTube iframe boot, play/pause/next/prev, shuffle, seek, `tracks.json` with 10 seed tracks | Music plays end-to-end, track advances on its own |
| **M2** | Skin | Real backdrop, wordmark, glass dock, disc, entrance animation, fonts | Visually finished on mobile + desktop |
| **M3** | Character | Air horn, bumper lines, clock, presence counter, rotation pills, playlist popover | All the personality is in |
| **M4** | Full set | Ingest script run, ~65 tracks tagged, covers resolved | Real library, no placeholders |
| **M5** | Ship | PWA + service worker, Media Session, SEO/JSON-LD/OG, analytics, a11y pass, Lighthouse | Lighthouse ≥ 95 across the board, deployed |

---

## 11. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| YouTube pulls a video (takedown, region lock) | Track silently fails | `onError` → auto-skip to next after 1.5s, and log the ID; periodic re-validation in the ingest script |
| YouTube ads before some videos | Breaks the ambient feel | Prefer official-audio / topic-channel uploads, which carry fewer interruptions; note that this cannot be fully solved |
| Autoplay blocked | Silent page | Handled in §6.7 — first tap is the play button, UI is never empty |
| iOS backgrounding pauses the iframe | Music stops when screen locks | Media Session + a page-visibility resume attempt; document the limitation honestly rather than faking it |
| Strobe/motion discomfort | Accessibility harm | Low opacity ceiling, `prefers-reduced-motion` kills it entirely |
| Illustration cost/time | Blocks M2 | M0–M1 run on a placeholder gradient; the artwork slots in without code changes |

---

## 12. Decisions

| # | Question | Decision |
|---|---|---|
| D1 | Spotify: player or link-out? | **Link-out.** Embed can't carry a custom player and shows 30s previews to non-Premium users. YouTube plays, Spotify links. |
| D2 | Stack | **Vanilla JS**, per §8.1 — confirmed |
| D3 | Track list source | **Curated from scratch** against the rotations in §4.2. 67 tracks shipped. |
| D4 | Backdrop art | **CSS placeholder first**, illustration slots in later without code changes |
| D5 | Domain | Open. Candidates in §9. |
| D6 | Playlist URLs | **Open.** The topbar's YouTube Music and Spotify buttons point at each service's home page until the real playlist URLs land. |

### What the build actually taught us

Two things worth writing down, because both were invisible until the data
existed:

1. **Never take the first YouTube search result.** Searching a Bollywood song by
   its film name ranks *YouTube Movies' listing for the film* above the song.
   Three tracks silently resolved to two-hour paid movies, and iTunes then
   matched the film's store entry too — giving a 183-minute "song". The ingest
   now walks the ranked results and takes the first whose **title contains the
   song's name**, and rejects any iTunes match over 15 minutes.
2. **Derived titles are not song names.** A channel's upload title is marketing
   copy that happens to contain the song name: `𝐊𝐚𝐥𝐚 𝐂𝐡𝐚𝐬𝐡𝐦𝐚 🕶️ | Baar Baar
   Dekho | …`, `: Dus Bahane 2.0`, `SUMMER HIGH - AP DHILLON`. No regex fixes
   that. Every seed now carries a hand-written display name.

## 12a. Status — 11 Aug 2026

| Milestone | State |
|---|---|
| M0 Skeleton | ✅ |
| M1 Sound | ✅ player boots, transport works, YouTube API confirmed live |
| M2 Skin | ✅ on the CSS placeholder backdrop; real illustration outstanding |
| M3 Character | ✅ horn, bumpers, clock, presence, rotations, playlist |
| M4 Full set | ✅ 67 tracks, all embeddable, all with real covers and durations |
| M5 Ship | ◻︎ needs: OG image, playlist URLs, domain, deploy, Lighthouse pass |

---

## 13. Definition of done

1. Opens on a cold mobile connection, first tap plays sound within 2s.
2. Runs for 60 minutes untouched without stalling, drifting or leaking memory.
3. Lighthouse ≥ 95 Performance / Accessibility / Best Practices / SEO.
4. A WhatsApp share shows the OG card correctly.
5. Fully operable by keyboard, and calm with `prefers-reduced-motion` on.
6. Sits next to hornokplease.xyz and deluxesalon.in and reads as the same studio.
