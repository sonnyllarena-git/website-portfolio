export default function GlitchText({ text, as: Tag = 'span', animated = true, intensity, className = '' }) {
  const classes = [
    'glitch-text',
    animated && 'glitch-animated',
    intensity && `intensity-${intensity}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} data-text={text}>
      {text}
    </Tag>
  );
}
