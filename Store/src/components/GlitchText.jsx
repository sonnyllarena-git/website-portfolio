import './GlitchText.css';

export default function GlitchText({
  text,
  animated = false,
  intensity = 'medium',
  className = '',
}) {
  const classes = [
    'glitch-text',
    `intensity-${intensity}`,
    animated && 'animated',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} data-text={text}>
      {text}
    </span>
  );
}
