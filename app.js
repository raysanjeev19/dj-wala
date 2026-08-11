/* ─────────────────────────────────────────────────────────────
   DJ Wala
   The sound comes from a 1×1px YouTube iframe parked off-screen;
   everything you can see is our own chrome.
   ───────────────────────────────────────────────────────────── */

const $ = (id) => document.getElementById(id);

const el = {
  player: $('player'),
  cover: $('cover'),
  title: $('title'),
  artist: $('artist'),
  seek: $('seek'),
  seekFill: $('seekFill'),
  seekKnob: $('seekKnob'),
  tCur: $('tCur'),
  tDur: $('tDur'),
  play: $('play'),
  prev: $('prev'),
  next: $('next'),
  shuffle: $('shuffle'),
  listBtn: $('listBtn'),
  list: $('list'),
  listItems: $('listItems'),
  rotations: $('rotations'),
  clock: $('clock'),
  listeners: $('listeners'),
  bumperText: $('bumperText'),
  bumperNext: $('bumperNext'),
  horn: $('horn'),
  install: $('install'),
};

const state = {
  tracks: [], // everything from tracks.json
  pool: [], // indices into tracks allowed by the current rotation
  order: [], // indices into tracks, in play order
  pos: 0, // index into order
  rotation: 'all',
  shuffle: true,
  ready: false,
  playing: false,
  started: false,
  scrubbing: false,
  // How many tracks in a row have failed to actually play. See skipFailed().
  failures: 0,
  // When the current track last started playing, to tell a real ending from
  // a video that gave up immediately.
  playedAt: 0,
};

let yt = null;

/* ── Listen elsewhere ────────────────────────────────────────
   Paste a playlist URL here and its button appears in the top bar. Leave
   it empty and the button is removed.

   Empty is the honest default. A button captioned "Open the playlist on
   Spotify" that lands on spotify.com is worse than no button: it reads
   as a broken link rather than a missing feature, and it costs the
   visitor a tap to find that out. */

const PLAYLISTS = {
  ytm: '', // e.g. https://music.youtube.com/playlist?list=…
  spotify: '', // e.g. https://open.spotify.com/playlist/…
};

function applyPlaylistLinks() {
  for (const [key, url] of Object.entries(PLAYLISTS)) {
    const a = $(`link-${key}`);
    if (!a) continue;
    if (url) a.href = url;
    else a.remove();
  }
}

// Run now rather than inside boot(): if tracks.json fails to load, the
// player is dead anyway, but a dead outbound link on top of that is a
// second broken thing on the same screen.
applyPlaylistLinks();

/* ── Rotations ───────────────────────────────────────────────
   Devanagari first, Latin under it — the same bilingual posture as the
   wordmark. `all` is not in tracks.json; it is the absence of a filter. */

const ROTATIONS = [
  { key: 'all', deva: 'सब' },
  { key: 'punjabi', deva: 'पंजाबी' },
  { key: 'bolly', deva: 'बॉलीवुड' },
  { key: 'baraat', deva: 'बारात' },
  { key: 'retro', deva: 'रेट्रो' },
  { key: 'after', deva: 'आफ्टर' },
];

/* ── Bumper lines ────────────────────────────────────────────
   What the booth shouts between songs. */

const BUMPERS = [
  'बजने दे भाई, अभी तो रात बाकी है',
  'वन मोर टाइम!',
  'डीजे वाले बाबू, मेरा गाना बजा दो',
  'नाच ले, कल की कल देखेंगे',
  'साउंड चेक — वन टू, वन टू',
  'फ्लोर खाली क्यों है?',
  'वॉल्यूम थोड़ा और ऊपर',
  'ये गाना तो लगना ही था',
  'बास ड्रॉप हो रहा है, संभल जा',
  'आज तो पूरी रात अपनी है',
  'दो मिनट रुक, अगला वाला सुन',
  'हाथ ऊपर!',
  'शादी हो या क्लब — यही बजेगा',
  'रिपीट पे डाल दे',
  'लाइट बंद, म्यूज़िक ऑन',
  'भाई साहब, ये तो एंथम है',
  'एक बार और बजा दे',
  'सुबह के चार बजे वाला गाना',
  'पैर अपने आप हिल रहे हैं',
  'डांस फ्लोर पे मिलते हैं',
];

/* ── Helpers ─────────────────────────────────────────────────── */

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** Fisher–Yates, in place. Every index equally likely in every position. */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** The set of tracks the current rotation allows, in playlist order. */
function buildPool() {
  return state.tracks
    .map((_, i) => i)
    .filter((i) => state.rotation === 'all' || state.tracks[i].rotation === state.rotation);
}

/** Fresh random order every load; shuffle off falls back to playlist order. */
function buildOrder() {
  const seq = [...state.pool];
  return state.shuffle ? shuffleArray(seq) : seq;
}

const currentTrack = () => state.tracks[state.order[state.pos]];

/* ── Scenes ──────────────────────────────────────────────────
   Two photographs of the booth, one visible at a time, swapped on every
   track change so the room moves with the music.

   They alternate rather than pick at random: with two images a coin toss
   repeats the same one half the time, and a backdrop that "changes" to
   what it already was reads as a bug. */

const scenes = [...document.querySelectorAll('.bg__scene')];
let sceneAt = 0;
let firstScene = true;

function nextScene() {
  if (scenes.length < 2) return;

  // The first track keeps the scene that is already showing — the one the
  // document preloads. Advancing on load would throw away that preload
  // and fade to an image the browser has not fetched yet.
  if (firstScene) {
    firstScene = false;
    return;
  }

  scenes[sceneAt].classList.remove('is-on');
  sceneAt = (sceneAt + 1) % scenes.length;
  scenes[sceneAt].classList.add('is-on');
}

/* ── Rendering ───────────────────────────────────────────────── */

let swapTimer = null;

function renderTrack() {
  const t = currentTrack();
  if (!t) return;

  // Fade the old title out, swap, fade back in — but not on first paint,
  // where there is nothing to fade from and it just reads as a flicker.
  if (el.title.dataset.rendered) {
    el.player.classList.add('is-swapping');
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => el.player.classList.remove('is-swapping'), 40);
  }
  el.title.dataset.rendered = '1';

  el.title.textContent = t.title;
  el.artist.textContent = t.artist || t.rawTitle || '';
  el.cover.src = t.cover || '';
  el.cover.alt = t.title ? `Cover art for ${t.title}` : '';

  // The strobe and the presence dot run off this. A missing bpm falls back
  // to 100, which is the middle of everything on this playlist anyway.
  document.documentElement.style.setProperty('--beat', `${60 / (t.bpm || 100)}s`);

  el.tDur.textContent = fmt(t.duration ?? 0);
  markCurrentInList();
  updateMediaSession();
}

function renderList() {
  el.listItems.replaceChildren(
    ...state.pool.map((trackIndex, n) => {
      const t = state.tracks[trackIndex];
      const li = document.createElement('li');
      li.dataset.track = String(trackIndex);

      const num = document.createElement('span');
      num.className = 'li__n';
      num.textContent = String(n + 1);

      const body = document.createElement('div');
      body.className = 'li__body';

      const title = document.createElement('p');
      title.className = 'li__title';
      title.textContent = t.title;

      const artist = document.createElement('p');
      artist.className = 'li__artist';
      artist.textContent = t.artist || '';

      body.append(title, artist);
      li.append(num, body);
      return li;
    })
  );
  markCurrentInList();
}

function markCurrentInList() {
  const active = state.order[state.pos];
  for (const li of el.listItems.children) {
    const isCurrent = Number(li.dataset.track) === active;
    if (isCurrent) li.setAttribute('aria-current', 'true');
    else li.removeAttribute('aria-current');
  }
}

function renderRotations() {
  el.rotations.replaceChildren(
    ...ROTATIONS.map((r) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pill';
      b.role = 'tab';
      b.dataset.rotation = r.key;
      b.textContent = r.deva;
      b.setAttribute('aria-selected', String(r.key === state.rotation));
      return b;
    })
  );
}

/* ── Progress ────────────────────────────────────────────────── */

function paintProgress(fraction) {
  const pct = clamp(fraction, 0, 1) * 100;
  el.seekFill.style.width = `${pct}%`;
  el.seekKnob.style.left = `${pct}%`;
  el.seek.setAttribute('aria-valuenow', String(Math.round(pct)));
}

function tick() {
  if (!yt?.getCurrentTime || state.scrubbing) return;
  const cur = yt.getCurrentTime() ?? 0;
  const dur = yt.getDuration?.() || currentTrack()?.duration || 0;
  el.tCur.textContent = fmt(cur);
  if (dur) {
    el.tDur.textContent = fmt(dur);
    paintProgress(cur / dur);
  }
}

setInterval(tick, 250);

/* ── Transport ───────────────────────────────────────────────── */

function load(pos, autoplay = true) {
  state.pos = ((pos % state.order.length) + state.order.length) % state.order.length;
  const t = currentTrack();
  if (!t || !yt) return;

  renderTrack();
  nextScene();
  paintProgress(0);
  el.tCur.textContent = '0:00';
  // Cleared here so the "did it end too fast?" check below times the new
  // track rather than inheriting the last one's clock.
  state.playedAt = 0;

  // cueVideoById loads without playing, which is what the very first track
  // needs: browsers block unmuted autoplay, and a page that looks like it
  // is playing but is silent is worse than one that plainly waits.
  if (autoplay) yt.loadVideoById(t.id);
  else yt.cueVideoById(t.id);
}

/** A track the listener chose to move past. Resets the failure run — the
 *  guard below is about broken videos, not about someone tapping next. */
function next() {
  state.failures = 0;
  load(state.pos + 1);
}

/* ── When a track will not play ──────────────────────────────
   Three separate things all look the same from here: the owner has
   switched off embedding (error 101/150), the video is gone (100), or it
   reports ENDED a fraction of a second after starting because it never
   really started.

   Skipping on to the next one is right. Skipping *unconditionally* is
   not: if several in a row are broken, the player races through the
   whole playlist in a couple of seconds and lands somewhere random with
   nothing playing. So the skips are counted, and after a few in a row we
   stop and say so instead of running away. */

const MAX_SKIPS = 4;

function skipFailed(why) {
  state.failures++;
  console.warn(`[dj-wala] ${why}, skipping:`, currentTrack()?.id, `(${state.failures})`);

  if (state.failures > MAX_SKIPS) {
    setPlaying(false);
    el.title.textContent = 'Yeh gaane nahi chal rahe';
    el.artist.textContent = 'Koi aur rotation chuno, ya page refresh karo';
    state.failures = 0;
    return;
  }

  // A beat of daylight, so a run of failures is visible as skipping rather
  // than as the title flickering.
  setTimeout(() => load(state.pos + 1), 900);
}

/** Below 4 seconds, "previous" means the previous track; after that it
 *  means the start of this one. Every physical player works this way and
 *  people expect it without being told. */
function prev() {
  if ((yt?.getCurrentTime?.() ?? 0) > 4) {
    yt.seekTo(0, true);
    return;
  }
  load(state.pos - 1);
}

function toggle() {
  if (!state.ready) return;
  if (state.playing) yt.pauseVideo();
  else yt.playVideo();
}

/** Rebuild the queue for a rotation, keeping the current track playing if
 *  it belongs to the new set — yanking the music out from under someone
 *  who tapped a filter is not what they asked for. */
function setRotation(key) {
  const playingIndex = state.order[state.pos];
  state.rotation = key;
  state.pool = buildPool();
  if (!state.pool.length) return; // nothing tagged this way yet

  state.order = buildOrder();
  renderRotations();
  renderList();

  const stillHere = state.order.indexOf(playingIndex);
  if (stillHere !== -1) {
    state.pos = stillHere;
    markCurrentInList();
  } else {
    load(0, state.started);
  }
}

/* ── Controls ────────────────────────────────────────────────── */

el.play.addEventListener('click', toggle);
el.next.addEventListener('click', next);
el.prev.addEventListener('click', prev);

el.shuffle.addEventListener('click', () => {
  state.shuffle = !state.shuffle;
  el.shuffle.classList.toggle('is-on', state.shuffle);
  el.shuffle.setAttribute('aria-pressed', String(state.shuffle));

  // Re-order everything but stay on the song that is playing, so toggling
  // shuffle never interrupts the sound.
  const playingIndex = state.order[state.pos];
  state.order = buildOrder();
  state.pos = Math.max(0, state.order.indexOf(playingIndex));
});

/** The playlist opens and closes from three places — the button, an
 *  outside tap and Escape. One function, or the body class drifts out of
 *  sync with the panel the first time someone uses the other two. */
function setListOpen(open) {
  el.list.classList.toggle('is-open', open);
  el.listBtn.setAttribute('aria-expanded', String(open));
  // The horn and the install chip float at the same height as the open
  // panel; they get out of its way rather than sit on top of it.
  document.body.classList.toggle('list-open', open);
}

el.listBtn.addEventListener('click', () => {
  setListOpen(!el.list.classList.contains('is-open'));
});

el.listItems.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const at = state.order.indexOf(Number(li.dataset.track));
  if (at !== -1) load(at);
});

el.rotations.addEventListener('click', (e) => {
  const pill = e.target.closest('.pill');
  if (pill) setRotation(pill.dataset.rotation);
});

// Close the playlist on an outside tap or Escape — a popover that can only
// be dismissed by the button that opened it is a trap on a phone.
document.addEventListener('pointerdown', (e) => {
  if (!el.list.classList.contains('is-open')) return;
  if (el.list.contains(e.target) || el.listBtn.contains(e.target)) return;
  setListOpen(false);
});

document.addEventListener('keydown', (e) => {
  // Never hijack a key someone is typing into a field.
  if (e.target.matches('input, textarea')) return;

  if (e.key === 'Escape' && el.list.classList.contains('is-open')) {
    setListOpen(false);
    el.listBtn.focus();
    return;
  }

  // The seek bar has its own arrow handling; don't fight it.
  if (document.activeElement === el.seek && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    return;
  }

  const keys = {
    ' ': toggle,
    k: toggle,
    ArrowRight: next,
    ArrowLeft: prev,
    n: next,
    p: prev,
    h: blastHorn,
  };
  const fn = keys[e.key];
  if (fn) {
    e.preventDefault();
    fn();
  }
});

/* ── Seek ────────────────────────────────────────────────────
   Pointer events, not mouse events, so a drag works the same with a
   finger, a mouse and a stylus. Capture means the drag keeps tracking
   even when the finger leaves the 22px strip. */

function seekFromEvent(e) {
  const r = el.seek.getBoundingClientRect();
  return clamp((e.clientX - r.left) / r.width, 0, 1);
}

function commitSeek(fraction) {
  const dur = yt?.getDuration?.() || currentTrack()?.duration || 0;
  if (!dur) return;
  yt.seekTo(dur * fraction, true);
  el.tCur.textContent = fmt(dur * fraction);
}

el.seek.addEventListener('pointerdown', (e) => {
  if (!state.ready) return;
  state.scrubbing = true;
  el.seek.classList.add('is-scrubbing');
  el.seek.setPointerCapture(e.pointerId);
  paintProgress(seekFromEvent(e));
});

el.seek.addEventListener('pointermove', (e) => {
  if (!state.scrubbing) return;
  paintProgress(seekFromEvent(e));
});

el.seek.addEventListener('pointerup', (e) => {
  if (!state.scrubbing) return;
  state.scrubbing = false;
  el.seek.classList.remove('is-scrubbing');
  commitSeek(seekFromEvent(e));
});

el.seek.addEventListener('keydown', (e) => {
  const step = { ArrowRight: 5, ArrowLeft: -5, ArrowUp: 5, ArrowDown: -5 }[e.key];
  if (!step || !state.ready) return;
  e.preventDefault();
  const dur = yt.getDuration?.() || 0;
  if (!dur) return;
  const to = clamp((yt.getCurrentTime() ?? 0) + step, 0, dur);
  yt.seekTo(to, true);
  paintProgress(to / dur);
});

/* ── Air horn ────────────────────────────────────────────────
   Two sources, one button. If assets/drop.mp3 is there it wins; if not,
   the siren below is synthesised on the spot — no asset to ship and no
   licence to clear. Either way it layers over the music, because neither
   one ever touches the iframe the song is playing in. */

let ac = null;

function audioCtx() {
  // Constructed on first use: an AudioContext made before a user gesture
  // starts suspended and every later sound is silently dropped.
  ac ??= new (window.AudioContext || window.webkitAudioContext)();
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

/** A gentle saturator. Without it the horn sounds like a synth pad; with
 *  it, it sounds like a speaker being pushed. */
function clipCurve(amount = 12) {
  const n = 1024;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
  }
  return curve;
}

/* ── The drop ────────────────────────────────────────────────
   If assets/drop.mp3 exists, the horn plays that instead of the
   synthesised siren — a station ident, a vocal drop, whatever you put
   there. It layers over the music for free: it is a plain <audio>
   element and the song is inside a YouTube iframe, so the two never
   touch each other's volume.

   Nothing breaks when the file is absent. The browser fires `error` on
   a 404, we note it, and the synth carries on as before — so the site
   ships without an audio asset and gains one the moment you drop it in.

   A note if you are putting a broadcaster's ident here: station idents
   and taglines are usually both copyrighted and trademarked. Fine on
   your own machine; your call on a public site. */

const DROP_SRC = '/assets/drop.mp3';
let drop = null;
let dropUsable = false;

(function loadDrop() {
  drop = new Audio(DROP_SRC);
  drop.preload = 'auto';
  drop.addEventListener('canplaythrough', () => {
    dropUsable = true;
  });
  drop.addEventListener('error', () => {
    dropUsable = false; // no file, or not decodable — the synth covers it
  });
})();

function playDrop() {
  // A fresh element per press, so a second press layers over the first
  // instead of cutting it off — which is what a rewind sounds like.
  const shot = drop.cloneNode();
  shot.volume = 0.9;
  shot.play().catch(() => {
    // Autoplay policy, or the file went away after it loaded. Fall back
    // rather than leave the button silent.
    dropUsable = false;
    synthHorn();
  });
}

let lastHorn = 0;
let hornTaps = [];

function blastHorn() {
  const now = performance.now();
  if (now - lastHorn < 800) return; // rate limit, or it turns into a drone
  lastHorn = now;

  el.horn.classList.add('is-blaring');
  setTimeout(() => el.horn.classList.remove('is-blaring'), 240);

  // Three taps inside two seconds is the classic rewind — take it back.
  hornTaps = hornTaps.filter((t) => now - t < 2000);
  hornTaps.push(now);
  if (hornTaps.length >= 3) {
    hornTaps = [];
    yt?.seekTo?.(0, true);
    if (!state.playing) yt?.playVideo?.();
  }

  if (dropUsable) playDrop();
  else synthHorn();
}

/** The fallback siren: a fast pitch swoop up into a held, slightly
 *  wavering note, through something that clips. Three detuned saws give
 *  it the beating you hear on a real horn; one saw is a test tone. */
function synthHorn() {
  const ctx = audioCtx();
  const t0 = ctx.currentTime;
  const DUR = 1.1;

  const shaper = ctx.createWaveShaper();
  shaper.curve = clipCurve(14);

  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 3200;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.28, t0 + 0.05);
  gain.gain.setValueAtTime(0.28, t0 + DUR - 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + DUR);

  // The waver on the held note.
  const vib = ctx.createOscillator();
  const vibDepth = ctx.createGain();
  vib.frequency.value = 5.5;
  vibDepth.gain.value = 7;
  vib.connect(vibDepth);

  for (const detune of [-9, 0, 11]) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(300, t0);
    osc.frequency.exponentialRampToValueAtTime(880, t0 + 0.09);
    osc.frequency.setValueAtTime(880, t0 + 0.09);
    vibDepth.connect(osc.frequency);
    osc.connect(shaper);
    osc.start(t0);
    osc.stop(t0 + DUR + 0.02);
  }

  shaper.connect(tone).connect(gain).connect(ctx.destination);
  vib.start(t0);
  vib.stop(t0 + DUR + 0.02);
}

el.horn.addEventListener('click', blastHorn);

/* ── Bumper line ─────────────────────────────────────────────── */

let bumperAt = Math.floor(Math.random() * BUMPERS.length);

function nextBumper() {
  bumperAt = (bumperAt + 1) % BUMPERS.length;
  el.bumperText.textContent = BUMPERS[bumperAt];
}

el.bumperText.textContent = BUMPERS[bumperAt];
el.bumperNext.addEventListener('click', nextBumper);

/* ── Clock ───────────────────────────────────────────────────
   Aligned to the top of the minute rather than ticking every 60s from
   load, or it drifts a few seconds off the phone's own clock. */

function paintClock() {
  el.clock.textContent = new Date()
    .toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
    .toLowerCase();
}

(function startClock() {
  paintClock();
  setTimeout(() => {
    paintClock();
    setInterval(paintClock, 60_000);
  }, (60 - new Date().getSeconds()) * 1000);
})();

/* ── Presence ────────────────────────────────────────────────
   Honest note: this is mood lighting, not telemetry. It is a random walk
   whose band is set by the hour — a club is empty at 4pm and full at
   midnight, and a counter that ignores that reads as fake immediately.

   If we ever want a real number, one heartbeat endpoint replaces this
   function and nothing else in the file has to change. */

(function presence() {
  const hour = new Date().getHours();
  const busy =
    hour >= 22 || hour < 3
      ? [280, 780] // peak
      : hour >= 19
        ? [140, 380] // warming up
        : hour >= 12
          ? [40, 160] // afternoon
          : [20, 90]; // small hours into morning

  const [MIN, MAX] = busy;
  let count = MIN + Math.floor(Math.random() * (MAX - MIN));
  el.listeners.textContent = String(count);

  const step = () => {
    const mid = (MIN + MAX) / 2;
    // Pull gently back toward the middle so it wanders without escaping.
    const up = Math.random() < (count < mid ? 0.58 : 0.42);
    count = clamp(count + (up ? 1 : -1) * (1 + Math.floor(Math.random() * 4)), MIN, MAX);
    el.listeners.textContent = String(count);
    setTimeout(step, 2500 + Math.random() * 3500);
  };

  setTimeout(step, 2000);
})();

/* ── Lockscreen / car controls ───────────────────────────────── */

function updateMediaSession() {
  if (!('mediaSession' in navigator)) return;
  const t = currentTrack();
  if (!t) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: t.title,
    artist: t.artist || 'DJ Wala',
    album: t.album || 'DJ Wala',
    artwork: [{ src: t.cover, sizes: '400x400', type: 'image/jpeg' }],
  });
}

if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => yt?.playVideo());
  navigator.mediaSession.setActionHandler('pause', () => yt?.pauseVideo());
  navigator.mediaSession.setActionHandler('nexttrack', next);
  navigator.mediaSession.setActionHandler('previoustrack', prev);
}

/* ── YouTube iframe boot ─────────────────────────────────────── */

/* Nothing is ever shown — the iframe is a 1×1 box parked off-screen — so ask
   YouTube for the smallest rendition it has and stop paying for pixels
   nobody sees. The embed has no audio-only mode; this plus the 1×1 size is
   as close as it gets. YouTube may override the hint, hence the try. */
function preferAudio() {
  try {
    yt?.setPlaybackQuality?.('tiny');
  } catch {
    /* the API ignores the hint on some videos */
  }
}

function setPlaying(on) {
  state.playing = on;
  document.body.classList.toggle('is-playing', on);
  el.play.setAttribute('aria-label', on ? 'Pause' : 'Play');
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = on ? 'playing' : 'paused';
  }
}

window.onYouTubeIframeAPIReady = () => {
  yt = new YT.Player('yt-player', {
    height: '1',
    width: '1',
    playerVars: {
      playsinline: 1, // iOS: never take over the screen
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      origin: location.origin,
    },
    events: {
      onReady: () => {
        state.ready = true;
        el.play.disabled = false;
        preferAudio();
        load(0, false); // cued, not playing — see load()
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.PLAYING) {
          state.started = true;
          state.playedAt = performance.now();
          // It really is playing, so whatever came before it is forgiven.
          state.failures = 0;
          setPlaying(true);
          preferAudio();
        } else if (e.data === YT.PlayerState.PAUSED) {
          setPlaying(false);
        } else if (e.data === YT.PlayerState.ENDED) {
          // A song that "ends" three seconds after it started did not end,
          // it failed — YouTube reports both the same way. Advancing on
          // that without question is what makes the playlist bolt.
          const played = (performance.now() - state.playedAt) / 1000;
          if (state.playedAt && played < 5) skipFailed(`ended after ${played.toFixed(1)}s`);
          else next();
        }
      },
      onError: (e) => {
        // 101 and 150 are "the owner does not allow embedding", 100 is
        // "gone", 5 is a player fault. All of them sound identical from
        // here: silence. Move on, but count it — see skipFailed().
        skipFailed(`player error ${e.data}`);
      },
    },
  });
};

/* ── Start ───────────────────────────────────────────────────── */

async function boot() {
  try {
    const res = await fetch('/tracks.json');
    state.tracks = await res.json();
  } catch (err) {
    el.title.textContent = 'Could not load the playlist';
    el.artist.textContent = 'Refresh?';
    console.error('[dj-wala]', err);
    return;
  }

  state.pool = buildPool();
  state.order = buildOrder();
  renderRotations();
  renderList();
  renderTrack();

  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.append(tag);
}

boot();

/* ── PWA ─────────────────────────────────────────────────────── */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline shell is a bonus, never a requirement */
    });
  });
}

let installPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
  el.install.hidden = false;
});

el.install.addEventListener('click', async () => {
  if (!installPrompt) return;
  el.install.hidden = true;
  installPrompt.prompt();
  installPrompt = null;
});

window.addEventListener('appinstalled', () => {
  el.install.hidden = true;
  installPrompt = null;
});
