import { useCallback, useEffect, useState } from 'react';

const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

function pickVoice(language) {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  return (
    voices.find((v) => v.lang === language && /female/i.test(v.name)) ||
    voices.find((v) => v.lang === language) ||
    voices.find((v) => v.lang.startsWith(language.split('-')[0])) ||
    voices[0]
  );
}

export function useSpeechSynthesis({ language = 'en-US', rate = 1, volume = 1 } = {}) {
  const [speakingId, setSpeakingId] = useState(null);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (text, id) => {
      if (!isSupported || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.volume = volume;

      const voice = pickVoice(language);
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setSpeakingId(id);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);

      window.speechSynthesis.speak(utterance);
    },
    [language, rate, volume]
  );

  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, []);

  return { isSupported, speakingId, speak, stop };
}
