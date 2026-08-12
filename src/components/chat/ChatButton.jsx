import { FiMessageCircle } from 'react-icons/fi';

export default function ChatButton({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      data-chat-launcher="true"
      aria-label={isOpen ? 'Minimize chat' : 'Open chat'}
      aria-expanded={isOpen}
      className="chat-button-hover fixed bottom-24 right-5 z-50 w-[60px] h-[60px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-white"
    >
      <FiMessageCircle size={18} />
      <span className="text-[9px] font-bold leading-none tracking-tight">
        CHAT NOW
      </span>
    </button>
  );
}
