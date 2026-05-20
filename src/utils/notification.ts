let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playNote(freq: number, startTime: number, duration: number) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0.3, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playMessageSound() {
  const ctx = getAudioContext();
  playNote(523, ctx.currentTime, 0.15);
  playNote(659, ctx.currentTime + 0.06, 0.3);
}

export function unlockAudio() {
  getAudioContext();
}

export function showNotification(title: string, body: string) {
  if (Notification.permission === 'default') {
    Notification.requestPermission();
    return;
  }
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/pwa-192.png' });
  }
}