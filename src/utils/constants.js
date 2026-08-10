import {
  FaGithub,
  FaLinkedin,
  FaYoutube,
  FaFacebook,
  FaTiktok,
} from 'react-icons/fa';
import {
  SiJavascript,
  SiPython,
  SiPostgresql,
  SiHtml5,
  SiCss,
  SiTypescript,
  SiReact,
  SiElectron,
  SiNodedotjs,
  SiExpress,
  SiVite,
  SiGit,
  SiJira,
  SiDocker,
  SiSqlite,
  SiFigma,
} from 'react-icons/si';
import { VscVscode } from 'react-icons/vsc';
import { FaDatabase, FaVideo, FaCamera, FaPencilRuler } from 'react-icons/fa';

export const PROFILE = {
  name: 'Sonny',
  title: 'Full Stack Developer, IT Specialist, Social Media Manager',
  email: 'sonnyl@thecreditpros.com',
  github: 'https://github.com/sonnyllarena-git',
  bio:
    "I'm a full stack developer and IT specialist at The Credit Pros, where I build production software, keep systems running, and manage the tools that power the business day to day. Outside of engineering, I create and manage content across social platforms, blending technical precision with a creative eye. I care about building things that are fast, dependable, and genuinely useful — whether that's a line of code, a piece of infrastructure, or a piece of content.",
  skillsAreList: [
    'React & React Native',
    'Node.js & Express',
    'PostgreSQL & SQLite',
    'IT Systems & Support',
    'Video & Content Production',
  ],
};

export const SOCIAL_LINKS = [
  { name: 'GitHub', icon: FaGithub, url: 'https://github.com/sonnyllarena-git' },
  { name: 'LinkedIn', icon: FaLinkedin, url: '' },
  { name: 'YouTube', icon: FaYoutube, url: '' },
  { name: 'Facebook', icon: FaFacebook, url: '' },
  { name: 'TikTok', icon: FaTiktok, url: '' },
];

export const NAV_LINKS = [
  { name: 'Home', to: 'home' },
  { name: 'About', to: 'about' },
  { name: 'Projects', to: 'projects' },
  { name: 'Skills', to: 'skills' },
  { name: 'Learning', to: 'learning' },
  { name: 'Contact', to: 'contact' },
];

export const PROJECTS = [
  {
    id: 1,
    title: 'Restaurant POS System',
    description:
      'Local desktop POS system for Philippine restaurants — cash-first, minimalist design. Phase 1 covers ordering, inventory, reports, and kitchen display.',
    github: 'https://github.com/sonnyllarena-git/restaurant-pos-system-app',
    tech: ['React', 'Electron', 'SQLite', 'Node.js'],
  },
  {
    id: 2,
    title: 'Expense Tracker Mobile App',
    description:
      'Mobile expense tracker with budgets, recurring expenses, receipt photos, and spending analytics. Offline-first — all data stored locally on device.',
    github: 'https://github.com/sonnyllarena-git/expenses-tracker-app',
    tech: ['React Native', 'Expo Router', 'Drizzle ORM', 'SQLite'],
  },
  {
    id: 3,
    title: 'Dental Clinic System',
    description:
      'Production-grade dental practice management system covering patient records, scheduling, treatment planning, billing, inventory, and analytics.',
    github: 'https://github.com/sonnyllarena-git/dental-clinic-crm',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
  },
  {
    id: 4,
    title: 'Onboarding App',
    description:
      'Employee Onboarding/Offboarding Portal — an enterprise platform built from zero to production with real-time platform syncing, a 99.9% uptime SLA, and self-service error recovery.',
    github: 'https://github.com/sonnyllarena-git/tcp-onboarding-app',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Real-time APIs'],
  },
];

export const SKILLS = [
  {
    category: 'Languages',
    items: [
      { name: 'JavaScript', icon: SiJavascript },
      { name: 'Python', icon: SiPython },
      { name: 'SQL', icon: FaDatabase },
      { name: 'TypeScript', icon: SiTypescript },
      { name: 'HTML', icon: SiHtml5 },
      { name: 'CSS', icon: SiCss },
    ],
  },
  {
    category: 'Frameworks & Libraries',
    items: [
      { name: 'React', icon: SiReact },
      { name: 'React Native', icon: SiReact },
      { name: 'Node.js', icon: SiNodedotjs },
      { name: 'Electron', icon: SiElectron },
      { name: 'Express', icon: SiExpress },
      { name: 'Vite', icon: SiVite },
    ],
  },
  {
    category: 'Tools & Platforms',
    items: [
      { name: 'Git & GitHub', icon: SiGit },
      { name: 'Jira', icon: SiJira },
      { name: 'Docker', icon: SiDocker },
      { name: 'PostgreSQL', icon: SiPostgresql },
      { name: 'SQLite', icon: SiSqlite },
      { name: 'VS Code', icon: VscVscode },
      { name: 'Figma', icon: SiFigma },
    ],
  },
  {
    category: 'Multimedia',
    items: [
      { name: 'Video Editing', icon: FaVideo },
      { name: 'Photo Editing', icon: FaCamera },
      { name: 'Content Creation', icon: FaPencilRuler },
    ],
  },
];
