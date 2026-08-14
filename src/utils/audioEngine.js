let ctx = null;
let drone = null;

function getContext() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtx();
  }
  return ctx;
}

export function unlockAudio() {
  const context = getContext();
  if (context.state === 'suspended') context.resume();
  return context;
}

export function playTick() {
  if (!ctx || ctx.state === 'suspended') return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.025);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.03);
}

export function startDrone() {
  if (drone) return;
  const context = unlockAudio();

  const osc1 = context.createOscillator();
  const osc2 = context.createOscillator();
  osc1.type = 'sine';
  osc2.type = 'sine';
  osc1.frequency.value = 55;
  osc2.frequency.value = 55 * 1.5;

  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;

  const gain = context.createGain();
  gain.gain.value = 0;

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);

  osc1.start();
  osc2.start();
  gain.gain.linearRampToValueAtTime(0.05, context.currentTime + 1.2);

  drone = { osc1, osc2, gain };
}

export function setDroneMuted(muted) {
  if (!drone || !ctx) return;
  drone.gain.gain.linearRampToValueAtTime(muted ? 0 : 0.05, ctx.currentTime + 0.4);
}

export function stopDrone() {
  if (!drone || !ctx) return;
  const { osc1, osc2, gain } = drone;
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
  osc1.stop(ctx.currentTime + 0.7);
  osc2.stop(ctx.currentTime + 0.7);
  drone = null;
}
