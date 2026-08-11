const FOLLOW_UPS = {
  pricing: {
    question: 'Are you looking for a quick estimate, or do you need a detailed proposal?',
    options: ['Quick estimate', 'Detailed proposal', 'Both would be helpful', 'Not sure yet'],
  },
  timeline: {
    question: 'Is this project time-sensitive for you, or do you have a flexible deadline?',
    options: [
      "It's time-sensitive / urgent",
      'I have a flexible deadline',
      'Somewhere in between',
      'Not sure yet',
    ],
  },
  tech: {
    question: 'Do you already have a preferred tech stack, or would you like my recommendation?',
    options: [
      'I have a preferred stack',
      "I'd like your recommendation",
      'A mix of both',
      'Not sure yet',
    ],
  },
  services: {
    question: 'Are you looking for a full project, or just specific features/components?',
    options: [
      'A full project',
      'Specific features/components',
      'Not sure yet — need guidance',
      'Just exploring options',
    ],
  },
  process: {
    question: 'Do you prefer regular updates (weekly), or would monthly summaries work for you?',
    options: ['Weekly updates', 'Monthly summaries', 'Only major milestones', 'Not sure yet'],
  },
  availability: {
    question: 'Are you looking to start immediately, or is there a specific timeline you have in mind?',
    options: [
      'Start immediately',
      'I have a specific timeline in mind',
      'Within the next few weeks',
      'Just researching for now',
    ],
  },
};

const DEFAULT_FOLLOW_UP = {
  question: 'Is there anything else I can clarify about that?',
  options: null,
};

export function getFollowUp(categoryId) {
  const followUp = FOLLOW_UPS[categoryId] || DEFAULT_FOLLOW_UP;
  return {
    question: followUp.question,
    options: followUp.options
      ? followUp.options.map((text, idx) => ({ label: String.fromCharCode(65 + idx), text }))
      : null,
  };
}

const AUTO_REPLY_PATTERNS = [
  {
    id: 'thankYou',
    keywords: ['thank', 'thanks', 'thx', 'appreciate', 'grateful'],
    reply: "You're welcome! 😊 Is there anything else I can help you with?",
  },
  {
    id: 'affirmation',
    keywords: ['ok', 'okay', 'alright', 'good', 'sounds good', 'yes', 'yep', 'sure', 'perfect', 'cool', 'nice'],
    reply: 'Great! 👍 Is there anything else I can help you with?',
  },
  {
    id: 'farewell',
    keywords: ['bye', 'goodbye', 'see you', 'talk later', 'later', 'gotta go', 'take care'],
    reply: 'Thanks for chatting! 👋 Feel free to reach out anytime. Have a great day!',
  },
];

function matchesKeyword(message, keyword) {
  if (keyword.includes(' ')) return message.includes(keyword);
  return new RegExp(`\\b${keyword}\\b`).test(message);
}

export function getAutoReply(userMessage) {
  const message = userMessage.toLowerCase();
  for (const pattern of AUTO_REPLY_PATTERNS) {
    if (pattern.keywords.some((kw) => matchesKeyword(message, kw))) {
      return pattern.reply;
    }
  }
  return null;
}
