function renderInline(line, lineIndex) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={`${lineIndex}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={`${lineIndex}-${i}`}>{part}</span>
    )
  );
}

export default function ChatMessageText({ text }) {
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="block empty:h-2">
          {line.trim() === '' ? ' ' : renderInline(line, i)}
        </span>
      ))}
    </>
  );
}
