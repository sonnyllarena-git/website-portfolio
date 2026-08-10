import { motion } from 'framer-motion';
import {
  FiX,
  FiSend,
  FiMail,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import ChatMessageText from './ChatMessageText';

function formatTime(date) {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-black/40 dark:bg-white/40 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message, onSuggestionClick, onCtaClick }) {
  const isGuest = message.role === 'guest';

  return (
    <div className={`flex ${isGuest ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isGuest ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isGuest
              ? 'bg-gray-200 dark:bg-white/10 text-black dark:text-white rounded-br-sm'
              : `bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-black dark:text-white rounded-bl-sm shadow-sm ${
                  message.isSystem ? 'italic text-black/60 dark:text-white/60' : ''
                }`
          }`}
        >
          <ChatMessageText text={message.content} />
        </div>

        {message.cta && (
          <button
            onClick={() => onCtaClick(message.cta.draftSubject)}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent border border-accent rounded-full px-3 py-1.5 hover:bg-accent hover:text-white transition-colors duration-200 ease-in-out"
          >
            {message.cta.label} &rarr;
          </button>
        )}

        {message.suggestions && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.suggestions.map((s) => (
              <button
                key={s.text}
                onClick={() => onSuggestionClick(s.text)}
                className="text-xs px-3 py-1.5 rounded-full border border-accent/40 text-accent hover:bg-accent hover:text-white hover:border-accent transition-colors duration-200 ease-in-out"
              >
                {s.text}
              </button>
            ))}
          </div>
        )}

        <span className="text-[10px] mt-1 opacity-50">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

function EndPanel({
  endReason,
  guestEmailInput,
  onGuestEmailChange,
  transcriptStatus,
  transcriptError,
  onSendCopy,
  onDone,
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col justify-center gap-4">
      <p className="text-sm text-center text-black/80 dark:text-white/80">
        {endReason === 'timeout'
          ? 'This chat closed automatically after 5 minutes of inactivity.'
          : 'Thanks for chatting!'}
      </p>

      {transcriptStatus === 'sent' ? (
        <p className="flex items-center justify-center gap-2 text-sm text-green-500">
          <FiCheckCircle /> Transcript sent to your email.
        </p>
      ) : (
        <>
          <p className="text-xs text-center text-black/60 dark:text-white/60">
            Would you like us to email you a copy of this transcript?
          </p>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={guestEmailInput}
              onChange={(e) => onGuestEmailChange(e.target.value)}
              placeholder="you@example.com"
              className="form-input-focus flex-1 text-sm px-3.5 py-2.5 rounded-full bg-black/5 dark:bg-white/10 outline-none"
            />
            <button
              onClick={onSendCopy}
              disabled={transcriptStatus === 'sending'}
              className="btn-hover shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-accent text-white disabled:opacity-60"
              aria-label="Email me a copy"
            >
              {transcriptStatus === 'sending' ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiMail />
              )}
            </button>
          </div>
          {transcriptStatus === 'error' && (
            <p className="flex items-center justify-center gap-2 text-xs text-red-400">
              <FiAlertCircle /> {transcriptError}
            </p>
          )}
        </>
      )}

      <button
        onClick={onDone}
        className="btn-hover mx-auto mt-2 text-sm font-semibold px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black"
      >
        {transcriptStatus === 'sent' ? 'Close' : 'Skip & Close'}
      </button>
    </div>
  );
}

export default function ChatWindow({
  messages,
  isTyping,
  input,
  onInputChange,
  onSubmit,
  onSuggestionClick,
  onCtaClick,
  onClose,
  ended,
  endReason,
  guestEmailInput,
  onGuestEmailChange,
  transcriptStatus,
  transcriptError,
  onSendCopy,
  onDone,
  scrollRef,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="chat-window-glow fixed z-50 right-5 bottom-[168px] w-[calc(100vw-40px)] h-[60vh] sm:w-[350px] sm:h-[450px] lg:w-[400px] lg:h-[500px] rounded-xl shadow-2xl flex flex-col overflow-hidden bg-bg-light dark:bg-bg-dark text-black dark:text-white"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-accent text-white shrink-0">
        <div>
          <p className="font-bold text-sm">Sonny&apos;s Assistant</p>
          <p className="text-[11px] text-white/80">Usually replies instantly</p>
        </div>
        <button
          onClick={ended ? onDone : onClose}
          aria-label="Close chat"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200 ease-in-out"
        >
          <FiX size={18} />
        </button>
      </div>

      {ended ? (
        <EndPanel
          endReason={endReason}
          guestEmailInput={guestEmailInput}
          onGuestEmailChange={onGuestEmailChange}
          transcriptStatus={transcriptStatus}
          transcriptError={transcriptError}
          onSendCopy={onSendCopy}
          onDone={onDone}
        />
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onSuggestionClick={onSuggestionClick}
                onCtaClick={onCtaClick}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>

          <form
            onSubmit={onSubmit}
            className="flex items-center gap-2 p-3 border-t border-black/10 dark:border-white/10 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Ask me anything..."
              className="form-input-focus flex-1 text-sm px-3.5 py-2.5 rounded-full bg-black/5 dark:bg-white/10 outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="btn-hover shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-accent text-white disabled:opacity-60 disabled:hover:scale-100"
            >
              <FiSend size={16} />
            </button>
          </form>
        </>
      )}
    </motion.div>
  );
}
