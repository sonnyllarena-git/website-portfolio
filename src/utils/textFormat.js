export function stripMarkdown(text) {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1');
}
