// Optional sound, off until the visitor turns it on. Synthesised live with
// the Web Audio API (no audio files): a filtered whoosh with a low thump
// for each page cut, like the cuts in the reels.

const KEY = "sfx_on";
let ctx: AudioContext | null = null;
const listeners = new Set<(on: boolean) => void>();

export function soundOn(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setSound(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    /* noop */
  }
  if (on) audio(); // created inside the click, so the browser allows it
  listeners.forEach((l) => l(on));
}

export function onSoundChange(l: (on: boolean) => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** The page-cut whoosh. Silent unless sound is on. */
export function playCut() {
  if (!soundOn()) return;
  const a = audio();
  if (!a) return;
  const t = a.currentTime;

  // Whoosh: white noise through a band-pass sweeping up then away.
  const len = Math.floor(a.sampleRate * 0.42);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
  const noise = a.createBufferSource();
  noise.buffer = buf;
  const bp = a.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(380, t);
  bp.frequency.exponentialRampToValueAtTime(3200, t + 0.22);
  bp.frequency.exponentialRampToValueAtTime(900, t + 0.42);
  const ng = a.createGain();
  ng.gain.setValueAtTime(0.0001, t);
  ng.gain.exponentialRampToValueAtTime(0.16, t + 0.12);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
  noise.connect(bp).connect(ng).connect(a.destination);
  noise.start(t);
  noise.stop(t + 0.43);

  // Thump: a short falling sine as the band lands.
  const osc = a.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, t + 0.18);
  osc.frequency.exponentialRampToValueAtTime(48, t + 0.38);
  const og = a.createGain();
  og.gain.setValueAtTime(0.0001, t + 0.18);
  og.gain.exponentialRampToValueAtTime(0.32, t + 0.2);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
  osc.connect(og).connect(a.destination);
  osc.start(t + 0.18);
  osc.stop(t + 0.44);
}
