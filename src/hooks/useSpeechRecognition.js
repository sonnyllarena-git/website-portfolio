import { useCallback, useEffect, useRef, useState } from 'react';

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const SILENCE_TIMEOUT_MS = 2500;
const MAX_RECORDING_MS = 60000;
const CONFIDENCE_THRESHOLD = 0.5;

export const RECOGNITION_ERROR_MESSAGES = {
  'no-speech': 'No speech detected. Please try again.',
  network: 'Network error. Please check your connection.',
  'not-allowed': 'Microphone permission denied.',
  'permission-denied': 'Microphone permission denied.',
  'audio-capture': 'No microphone detected.',
};

export function useSpeechRecognition({ language = 'en-US', onFinalResult, onError } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const maxTimerRef = useRef(null);
  const onFinalResultRef = useRef(onFinalResult);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
  }, [onFinalResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const isSupported = Boolean(SpeechRecognitionAPI);

  const clearTimers = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    clearTimeout(maxTimerRef.current);
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // stop() on an already-inactive recognizer throws in some browsers — safe to ignore
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || isListening) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      clearTimeout(silenceTimerRef.current);

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          const confidence = result[0].confidence;
          const passesConfidence = !confidence || confidence >= CONFIDENCE_THRESHOLD;
          if (passesConfidence) onFinalResultRef.current?.(transcript);
        } else {
          interim += transcript;
        }
      }

      setInterimText(interim);
      silenceTimerRef.current = setTimeout(stopListening, SILENCE_TIMEOUT_MS);
    };

    recognition.onerror = (event) => {
      onErrorRef.current?.(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
      clearTimers();
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();

    silenceTimerRef.current = setTimeout(stopListening, SILENCE_TIMEOUT_MS);
    maxTimerRef.current = setTimeout(stopListening, MAX_RECORDING_MS);
  }, [isSupported, isListening, language, clearTimers, stopListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      clearTimers();
      stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isSupported, isListening, interimText, toggleListening, stopListening };
}
