import { useRef, useState } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import RobotCanvas from '../ChatRobot/RobotCanvas';
import { useRobotChatState } from '../ChatRobot/RobotAnimations';

export default function ChatButton({ isOpen, onClick }) {
  const wrapperRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const robotState = useRobotChatState(isOpen, isHovering);

  const handleMouseMove = (e) => {
    const rect = wrapperRef.current.getBoundingClientRect();
    setCursorPos({
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    });
  };

  return (
    <div
      ref={wrapperRef}
      className="fixed bottom-24 right-5 z-50 flex flex-col items-center"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      <div className="chat-robot-canvas" aria-hidden="true">
        <RobotCanvas robotState={robotState} cursorPosition={isOpen ? null : cursorPos} />
      </div>

      <button
        onClick={onClick}
        aria-label={isOpen ? 'Minimize chat' : 'Open chat'}
        aria-expanded={isOpen}
        className="chat-button-hover w-[60px] h-[60px] rounded-xl flex flex-col items-center justify-center gap-0.5 text-white"
      >
        <FiMessageCircle size={18} />
        <span className="text-[9px] font-bold leading-none tracking-tight">
          CHAT NOW
        </span>
      </button>
    </div>
  );
}
