import { FiMic } from 'react-icons/fi';

const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
];

export default function VoiceSettingsPanel({
  prefs,
  onChange,
  recognitionSupported,
  synthesisSupported,
  onTestMicrophone,
  isTestingMic,
  isListening,
  micTestResult,
}) {
  const anySupported = recognitionSupported || synthesisSupported;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
      <h3 className="text-sm font-bold">Voice Settings</h3>

      {!anySupported && (
        <p className="text-xs text-amber-500 leading-relaxed">
          Voice features aren&apos;t supported on this browser. Please use Chrome, Firefox, Safari, or Edge for voice input/output.
        </p>
      )}

      <label className="flex items-center justify-between text-sm">
        <span>Enable Voice Input</span>
        <input
          type="checkbox"
          checked={prefs.voiceInputEnabled}
          disabled={!recognitionSupported}
          onChange={(e) => onChange({ voiceInputEnabled: e.target.checked })}
          className="accent-accent w-4 h-4 disabled:opacity-40"
        />
      </label>

      <label className="flex items-center justify-between text-sm">
        <span>Enable Voice Output</span>
        <input
          type="checkbox"
          checked={prefs.voiceOutputEnabled}
          disabled={!synthesisSupported}
          onChange={(e) => onChange({ voiceOutputEnabled: e.target.checked })}
          className="accent-accent w-4 h-4 disabled:opacity-40"
        />
      </label>

      <label className="block text-sm space-y-1.5">
        <span>Language</span>
        <select
          value={prefs.language}
          onChange={(e) => onChange({ language: e.target.value })}
          className="form-input-focus w-full text-sm px-3 py-2 rounded-lg bg-black/5 dark:bg-white/10 outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm space-y-1.5">
        <span>Voice Speed: {prefs.rate.toFixed(1)}x</span>
        <input
          type="range"
          min="0.8"
          max="1.5"
          step="0.1"
          value={prefs.rate}
          onChange={(e) => onChange({ rate: parseFloat(e.target.value) })}
          className="w-full accent-accent"
        />
      </label>

      <label className="block text-sm space-y-1.5">
        <span>Volume: {Math.round(prefs.volume * 100)}%</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={prefs.volume}
          onChange={(e) => onChange({ volume: parseFloat(e.target.value) })}
          className="w-full accent-accent"
        />
      </label>

      <div className="space-y-1.5">
        <button
          type="button"
          onClick={onTestMicrophone}
          disabled={!recognitionSupported}
          className="btn-hover w-full flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full bg-accent text-white disabled:opacity-40 disabled:hover:scale-100"
        >
          <FiMic size={14} className={isTestingMic && isListening ? 'animate-pulse' : ''} />
          {isTestingMic && isListening ? 'Listening...' : 'Test Microphone'}
        </button>
        {micTestResult && (
          <p className="text-xs text-center text-black/60 dark:text-white/60">
            Heard: &quot;{micTestResult}&quot;
          </p>
        )}
      </div>
    </div>
  );
}
