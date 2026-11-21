let audio: AudioContext | undefined;

export function unlockTurnSound() {
  if (!window.AudioContext) return;
  try {
    audio ??= new AudioContext();
    if (audio.state === 'suspended') void audio.resume().catch(() => undefined);
  } catch { /* Playback can continue without sound. */ }
}

export function playTurnSound() {
  if (!audio || audio.state !== 'running') return;
  const time = audio.currentTime;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(280, time);
  oscillator.frequency.exponentialRampToValueAtTime(92, time + 0.045);
  gain.gain.setValueAtTime(0.09, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.055);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(time);
  oscillator.stop(time + 0.06);
}
