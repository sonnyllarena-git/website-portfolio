import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePageNav } from '../../context/PageContext';
import {
  GREETING_MESSAGE,
  SUGGESTED_QUESTIONS,
} from '../../utils/chatKnowledgeBase';
import { getBotReply } from '../../utils/chatBot';
import {
  saveChatHistory,
  saveUnansweredQuestions,
  sendChatTranscript,
} from '../../utils/chatService';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';

const WARNING_MS = 2 * 60 * 1000;
const CLOSE_MS = 5 * 60 * 1000;
const WARNING_TEXT = 'This chat will close in 3 minutes due to inactivity.';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export default function Chatbot() {
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

  const startedAtRef = useRef(null);
  const endedAtRef = useRef(null);
  const warningTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const scrollRef = useRef(null);

  const messagesRef = useRef(messages);
  const unansweredRef = useRef([]);
  const hasRequestedContactRef = useRef(false);
  const consecutiveMissesRef = useRef(0);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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

  const appendMessage = (msg) => setMessages((prev) => [...prev, msg]);

  const resetInactivityTimers = () => {
    clearTimeout(warningTimerRef.current);
    clearTimeout(closeTimerRef.current);

    warningTimerRef.current = setTimeout(() => {
      appendMessage(makeMessage('bot', WARNING_TEXT, { isSystem: true }));
    }, WARNING_MS);

    closeTimerRef.current = setTimeout(() => {
      requestEnd('timeout');
    }, CLOSE_MS);
  };

  const finalizeInBackground = () => {
    const endedAt = new Date();
    endedAtRef.current = endedAt;
    const startedAt = startedAtRef.current ?? endedAt;
    const finalMessages = messagesRef.current;
    const unanswered = unansweredRef.current;
    const humanFollowUp = hasRequestedContactRef.current;
    const serialized = serialize(finalMessages);

    (async () => {
      const historyId = await saveChatHistory({
        guestName: null,
        guestEmail: null,
        messages: serialized,
        startedAt,
        endedAt,
        humanFollowUp,
      });

      if (historyId && unanswered.length) {
        await saveUnansweredQuestions(historyId, unanswered, null);
      }

      try {
        await sendChatTranscript({
          messages: serialized,
          guestEmail: null,
          startedAt,
          endedAt,
          unansweredQuestions: unanswered,
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

    if (messagesRef.current.length <= 1) {
      setIsOpen(false);
      return;
    }

    setEnded(true);
    setEndReason(reason);
    finalizeInBackground();
  };

  const handleOpenToggle = () => {
    const next = !isOpen;
    setIsOpen(next);

    if (next && messages.length === 0) {
      startedAtRef.current = new Date();
      appendMessage(
        makeMessage('bot', GREETING_MESSAGE, { suggestions: SUGGESTED_QUESTIONS })
      );
      resetInactivityTimers();
    }
  };

  const respondTo = (text) => {
    appendMessage(makeMessage('guest', text));
    setInput('');
    resetInactivityTimers();
    setIsTyping(true);

    setTimeout(() => {
      const reply = getBotReply(text);
      setIsTyping(false);

      if (reply.matched) {
        consecutiveMissesRef.current = 0;
        appendMessage(
          makeMessage('bot', reply.text, {
            cta: { label: reply.category.cta, draftSubject: reply.category.draftSubject },
          })
        );
      } else {
        unansweredRef.current = [...unansweredRef.current, text];
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

      resetInactivityTimers();
    }, 700 + Math.random() * 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    respondTo(trimmed);
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
        guestEmail: guestEmailInput.trim(),
        startedAt: startedAtRef.current ?? new Date(),
        endedAt: endedAtRef.current ?? new Date(),
        unansweredQuestions: unansweredRef.current,
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
  };

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
            onSuggestionClick={respondTo}
            onCtaClick={handleCtaClick}
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
          />
        )}
      </AnimatePresence>
    </>
  );
}
