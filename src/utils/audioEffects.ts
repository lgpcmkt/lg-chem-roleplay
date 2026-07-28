const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null;

const sounds = {
  fail: typeof Audio !== 'undefined' ? new Audio('https://cdn.freesound.org/previews/171/171673_2437358-lq.mp3') : null,
  click: typeof Audio !== 'undefined' ? new Audio('https://actions.google.com/sounds/v1/ui/button_click.ogg') : null,
};

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  if (!AudioCtx) return;
  try {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export const soundEffects = {
  playFail: () => {
    sounds.fail?.play().catch(e => console.log('Audio play failed:', e));
  },
  playKnock: () => {
    if (!AudioCtx) return;
    try {
      const ctx = new AudioCtx();
      const playThump = (timeOffset: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, ctx.currentTime + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + timeOffset + 0.1);
        gain.gain.setValueAtTime(2.0, ctx.currentTime + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + 0.1);
      };
      playThump(0);
      playThump(0.15);
      playThump(0.3);
    } catch {}
  },
  playClick: () => {
    if (sounds.click) {
      sounds.click.currentTime = 0;
      sounds.click.play().catch(e => console.log('Audio play failed:', e));
    }
  },
  playDoorOpen: () => playTone(440, 0.3, 'sine', 0.1),
  playPing: () => playTone(880, 0.15, 'sine', 0.1),
  playDoctorAlert: () => {
    playTone(523, 0.1, 'sine', 0.12);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 120);
  },
};
