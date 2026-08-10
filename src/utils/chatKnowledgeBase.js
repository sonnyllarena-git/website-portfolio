export const CHAT_CATEGORIES = [
  {
    id: 'pricing',
    label: 'Pricing & Budget',
    keywords: [
      'cost',
      'price',
      'pricing',
      'budget',
      'how much',
      'expensive',
      'affordable',
      'quote',
      'cheap',
    ],
    response: `Pricing depends on your project requirements, scope, and complexity.
It could be a small website, mobile app, or enterprise system.

To get an accurate quote, I'd love to understand:
- What type of project? (Website, Mobile App, System, etc.)
- Your budget range?
- Timeline requirements?
- Key features you need?

Click here to send me a detailed message about your project requirements, and I'll provide a custom quote within 24 hours.`,
    cta: 'Send project details',
    draftSubject: 'Project quote request',
  },
  {
    id: 'timeline',
    label: 'Project Timelines',
    keywords: [
      'timeline',
      'how long',
      'duration',
      'weeks',
      'months',
      'fast',
      'delivery',
      'deadline',
    ],
    response: `Project timelines vary based on complexity:
- Small websites: 2-4 weeks
- Mobile apps: 4-8 weeks
- Complex systems: 8-12+ weeks

I focus on quality over speed. My approach:
1. **Planning & Design** (1-2 weeks)
2. **Development & Testing** (ongoing)
3. **Deployment & Support** (ongoing)

For a precise timeline, let me know your project details. Click here to send me a message about your specific needs.`,
    cta: 'Discuss my timeline',
    draftSubject: 'Timeline question',
  },
  {
    id: 'tech',
    label: 'Technology Stack',
    keywords: [
      'technology',
      'tech',
      'language',
      'framework',
      'stack',
      'react',
      'node',
      'python',
      'tools',
    ],
    response: `My Technology Stack:
- **Frontend**: React, React Native, HTML/CSS, TypeScript
- **Backend**: Node.js, Python, Express
- **Databases**: PostgreSQL, SQLite, Firebase
- **Tools**: Git, Docker, Jira, Figma
- **Platforms**: Web, Mobile (iOS/Android), Desktop, Cloud

I choose the best technology based on your project needs. Whether you need a quick MVP or enterprise-grade system, I've got you covered.

Want to discuss which tech is best for your project? Click here to chat with me directly.`,
    cta: 'Discuss the right tech',
    draftSubject: 'Tech stack question',
  },
  {
    id: 'services',
    label: 'Services & Expertise',
    keywords: [
      'service',
      'services',
      'do you',
      'can you',
      'offer',
      'build',
      'develop',
      'create',
    ],
    response: `I specialize in:
1. **Full Stack Development** - Complete web/mobile solutions
2. **UI/UX Design** - Beautiful, user-friendly interfaces
3. **Database Design** - Scalable and secure systems
4. **Mobile Apps** - Native and cross-platform (React Native)
5. **Enterprise Systems** - Large-scale, production-grade applications
6. **Consulting** - Project planning and architecture

Whether it's a startup MVP, business system, or enterprise application, I build with quality and performance in mind.

Let me know what you need. Click here to tell me more about your project.`,
    cta: 'Tell me about your project',
    draftSubject: 'Services inquiry',
  },
  {
    id: 'process',
    label: 'Process & Workflow',
    keywords: [
      'process',
      'workflow',
      'how do you work',
      'methodology',
      'steps',
      'approach',
    ],
    response: `My Development Process:
1. **Discovery** - Understand your requirements and goals
2. **Planning** - Define scope, timeline, and deliverables
3. **Design** - Create wireframes and UI/UX designs
4. **Development** - Build your project with clean, scalable code
5. **Testing** - Comprehensive testing and quality assurance
6. **Deployment** - Launch to production with support
7. **Maintenance** - Ongoing support and updates

I communicate regularly, provide progress updates, and ensure you're involved every step of the way.

Ready to start? Click here to send me your project details.`,
    cta: 'Get started',
    draftSubject: 'Ready to start a project',
  },
  {
    id: 'availability',
    label: 'Availability & Response Time',
    keywords: [
      'available',
      'availability',
      'when',
      'start',
      'begin',
      'available now',
      'urgent',
      'asap',
    ],
    response: `Current Availability:
- I actively take new projects
- Typical response time: Within 24 hours
- Project start: 1-2 weeks from agreement

I balance quality work with reasonable timelines. Each project gets my full attention and expertise.

If you have an urgent timeline, let me know your requirements and we can discuss feasibility.

Click here to reach out about your project timeline.`,
    cta: 'Check availability',
    draftSubject: 'Availability question',
  },
  {
    id: 'contact',
    label: 'Contact & Rates',
    keywords: [
      'contact',
      'email',
      'phone',
      'rate',
      'hourly',
      'fixed',
      'payment',
    ],
    response: `I prefer project-based pricing over hourly rates, as it's clearer for budgeting and ensures commitment to quality.

The best way to connect:
1. **Email**: Direct message through this chat
2. **Contact Form**: Visit my contact page (click here)
3. **Response Time**: Within 24 hours

For detailed discussions, I'm happy to schedule a call to understand your project better.

Let me know how I can help!`,
    cta: 'Go to contact page',
    draftSubject: 'Getting in touch',
  },
  {
    id: 'portfolio',
    label: 'Portfolio & Past Work',
    keywords: [
      'portfolio',
      'projects',
      'work',
      'examples',
      'case study',
      'past',
      'clients',
    ],
    response: `I've built several production-grade applications:

1. **Restaurant POS System** - Desktop application for Philippine restaurants
2. **Expense Tracker Mobile App** - React Native with offline capabilities
3. **Dental Clinic System** - Full practice management with scheduling & billing
4. **Onboarding Platform** - Enterprise employee onboarding with real-time syncing

Each project showcases different technologies and expertise. You can explore them on my portfolio page.

Interested in seeing how I might help your project? Click here to contact me.`,
    cta: 'Contact me about a project',
    draftSubject: 'Question about your portfolio',
  },
];

export const FALLBACK_RESPONSE = `I didn't quite understand your question. Here are some things I can help with:

- \u{1F4B0} Project Pricing & Quotes
- ⏱️ Timelines & Availability
- \u{1F4BB} Technologies & Services
- \u{1F4CB} My Development Process
- \u{1F91D} How to Work With Me
- \u{1F4C1} My Portfolio & Projects

Or, you can ask me anything else and I'll do my best to help! If I can't answer, I'll connect you directly with Sonny.

What would you like to know?`;

export const SUGGESTED_QUESTIONS = [
  { text: 'How much does a project cost?' },
  { text: "What's your development process?" },
  { text: 'What technologies do you use?' },
];

export const FALLBACK_SUGGESTIONS = SUGGESTED_QUESTIONS;

export const GREETING_MESSAGE =
  "Hi! I'm Sonny's virtual assistant. Ask me about pricing, timelines, tech stack, or anything else about working with Sonny — I'm here to help!";

export function findCategoryById(id) {
  return CHAT_CATEGORIES.find((category) => category.id === id) ?? null;
}
