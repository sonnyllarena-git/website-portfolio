import { SKILLS } from '../utils/constants';

// Devicon CDN slugs + keycap colors per skill name. Keyed by name (not category)
// so it stays correct if a skill moves between categories in constants.js.
const ICON_BY_NAME = {
  JavaScript: 'javascript/javascript-original.svg',
  Python: 'python/python-original.svg',
  SQL: 'azuresqldatabase/azuresqldatabase-original.svg',
  TypeScript: 'typescript/typescript-original.svg',
  HTML: 'html5/html5-original.svg',
  CSS: 'css3/css3-original.svg',
  React: 'react/react-original.svg',
  'React Native': 'react/react-original.svg',
  'Node.js': 'nodejs/nodejs-original.svg',
  Electron: 'electron/electron-original.svg',
  Express: 'express/express-original.svg',
  Vite: 'vite/vite-original.svg',
  'Git & GitHub': 'git/git-original.svg',
  Jira: 'jira/jira-original.svg',
  Docker: 'docker/docker-original.svg',
  PostgreSQL: 'postgresql/postgresql-original.svg',
  SQLite: 'sqlite/sqlite-original.svg',
  'VS Code': 'vscode/vscode-original.svg',
  Figma: 'figma/figma-original.svg',
  N8N: 'nodejs/nodejs-original.svg',
  'Video Editing': 'premierepro/premierepro-plain.svg',
  'Photo Editing': 'photoshop/photoshop-plain.svg',
  'Content Creation': 'canva/canva-original.svg',
};

const COLOR_BY_NAME = {
  JavaScript: '#1A1A1A',
  TypeScript: '#1A1A1A',
  Python: '#A0A0A0',
  SQL: '#FF6B00',
  HTML: '#FF6B00',
  CSS: '#1A1A1A',
  React: '#1A1A1A',
  'React Native': '#FF6B00',
  'Node.js': '#A0A0A0',
  Electron: '#1A1A1A',
  Express: '#A0A0A0',
  Vite: '#FF6B00',
  'Git & GitHub': '#FF6B00',
  Jira: '#1A1A1A',
  Docker: '#A0A0A0',
  PostgreSQL: '#1A1A1A',
  SQLite: '#A0A0A0',
  'VS Code': '#1A1A1A',
  Figma: '#FF6B00',
  N8N: '#A0A0A0',
  'Video Editing': '#FF6B00',
  'Photo Editing': '#1A1A1A',
  'Content Creation': '#A0A0A0',
};

const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/';

export const PORTFOLIO_STACK = SKILLS.flatMap((group) =>
  group.items.map((skill) => ({
    name: skill.name,
    category: group.category,
    color: COLOR_BY_NAME[skill.name] ?? '#A0A0A0',
    icon: `${DEVICON_BASE}${ICON_BY_NAME[skill.name] ?? 'devicon/devicon-original.svg'}`,
  }))
);
