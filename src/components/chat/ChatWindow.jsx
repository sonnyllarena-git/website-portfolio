import { motion } from 'framer-motion';
import {
  FiX,
  FiSend,
  FiMail,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
  FiSettings,
  FiMic,
  FiVolume2,
  FiSquare,
} from 'react-icons/fi';
import ChatMessageText from './ChatMessageText';
import VoiceSettingsPanel from './VoiceSettingsPanel';
import MultipleChoiceOptions from './MultipleChoiceOptions';

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

function MessageBubble({
  message,
  onSuggestionClick,
  onCtaClick,
  onMultipleChoiceSelect,
  pendingFollowUpMessageId,
  voiceOutputEnabled,
  synthesisSupported,
  speakingMessageId,
  onToggleSpeak,
}) {
  const isGuest = message.role === 'guest';
  const isSpeaking = speakingMessageId === message.id;

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

        {!isGuest && !message.isSystem && voiceOutputEnabled && synthesisSupported && (
          <button
            type="button"
            onClick={() => onToggleSpeak(message)}
            aria-label={isSpeaking ? 'Stop audio' : 'Play audio'}
            title={isSpeaking ? 'Stop audio' : 'Play audio'}
            className={`speaker-button mt-1 w-6 h-6 flex items-center justify-center rounded-full text-accent hover:bg-accent/10 transition-all duration-200 ease-in-out hover:scale-110 ${
              isSpeaking ? 'speaker-playing' : ''
            }`}
          >
            {isSpeaking ? <FiSquare size={11} /> : <FiVolume2 size={13} />}
          </button>
        )}

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

        {message.multipleChoice && (
          <MultipleChoiceOptions
            options={message.multipleChoice.options}
            selected={message.choiceMade}
            disabled={pendingFollowUpMessageId !== message.id}
            onSelect={(option) => onMultipleChoiceSelect(message, option)}
          />
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
  inputPlaceholder,
  onSuggestionClick,
  onCtaClick,
  onMultipleChoiceSelect,
  pendingFollowUpMessageId,
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
  isSettingsOpen,
  onToggleSettings,
  voicePrefs,
  onVoicePrefsChange,
  recognitionSupported,
  synthesisSupported,
  isListening,
  interimText,
  onToggleListening,
  voiceError,
  speakingMessageId,
  onToggleSpeak,
  isTestingMic,
  micTestResult,
  onTestMicrophone,
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
          <p className="font-bold text-sm">
            {isSettingsOpen ? 'Voice Settings' : "Sonny's Assistant"}
          </p>
          <p className="text-[11px] text-white/80">
            {isSettingsOpen ? 'Speak, listen, customize' : 'Usually replies instantly'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!ended && (
            <button
              onClick={onToggleSettings}
              aria-label={isSettingsOpen ? 'Close voice settings' : 'Voice settings'}
              title="Voice settings"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200 ease-in-out"
            >
              <FiSettings size={16} />
            </button>
          )}
          <button
            onClick={ended ? onDone : onClose}
            aria-label="Close chat"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200 ease-in-out"
          >
            <FiX size={18} />
          </button>
        </div>
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
      ) : isSettingsOpen ? (
        <VoiceSettingsPanel
          prefs={voicePrefs}
          onChange={onVoicePrefsChange}
          recognitionSupported={recognitionSupported}
          synthesisSupported={synthesisSupported}
          onTestMicrophone={onTestMicrophone}
          isTestingMic={isTestingMic}
          isListening={isListening}
          micTestResult={micTestResult}
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
                onMultipleChoiceSelect={onMultipleChoiceSelect}
                pendingFollowUpMessageId={pendingFollowUpMessageId}
                voiceOutputEnabled={voicePrefs.voiceOutputEnabled}
                synthesisSupported={synthesisSupported}
                speakingMessageId={speakingMessageId}
                onToggleSpeak={onToggleSpeak}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>

          <div className="border-t border-black/10 dark:border-white/10 shrink-0 px-3 pt-2 pb-3 space-y-1.5">
            {isListening && (
              <p className="text-xs text-accent font-medium flex items-center gap-1.5 px-1">
                <span className="listening-dot" /> Listening...
              </p>
            )}
            {interimText && (
              <p className="text-xs italic text-black/50 dark:text-white/50 px-1 truncate">
                {interimText}
              </p>
            )}
            {voiceError && (
              <p className="text-xs text-red-400 flex items-center gap-1 px-1">
                <FiAlertCircle size={12} /> {voiceError}
              </p>
            )}

            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={inputPlaceholder}
                className="form-input-focus flex-1 text-sm px-3.5 py-2.5 rounded-full bg-black/5 dark:bg-white/10 outline-none"
              />
              {voicePrefs.voiceInputEnabled && (
                <button
                  type="button"
                  onClick={onToggleListening}
                  disabled={!recognitionSupported}
                  aria-label={isListening ? 'Stop recording' : 'Start voice input'}
                  title={
                    recognitionSupported
                      ? isListening
                        ? 'Stop recording'
                        : 'Click to speak your question'
                      : 'Voice input not supported in this browser'
                  }
                  className={`mic-button shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ease-in-out hover:scale-110 disabled:opacity-40 disabled:hover:scale-100 ${
                    isListening
                      ? 'mic-recording bg-red-500 text-white'
                      : 'bg-accent/10 text-accent'
                  }`}
                >
                  <FiMic size={16} />
                </button>
              )}
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="btn-hover shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-accent text-white disabled:opacity-60 disabled:hover:scale-100"
              >
                <FiSend size={16} />
              </button>
            </form>
          </div>
        </>
      )}
    </motion.div>
  );
}
