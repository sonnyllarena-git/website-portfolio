import {
  CHAT_CATEGORIES,
  FALLBACK_RESPONSE,
  FALLBACK_SUGGESTIONS,
} from './chatKnowledgeBase';

export function matchQuestion(userInput) {
  const input = userInput.toLowerCase();

  let bestCategory = null;
  let bestScore = 0;

  for (const category of CHAT_CATEGORIES) {
    const score = category.keywords.reduce(
      (acc, keyword) => (input.includes(keyword) ? acc + 1 : acc),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

export function getBotReply(userInput) {
  const category = matchQuestion(userInput);

  if (category) {
    return {
      matched: true,
      category,
      text: category.response,
    };
  }

  return {
    matched: false,
    category: null,
    text: FALLBACK_RESPONSE,
    suggestions: FALLBACK_SUGGESTIONS,
  };
}
