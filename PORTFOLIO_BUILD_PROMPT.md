# Modern Portfolio Website - Complete Build Prompt for Claude Code

## Context
You are building a modern, professional portfolio website for Sonny at The Credit Pros Engineering (IT Department). The website is a single-page application (SPA) showcasing professional expertise, projects, skills, and includes a functional contact form with real email integration.

## Design Reference
- **Style**: Minimalist, modern, clean
- **Color Scheme**: Light gray background (#F5F5F5) + black text + orange accent (#FF6B35)
- **Features**: Decorative elements (lines, squares), smooth hover effects, dark mode toggle, responsive design
- **Reference Design**: Rian Lot portfolio style (from the video reference)

## Tech Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v3 (with dark mode support)
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Icons**: React Icons
- **Email Backend**: Supabase + SendGrid edge function
- **Hosting**: Vercel (with GitHub integration)

## Professional Information
- **Name**: Sonny
- **Title**: Full Stack Developer, IT Specialist, Social Media Manager
- **Email**: sonnyl@thecreditpros.com
- **Bio**: (Balanced focus on development + IT operations + digital content creation)
- **GitHub**: https://github.com/sonnyllarena-git

## Projects to Showcase (4 total)

### 1. Restaurant POS System
- **Description**: Local desktop POS system for Philippine restaurants. Cash-first, minimalist design. Phase 1: Ordering, inventory, reports, kitchen display.
- **GitHub**: https://github.com/sonnyllarena-git/restaurant-pos-system-app
- **Tech**: React, Electron, SQLite, Node.js

### 2. Expense Tracker Mobile App
- **Description**: Mobile expense tracker with budgets, recurring expenses, receipt photos, and spending analytics. Offline-first — all data stored locally on device.
- **GitHub**: https://github.com/sonnyllarena-git/expenses-tracker-app
- **Tech**: React Native, Expo Router, Drizzle ORM, SQLite

### 3. Dental Clinic System
- **Description**: Production-grade dental practice management system. Patient records, scheduling, treatment planning, billing, inventory, and analytics.
- **GitHub**: https://github.com/sonnyllarena-git/dental-clinic-crm
- **Tech**: React, Node.js, PostgreSQL, Stripe

### 4. Onboarding App
- **Description**: Employee Onboarding/Offboarding Portal - Enterprise platform built from zero to production with real-time platform syncing, 99.9% uptime SLA, and self-service error recovery.
- **GitHub**: https://github.com/sonnyllarena-git/tcp-onboarding-app
- **Tech**: React, Node.js, PostgreSQL, Real-time APIs

## Skills to Display

### Languages
- JavaScript, Python, SQL, HTML, CSS, TypeScript

### Frameworks & Libraries
- React, React Native, Electron, Node.js, Express, Vite

### Tools & Platforms
- Git & GitHub, Jira, Docker, PostgreSQL, SQLite, VS Code, Figma

### Multimedia Skills
- Video Editing, Photo Editing, Content Creation

## Social Media Links (to add later)
- GitHub: https://github.com/sonnyllarena-git
- LinkedIn: [to be provided]
- YouTube: [to be provided]
- Facebook: [to be provided]
- TikTok: [to be provided]

## Website Sections Required

### 1. **Navbar** (Fixed, responsive)
- Logo with "S" initial
- Navigation links: Home, About, Projects, Skills, Learning, Contact
- "Contact Me" button (black background, black border, white text)
- Dark mode toggle (sun/moon icon)
- Mobile hamburger menu
- Smooth active link styling

### 2. **Hero Section** (Full viewport height)
- Large name "Sonny" in bold
- Subtitle: "Full Stack Developer, IT Specialist, Social Media Manager"
- Placeholder profile image box (with border, ready for photo)
- Decorative SVG elements (curved lines, small orange squares)
- "Scroll Down" button with arrow animation
- Social links sidebar (GitHub, LinkedIn, YouTube, Facebook, TikTok icons only - no links yet)

### 3. **About Section** (Two-column layout)
- Left: Profile image placeholder with decorative frame and elements
- Right:
  - "About Me." heading (with orange underline)
  - Short bio about expertise (balanced: dev + IT + social)
  - "My Skills Are:" bullet list of key technologies
  - Orange accent bar separator at bottom

### 4. **Skills Section** (Grid layout)
- Title: "Skills" with orange highlight
- Card-based grid (3-4 columns desktop, 2 tablet, 1 mobile)
- Skill categories with icons:
  - Languages (JavaScript, Python, SQL, TypeScript, HTML, CSS)
  - Frameworks (React, React Native, Node.js, Electron, Express)
  - Tools (Git, Jira, Docker, PostgreSQL, SQLite, Figma, VS Code)
  - Multimedia (Video Editing, Photo Editing, Content Creation)
- Hover effect: lift card, orange accent highlight

### 5. **Projects Section** (Grid layout - 3 columns desktop)
- Title: "Projects." with orange highlight
- Project cards (4 total):
  - Placeholder image area (gray box)
  - Project title
  - Project description (1-2 sentences)
  - Tech stack tags
  - "View" button (GitHub link) + "View Code" button
  - Hover effect: shadow, slight scale

### 6. **Learning Section** (Landing page only)
- Title: "Learning & Courses"
- Placeholder content: "Expanding knowledge and skills"
- Message: "More courses coming soon"
- Ready for course details to be added later

### 7. **Contact Section** (Two-column layout)
- Left:
  - "Contact Me." heading with orange highlight
  - Description text: "I will read all emails. Send me any message you want and I'll get back to you."
  - "I need your Name and Email Address, but you won't receive anything other than your reply"
  - Orange accent bar
  - Social icons (GitHub, LinkedIn, YouTube, Facebook, TikTok) - links to be added later
  
- Right:
  - Dark background form (#1A1A1A)
  - "Send Me A Message" heading
  - Form fields:
    - First Name (required)
    - Email Address (required)
    - Subject (required)
    - Message (textarea, required)
  - "Send Message" button (orange background, hover effect)
  - Loading state during submission
  - Success message: "Message sent! I'll get back to you soon."
  - Error handling with user-friendly messages

### 8. **Footer**
- Simple footer with copyright and quick links
- Social icons

## Design System Details

### Color Palette
```
Background Light: #F5F5F5
Background Dark: #1A1A1A
Text Dark: #000000
Text Light: #FFFFFF
Accent Orange: #FF6B35
Border: #E0E0E0
Gray Secondary: #9CA3AF
```

### Typography
- Headings: Bold, large (use Tailwind size utilities)
- Body: Regular weight, readable
- Accent text: Orange color for highlights/underlines

### Spacing & Layout
- Sections have generous padding (vertical spacing)
- Two-column layouts on desktop, stacked on mobile
- Grid layouts responsive: 3/2/1 columns (desktop/tablet/mobile)

### Animations & Effects
- Smooth page transitions
- Hover effects on buttons (scale, shadow shift)
- Card hover effects (lift, shadow)
- Scroll animations (fade in elements)
- Decorative line animations (SVG stroke animations)
- Navbar shadow appears on scroll
- Dark mode toggle smoothly transitions colors

### Responsive Breakpoints
- Mobile: < 640px (single column, hamburger menu)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (3+ columns, full features)

## Email Integration (Supabase + SendGrid)

### Setup Requirements
1. Create Supabase project
2. Create `messages` table:
   - id (UUID primary key)
   - name (text)
   - email (text)
   - subject (text)
   - message (text)
   - created_at (timestamp)
   - status (text: 'pending', 'sent')

3. Set up SendGrid:
   - Create SendGrid API key
   - Add to Supabase as environment variable

4. Create Supabase Edge Function `send-email`:
   - Receives: {name, email, subject, message}
   - Validates input
   - Sends email via SendGrid
   - Stores in messages table
   - Returns: {success: true, message: "..."}

### Form Validation
- Name: required, minimum 2 characters
- Email: required, valid email format
- Subject: required, minimum 3 characters
- Message: required, minimum 10 characters

## Implementation Steps

### Phase 1: Project Setup
1. Create Vite React project: `npm create vite@latest portfolio -- --template react`
2. Install dependencies:
   ```
   npm install react-router-dom framer-motion react-icons
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   npm install @supabase/supabase-js
   ```
3. Configure Tailwind CSS with custom colors
4. Create folder structure (components, pages, context, utils, styles, assets)

### Phase 2: Build Components (in order)
1. ThemeContext (dark mode state)
2. Navbar component
3. Hero section
4. About section
5. Skills section
6. Projects section
7. Learning section
8. Contact section (form + email integration)
9. Footer

### Phase 3: Styling
1. Setup Tailwind configuration with custom color palette
2. Create global styles (globals.css)
3. Add animation utilities
4. Implement dark mode (class-based)

### Phase 4: Content & Data
1. Create `utils/constants.js` with:
   - Professional info
   - Skills data
   - Projects data
   - Social links (with placeholders)

2. Create `utils/email.js` for Supabase email client

### Phase 5: Features
1. Implement dark mode toggle (persist to localStorage)
2. Implement smooth scrolling navigation
3. Implement contact form with validation
4. Implement email sending via Supabase
5. Add hover effects and animations

### Phase 6: Responsive Design
1. Test on mobile, tablet, desktop
2. Fix hamburger menu for mobile
3. Ensure all sections stack properly on mobile
4. Test touch interactions

### Phase 7: Optimization & Deployment
1. Code splitting and lazy loading
2. Image optimization
3. Performance audit (Lighthouse)
4. Accessibility checks (WCAG)
5. Deploy to Vercel with GitHub

## Placeholder Content Until User Provides
- Profile photo (use gray placeholder box)
- LinkedIn, YouTube, Facebook, TikTok URLs (icons visible, links added later)
- Learning/Courses details (landing page ready)

## Success Criteria
- ✅ All sections render correctly
- ✅ Dark/light mode toggle works (persists on reload)
- ✅ Contact form submits and sends email
- ✅ Responsive on all devices
- ✅ Hover effects smooth and visible
- ✅ All GitHub links work
- ✅ No console errors
- ✅ Lighthouse score > 85
- ✅ Deployed to Vercel

## Notes
- Use simple client-side form validation
- Use React Icons for all social/action icons
- Use Framer Motion for smooth animations
- Keep decorative elements simple (SVG lines, squares)
- No external image requirements (use placeholders)
- All content managed in constants.js (no database for static content)
- Git workflow: initialize repo, push to GitHub, connect to Vercel for auto-deploy

## Start Building!
Initialize the project and begin with the folder structure and Tailwind configuration. Then build components in the specified order. Good luck! 🚀
