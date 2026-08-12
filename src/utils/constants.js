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
  SiN8N,
} from 'react-icons/si';
import { VscVscode } from 'react-icons/vsc';
import { FaDatabase, FaVideo, FaCamera, FaPencilRuler } from 'react-icons/fa';
import restaurantPosImage from '../assets/logo/restaurant-pos.jpg';
import expenseTrackerImage from '../assets/logo/expense-tracker.jpg';
import dentalClinicImage from '../assets/logo/dental-clinic.jpg';
import onboardingAppImage from '../assets/logo/onboarding-app.jpg';

export const PROFILE = {
  name: 'Sonny',
  title: 'Full Stack Developer, IT Specialist, Automations, Social Media Manager',
  email: 'sonnyl@thecreditpros.com',
  github: 'https://github.com/sonnyllarena-git',
  bio:
    "As a full-stack developer and IT specialist, I design production software, automate complex business processes, and maintain the infrastructure that powers daily operations. Beyond engineering, I produce and manage social content with a mix of technical rigor and creative direction. My goal is simple: create fast, reliable, and high-impact solutions—from smart automations and clean code to engaging media.",
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
  { name: 'LinkedIn', icon: FaLinkedin, url: 'https://www.linkedin.com/in/sonny-llarena-a8956130b/' },
  { name: 'YouTube', icon: FaYoutube, url: 'https://www.youtube.com/@llarenachannel' },
  { name: 'Facebook', icon: FaFacebook, url: 'https://www.facebook.com/profile.php?id=100045247046713' },
  { name: 'TikTok', icon: FaTiktok, url: 'https://www.tiktok.com/@llarenachannel' },
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
    image: restaurantPosImage,
    keyMetric: 'Cash-first POS built for offline-first restaurant floors',
    features: ['Order Management', 'Inventory Tracking', 'Sales Reports', 'Kitchen Display'],
  },
  {
    id: 2,
    title: 'Expense Tracker Mobile App',
    description:
      'Mobile expense tracker with budgets, recurring expenses, receipt photos, and spending analytics.',
    github: 'https://github.com/sonnyllarena-git/expenses-tracker-app',
    tech: ['React Native', 'Expo Router', 'Drizzle ORM', 'SQLite'],
    image: expenseTrackerImage,
    keyMetric: 'Full budgeting suite in a single mobile app',
    features: ['Budget Planning', 'Recurring Expenses', 'Receipt Photos', 'Spending Analytics'],
  },
  {
    id: 3,
    title: 'Dental Clinic System',
    description:
      'Production-grade dental practice management system covering patient records, scheduling, treatment planning, billing, inventory, and analytics.',
    github: 'https://github.com/sonnyllarena-git/dental-clinic-crm',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    image: dentalClinicImage,
    keyMetric: 'Production system running a full dental practice',
    features: ['Patient Records', 'Scheduling', 'Treatment Planning', 'Billing & Inventory'],
  },
  {
    id: 4,
    title: 'Onboarding App',
    description:
      'Employee Onboarding/Offboarding Portal — an enterprise platform built from zero to production with real-time platform syncing, a 99.9% uptime SLA, and self-service error recovery.',
    image: onboardingAppImage,
    github: 'https://github.com/sonnyllarena-git/tcp-onboarding-app',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Real-time APIs'],
    keyMetric: '99.9% uptime SLA in production',
    features: ['Real-Time Platform Sync', 'Self-Service Error Recovery', 'Zero-to-Production Build', 'Enterprise-Grade Reliability'],
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
      { name: 'N8N', icon: SiN8N },
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
