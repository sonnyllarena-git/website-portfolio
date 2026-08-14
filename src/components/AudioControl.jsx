import { useSound } from '../context/SoundContext';

export default function AudioControl() {
  const { muted, toggleMuted, unlocked } = useSound();
  const isMuted = muted || !unlocked;

  return (
    <button
      type="button"
      onClick={toggleMuted}
      disabled={!unlocked}
      aria-label={isMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
      className="flex items-center gap-2 border border-white/10 bg-black/60 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-white/70 disabled:opacity-40 disabled:cursor-not-allowed hover:border-white/30 transition-colors"
    >
      <span className={`audio-meter ${isMuted ? 'muted' : ''}`} aria-hidden="true">
        <span className="audio-meter-bar" />
        <span className="audio-meter-bar" />
        <span className="audio-meter-bar" />
        <span className="audio-meter-bar" />
        <span className="audio-meter-bar" />
      </span>
      <span>{isMuted ? 'Sound off' : 'Ambient'}</span>
    </button>
  );
}
