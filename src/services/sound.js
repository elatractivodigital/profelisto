let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq, startOffset, duration, type = 'sine', gainValue = 0.14) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);
  gain.gain.setValueAtTime(0.001, ctx.currentTime + startOffset);
  gain.gain.exponentialRampToValueAtTime(gainValue, ctx.currentTime + startOffset + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startOffset);
  osc.stop(ctx.currentTime + startOffset + duration + 0.02);
}

export function playCorrectSound(enabled = true) {
  if (!enabled) return;
  playTone(587.33, 0, 0.11, 'triangle', 0.16); // D5
  playTone(880.0, 0.09, 0.22, 'triangle', 0.18); // A5
}

export function playWrongSound(enabled = true) {
  if (!enabled) return;
  playTone(240, 0, 0.14, 'sawtooth', 0.1);
  playTone(185, 0.11, 0.24, 'sawtooth', 0.12);
}

export function playHintSound(enabled = true) {
  if (!enabled) return;
  playTone(523.25, 0, 0.09, 'sine', 0.12);
  playTone(659.25, 0.07, 0.09, 'sine', 0.12);
  playTone(783.99, 0.14, 0.18, 'sine', 0.14);
}

export function playVictorySound(enabled = true) {
  if (!enabled) return;
  playTone(523.25, 0, 0.11, 'triangle', 0.16);
  playTone(659.25, 0.1, 0.11, 'triangle', 0.16);
  playTone(783.99, 0.2, 0.11, 'triangle', 0.16);
  playTone(1046.5, 0.31, 0.34, 'triangle', 0.2);
}

export function playBossPenaltySound(enabled = true) {
  if (!enabled) return;
  playTone(311.13, 0, 0.18, 'sawtooth', 0.12);
  playTone(277.18, 0.17, 0.18, 'sawtooth', 0.12);
  playTone(246.94, 0.34, 0.18, 'sawtooth', 0.12);
  playTone(196.0, 0.52, 0.42, 'sawtooth', 0.14);
}

export function speakCaseText(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 1.02;
  utterance.pitch = 1.03;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
