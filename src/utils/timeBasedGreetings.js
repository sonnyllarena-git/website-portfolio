export function getTimeOfDay(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
}

const GREETINGS = {
  morning: (name) => [
    `Good morning, ${name}! ☀️ How can I help you today?`,
    `Rise and shine, ${name}! 🌅 What brings you here today?`,
    `Hello ${name}! ☀️ Ready to chat?`,
  ],
  afternoon: (name) => [
    `Good afternoon, ${name}! 👋 What can I help with?`,
    `Hey ${name}! 💼 How's your day going? What do you need?`,
    `Afternoon, ${name}! ✨ How can I assist you?`,
    `Hello ${name}! 🌤️ What's on your mind?`,
  ],
  evening: (name) => [
    `Good evening, ${name}! 🌙 What can I help you with?`,
    `Hey ${name}! ✨ Evening plans include chatting with me? What's up?`,
    `Hello ${name}! 🌙 How can I help tonight?`,
  ],
  night: (name) => [
    `Night owl, huh ${name}? 🌙 What's on your mind?`,
    `Hello ${name}! 🌙 Burning the midnight oil? What can I help with?`,
    `Late night chat with ${name}! 💫 What can I do for you?`,
  ],
};

export function getTimeBasedGreeting(guestName, date = new Date()) {
  const name = guestName || 'there';
  const period = getTimeOfDay(date);
  const options = GREETINGS[period](name);
  return options[Math.floor(Math.random() * options.length)];
}
