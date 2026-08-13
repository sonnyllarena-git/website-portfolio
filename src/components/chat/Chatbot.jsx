import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePageNav } from '../../context/PageContext';
import {
  NAME_PROMPT,
  getEmailPrompt,
  SUGGESTED_QUESTIONS,
} from '../../utils/chatKnowledgeBase';
import { getBotReply } from '../../utils/chatBot';
import { getAutoReply, getFollowUp } from '../../utils/chatAdaptive';
import { getTimeBasedGreeting, getTimeOfDay } from '../../utils/timeBasedGreetings';
import {
  saveChatHistory,
  saveUnansweredQuestions,
  sendChatTranscript,
} from '../../utils/chatService';
import { loadVoicePrefs, saveVoicePrefs } from '../../utils/voicePrefs';
import { stripMarkdown } from '../../utils/textFormat';
import { useSpeechRecognition, RECOGNITION_ERROR_MESSAGES } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';

const WARNING_MS = 2 * 60 * 1000;
const CLOSE_MS = 5 * 60 * 1000;
const WARNING_TEXT = 'This chat will close in 3 minutes due to inactivity.';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ANYTHING_ELSE_REPLY = 'Great! 👍 Is there anything else I can help you with?';

let idCounter = 0;
function makeMessage(role, content, extra = {}) {
  idCounter += 1;
  return { id: `msg-${idCounter}`, role, content, timestamp: new Date(), ...extra };
}

function serialize(messages) {
  return messages.map(({ role, content, timestamp }) => ({
    role,
    content,
    timestamp: timestamp.toISOString(),
  }));
}

function emptyContext() {
  return { faqMatches: [], questionsAsked: [], answersGiven: [], selectedOptions: {} };
}

export default function Chatbot({ onRequestOpen, onMessageSent }) {
  const { goToPage } = usePageNav();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ended, setEnded] = useState(false);
  const [endReason, setEndReason] = useState(null);
  const [guestEmailInput, setGuestEmailInput] = useState('');
  const [transcriptStatus, setTranscriptStatus] = useState('idle');
  const [transcriptError, setTranscriptError] = useState('');

  const [conversationPhase, setConversationPhase] = useState('name'); // name -> email -> active
  const [guestName, setGuestName] = useState(null);
  const [guestEmail, setGuestEmail] = useState(null);
  const [pendingFollowUpMessageId, setPendingFollowUpMessageId] = useState(null);

  const [voicePrefs, setVoicePrefs] = useState(loadVoicePrefs);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micTestResult, setMicTestResult] = useState('');

  const startedAtRef = useRef(null);
  const endedAtRef = useRef(null);
  const warningTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const scrollRef = useRef(null);

  const messagesRef = useRef(messages);
  const unansweredRef = useRef([]);
  const hasRequestedContactRef = useRef(false);
  const consecutiveMissesRef = useRef(0);
  const guestNameRef = useRef(null);
  const guestEmailRef = useRef(null);
  const contextRef = useRef(emptyContext());
  const pendingFollowUpRef = useRef(null);
  const warningShownRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    guestNameRef.current = guestName;
  }, [guestName]);

  useEffect(() => {
    guestEmailRef.current = guestEmail;
  }, [guestEmail]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isTyping, ended]);

  useEffect(() => {
    return () => {
      clearTimeout(warningTimerRef.current);
      clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleFinalTranscript = (transcript) => {
    const trimmed = transcript.trim();
    if (!trimmed) return;

    if (isTestingMic) {
      setMicTestResult(trimmed);
      return;
    }

    setInput((prev) => (prev.trim() ? `${prev.trim()} ${trimmed}` : trimmed));
  };

  const handleRecognitionError = (error) => {
    setVoiceError(RECOGNITION_ERROR_MESSAGES[error] || 'Microphone error');
    setTimeout(() => setVoiceError(''), 4000);
  };

  const recognition = useSpeechRecognition({
    language: voicePrefs.language,
    onFinalResult: handleFinalTranscript,
    onError: handleRecognitionError,
  });

  const synthesis = useSpeechSynthesis({
    language: voicePrefs.language,
    rate: voicePrefs.rate,
    volume: voicePrefs.volume,
  });

  useEffect(() => {
    saveVoicePrefs(voicePrefs);
  }, [voicePrefs]);

  const handleVoicePrefsChange = (partial) => {
    setVoicePrefs((prev) => ({ ...prev, ...partial }));
  };

  const handleToggleListening = () => {
    setIsTestingMic(false);
    recognition.toggleListening();
  };

  const handleTestMicrophone = () => {
    setMicTestResult('');
    setIsTestingMic(true);
    recognition.toggleListening();
  };

  const handleToggleSettings = () => {
    setIsSettingsOpen((prev) => !prev);
    setIsTestingMic(false);
  };

  const handleToggleSpeak = (message) => {
    if (synthesis.speakingId === message.id) {
      synthesis.stop();
    } else {
      synthesis.speak(stripMarkdown(message.content), message.id);
    }
  };

  useEffect(() => {
    if (!isOpen || ended) return;

    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key.toLowerCase();
      if (key === 'm' && voicePrefs.voiceInputEnabled && recognition.isSupported) {
        e.preventDefault();
        handleToggleListening();
      } else if (key === 's' && voicePrefs.voiceOutputEnabled && synthesis.isSupported) {
        e.preventDefault();
        const lastBot = [...messagesRef.current].reverse().find((m) => m.role === 'bot');
        if (lastBot) handleToggleSpeak(lastBot);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    ended,
    voicePrefs.voiceInputEnabled,
    voicePrefs.voiceOutputEnabled,
    recognition.isSupported,
    synthesis.isSupported,
  ]);

  const appendMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
    onMessageSent?.(stripMarkdown(msg.content), msg.role);
  };

  const resetInactivityTimers = () => {
    clearTimeout(warningTimerRef.current);
    clearTimeout(closeTimerRef.current);

    warningTimerRef.current = setTimeout(() => {
      warningShownRef.current = true;
      appendMessage(makeMessage('bot', WARNING_TEXT, { isSystem: true }));
    }, WARNING_MS);

    closeTimerRef.current = setTimeout(() => {
      requestEnd('timeout');
    }, CLOSE_MS);
  };

  const recordFollowUpAnswer = (categoryId, answerText) => {
    contextRef.current = {
      ...contextRef.current,
      answersGiven: [...contextRef.current.answersGiven, answerText],
      selectedOptions: { ...contextRef.current.selectedOptions, [categoryId]: answerText },
    };
  };

  const finalizeInBackground = () => {
    const endedAt = new Date();
    endedAtRef.current = endedAt;
    const startedAt = startedAtRef.current ?? endedAt;
    const finalMessages = messagesRef.current;
    const unanswered = unansweredRef.current;
    const humanFollowUp = hasRequestedContactRef.current;
    const serialized = serialize(finalMessages);
    const timeOfDay = getTimeOfDay(startedAt);
    const context = { ...contextRef.current, unansweredQuestions: unanswered };
    const finalGuestName = guestNameRef.current;
    const finalGuestEmail = guestEmailRef.current;

    (async () => {
      const historyId = await saveChatHistory({
        guestName: finalGuestName,
        guestEmail: finalGuestEmail,
        messages: serialized,
        startedAt,
        endedAt,
        humanFollowUp,
        context,
        timeOfDay,
        inactivityWarningSent: warningShownRef.current,
      });

      if (historyId && unanswered.length) {
        await saveUnansweredQuestions(historyId, unanswered, finalGuestEmail);
      }

      try {
        await sendChatTranscript({
          messages: serialized,
          guestName: finalGuestName,
          guestEmail: finalGuestEmail,
          startedAt,
          endedAt,
          unansweredQuestions: unanswered,
          context,
          timeOfDay,
          notifyOwner: true,
          sendCopyToGuest: false,
        });
      } catch (err) {
        console.error('Failed to send chat transcript:', err.message);
      }
    })();
  };

  const requestEnd = (reason) => {
    clearTimeout(warningTimerRef.current);
    clearTimeout(closeTimerRef.current);
    recognition.stopListening();
    synthesis.stop();

    if (messagesRef.current.length <= 1) {
      setIsOpen(false);
      return;
    }

    setEnded(true);
    setEndReason(reason);
    setGuestEmailInput(guestEmailRef.current || '');
    finalizeInBackground();
  };

  const openNow = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      startedAtRef.current = new Date();
      appendMessage(makeMessage('bot', NAME_PROMPT));
      resetInactivityTimers();
    }
  };

  // Opening the chat is gated behind the roaming robot's laser actually
  // landing on the button — minimizing (the same button while open) stays
  // instant, since that's not part of the "shoot to open" flourish.
  const handleOpenToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    if (onRequestOpen) {
      onRequestOpen(openNow);
    } else {
      openNow();
    }
  };

  const handleGuestText = (trimmed) => {
    if (conversationPhase === 'name') {
      setGuestName(trimmed);
      appendMessage(makeMessage('bot', getEmailPrompt(trimmed)));
      setConversationPhase('email');
      return;
    }

    if (conversationPhase === 'email') {
      if (!EMAIL_REGEX.test(trimmed)) {
        appendMessage(
          makeMessage('bot', "Hmm, that doesn't look like a valid email — mind double-checking it?")
        );
        return;
      }
      setGuestEmail(trimmed);
      setConversationPhase('active');
      const greeting = getTimeBasedGreeting(guestNameRef.current);
      appendMessage(makeMessage('bot', greeting, { suggestions: SUGGESTED_QUESTIONS }));
      return;
    }

    // conversationPhase === 'active'
    const autoReply = getAutoReply(trimmed);
    if (autoReply) {
      consecutiveMissesRef.current = 0;
      appendMessage(makeMessage('bot', autoReply));
      return;
    }

    if (pendingFollowUpRef.current) {
      const { categoryId, messageId } = pendingFollowUpRef.current;
      recordFollowUpAnswer(categoryId, trimmed);
      pendingFollowUpRef.current = null;
      setPendingFollowUpMessageId(null);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, choiceMade: trimmed } : m))
      );
      appendMessage(makeMessage('bot', ANYTHING_ELSE_REPLY));
      return;
    }

    const reply = getBotReply(trimmed);
    if (reply.matched) {
      consecutiveMissesRef.current = 0;
      contextRef.current = {
        ...contextRef.current,
        faqMatches: Array.from(new Set([...contextRef.current.faqMatches, reply.category.label])),
        questionsAsked: [...contextRef.current.questionsAsked, reply.category.id],
      };
      appendMessage(
        makeMessage('bot', reply.text, {
          cta: { label: reply.category.cta, draftSubject: reply.category.draftSubject },
        })
      );

      const followUp = getFollowUp(reply.category.id);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const followUpMessage = makeMessage(
          'bot',
          followUp.question,
          followUp.options
            ? { multipleChoice: { options: followUp.options, categoryId: reply.category.id } }
            : {}
        );
        pendingFollowUpRef.current = { categoryId: reply.category.id, messageId: followUpMessage.id };
        setPendingFollowUpMessageId(followUpMessage.id);
        appendMessage(followUpMessage);
        resetInactivityTimers();
      }, 550 + Math.random() * 300);
    } else {
      unansweredRef.current = [...unansweredRef.current, trimmed];
      appendMessage(makeMessage('bot', reply.text, { suggestions: reply.suggestions }));

      consecutiveMissesRef.current += 1;
      if (consecutiveMissesRef.current >= 2) {
        consecutiveMissesRef.current = 0;
        appendMessage(
          makeMessage(
            'bot',
            "I couldn't find an answer to that. Would you like to contact Sonny directly?",
            {
              cta: {
                label: 'Contact Sonny directly',
                draftSubject: 'Question from the chat assistant',
              },
            }
          )
        );
      }
    }
  };

  const respondTo = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    appendMessage(makeMessage('guest', trimmed));
    setInput('');
    resetInactivityTimers();
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      handleGuestText(trimmed);
      resetInactivityTimers();
    }, 700 + Math.random() * 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    respondTo(input);
  };

  const handleMultipleChoiceSelect = (message, option) => {
    if (message.choiceMade || pendingFollowUpMessageId !== message.id) return;

    const { categoryId } = message.multipleChoice;
    recordFollowUpAnswer(categoryId, option.text);
    pendingFollowUpRef.current = null;
    setPendingFollowUpMessageId(null);
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, choiceMade: option.text } : m))
    );
    appendMessage(makeMessage('bot', ANYTHING_ELSE_REPLY));
    resetInactivityTimers();
  };

  const handleCtaClick = (draftSubject) => {
    hasRequestedContactRef.current = true;
    try {
      sessionStorage.setItem(
        'chatContactDraft',
        JSON.stringify({ subject: draftSubject || 'Question from the chat assistant', message: '' })
      );
    } catch {
      // sessionStorage may be unavailable (private mode) — contact page just won't be prefilled
    }
    goToPage('contact');
  };

  const handleSendCopy = async () => {
    if (!EMAIL_REGEX.test(guestEmailInput.trim())) {
      setTranscriptStatus('error');
      setTranscriptError('Enter a valid email address.');
      return;
    }

    setTranscriptStatus('sending');
    setTranscriptError('');

    try {
      await sendChatTranscript({
        messages: serialize(messagesRef.current),
        guestName: guestNameRef.current,
        guestEmail: guestEmailInput.trim(),
        startedAt: startedAtRef.current ?? new Date(),
        endedAt: endedAtRef.current ?? new Date(),
        unansweredQuestions: unansweredRef.current,
        context: { ...contextRef.current, unansweredQuestions: unansweredRef.current },
        timeOfDay: getTimeOfDay(startedAtRef.current ?? new Date()),
        notifyOwner: false,
        sendCopyToGuest: true,
      });
      setTranscriptStatus('sent');
    } catch (err) {
      setTranscriptStatus('error');
      setTranscriptError(err.message || 'Could not send the transcript.');
    }
  };

  const handleDone = () => {
    setIsOpen(false);
    setMessages([]);
    setEnded(false);
    setEndReason(null);
    setGuestEmailInput('');
    setTranscriptStatus('idle');
    setTranscriptError('');
    consecutiveMissesRef.current = 0;
    unansweredRef.current = [];
    hasRequestedContactRef.current = false;
    startedAtRef.current = null;
    endedAtRef.current = null;
    setIsSettingsOpen(false);
    setIsTestingMic(false);
    setMicTestResult('');
    setVoiceError('');

    setConversationPhase('name');
    setGuestName(null);
    setGuestEmail(null);
    setPendingFollowUpMessageId(null);
    pendingFollowUpRef.current = null;
    contextRef.current = emptyContext();
    warningShownRef.current = false;
  };

  const inputPlaceholder =
    conversationPhase === 'name'
      ? 'Type your name...'
      : conversationPhase === 'email'
        ? 'Type your email...'
        : 'Ask me anything...';

  return (
    <>
      <ChatButton isOpen={isOpen} onClick={handleOpenToggle} />
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            input={input}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            inputPlaceholder={inputPlaceholder}
            onSuggestionClick={respondTo}
            onCtaClick={handleCtaClick}
            onMultipleChoiceSelect={handleMultipleChoiceSelect}
            pendingFollowUpMessageId={pendingFollowUpMessageId}
            onClose={() => requestEnd('manual')}
            ended={ended}
            endReason={endReason}
            guestEmailInput={guestEmailInput}
            onGuestEmailChange={setGuestEmailInput}
            transcriptStatus={transcriptStatus}
            transcriptError={transcriptError}
            onSendCopy={handleSendCopy}
            onDone={handleDone}
            scrollRef={scrollRef}
            isSettingsOpen={isSettingsOpen}
            onToggleSettings={handleToggleSettings}
            voicePrefs={voicePrefs}
            onVoicePrefsChange={handleVoicePrefsChange}
            recognitionSupported={recognition.isSupported}
            synthesisSupported={synthesis.isSupported}
            isListening={recognition.isListening}
            interimText={recognition.interimText}
            onToggleListening={handleToggleListening}
            voiceError={voiceError}
            speakingMessageId={synthesis.speakingId}
            onToggleSpeak={handleToggleSpeak}
            isTestingMic={isTestingMic}
            micTestResult={micTestResult}
            onTestMicrophone={handleTestMicrophone}
          />
        )}
      </AnimatePresence>
    </>
  );
}
