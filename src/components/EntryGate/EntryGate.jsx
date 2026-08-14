import { useEffect, useState } from 'react';
import { useSound } from '../../context/SoundContext';
import { isGateUnlocked, markGateUnlocked } from '../../utils/sessionGate';

export default function EntryGate() {
  const { unlock } = useSound();
  const [visible, setVisible] = useState(() => !isGateUnlocked());

  useEffect(() => {
    if (!visible) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  if (!visible) return null;

  const handleStart = () => {
    unlock();
    markGateUnlocked();
    setVisible(false);
  };

  return (
    <div className="entry-gate">
      <span
        className="entry-gate-crosshair"
        style={{ top: '8%', left: '50%', transform: 'translate(-50%, -50%)' }}
      />
      <span
        className="entry-gate-crosshair"
        style={{ top: '50%', left: '6%', transform: 'translate(-50%, -50%)' }}
      />
      <span
        className="entry-gate-crosshair"
        style={{ top: '50%', right: '6%', transform: 'translate(50%, -50%)' }}
      />
      <span
        className="entry-gate-crosshair"
        style={{ bottom: '8%', left: '50%', transform: 'translate(-50%, 50%)' }}
      />

      <span className="entry-gate-orbit" style={{ width: 320, height: 320 }} />
      <span className="entry-gate-orbit" style={{ width: 560, height: 560 }} />
      <span className="entry-gate-orbit" style={{ width: 900, height: 900 }} />

      <div className="relative z-10 flex flex-col items-center gap-5 text-center px-6">
        <div className="entry-gate-dots" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
        <h1 className="text-lg md:text-xl tracking-[0.3em] uppercase text-white">Enter in silence</h1>
        <p className="text-xs md:text-sm text-white/50 tracking-wide">(Turn the sound on — it matters)</p>
        <button type="button" className="entry-gate-start" onClick={handleStart}>
          Start
        </button>
      </div>
    </div>
  );
}
