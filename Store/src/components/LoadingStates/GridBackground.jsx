import './GridBackground.css';

export default function GridBackground() {
  return (
    <div className="grid-background">
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={i}
          className={`grid-square ${i % 2 === 0 ? 'active' : 'inactive'}`}
          style={{ animationDelay: `${(i % 10) * 50}ms` }}
        />
      ))}
    </div>
  );
}
