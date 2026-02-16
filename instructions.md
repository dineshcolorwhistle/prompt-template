You are helping build a production-grade SaaS web application called:

"Industry-Tested Prompt Template Platform"

This is a MERN stack application deployed on a VPS.

CRITICAL PRODUCT DEFINITION:

This platform is a curated marketplace for ready-to-use AI prompt templates.

It is NOT:
- A chatbot
- An AI execution platform
- A prompt generator
- A conversational assistant

It DOES NOT run AI models.

It only stores, customizes, and lets users copy prompt templates.



==================================================
CORE CONCEPT
==================================================

Users browse structured prompt templates.

Each template has:
- Fixed tone
- Fixed output format
- Fixed structure
- Editable predefined variables only

Users replace variables and copy the final prompt to use elsewhere.

No AI execution happens inside the app.



==================================================
TECH STACK
==================================================

Frontend:
- React (Vite or Next.js)
- Tailwind CSS
- React Query
- Framer Motion
- Zustand or Redux Toolkit

Backend:
- Node.js
- Express
- MongoDB Atlas
- JWT auth
- bcrypt

Infra:
- Ubuntu VPS
- Nginx reverse proxy
- PM2 process manager
- CI/CD via GitHub Actions



==================================================
USER ROLES
==================================================

Guest:
- Browse templates
- View sample outputs
- View ratings
- Cannot copy or rate

Registered User:
- Copy prompts
- Edit variables
- Save templates
- Rate effectiveness
- Comment
- Upvote
- Apply as expert

Expert (Provisional):
- Submit templates
- Edit own templates
- Respond to comments
- View performance analytics

Expert (Verified):
- Auto-upgraded when criteria met
- Has badge

Admin:
- Approve experts
- Approve templates
- Manage industries/categories
- Moderate comments
- View analytics



==================================================
TEMPLATE ENGINE RULES
==================================================

Templates contain:
- Title
- Industry
- Category
- Use case
- Locked tone
- Locked output format
- Locked structure
- Variables with default values
- Sample output
- Repurposing ideas
- Status

Variables:
- name
- description
- defaultValue
- required flag

All variables must have defaults.

Prompt generation is simple string replacement like:
{{variable_name}} → user value.

No AI processing.



==================================================
RATING SYSTEM
==================================================

Users rate effectiveness in ranges:
- 0–10%
- 10–50%
- 50–80%
- 80–100%

Each user can rate once per template.

Store:
- modelUsed
- industryContext
- goal

Show:
- Average effectiveness
- Total testers
- Breakdowns



==================================================
EXPERT SYSTEM
==================================================

Application fields:
- Primary industry
- Years of experience
- Portfolio
- Sample prompt
- Methodology

Verified Expert Criteria:
- 3+ approved templates
- 50+ ratings
- 70%+ average effectiveness
- No moderation flags



==================================================
COMMUNITY
==================================================

- Threaded comments
- Report comment
- Admin moderation queue
- Expert responses



==================================================
ADMIN DASHBOARD
==================================================

Admin can:
- Manage users
- Approve templates
- Approve experts
- Manage industries
- Manage categories
- Moderate comments
- View analytics

Admin UI should be functional, not fancy.



==================================================
UI/UX PRINCIPLES
==================================================

Style:
- Clean
- Modern SaaS
- Minimal
- High whitespace
- Card-based layout

Layout:
- 12-column grid
- Max width 1280px
- 8px spacing system
- Rounded corners 12px

Template Cards show:
- Title
- Industry tag
- Effectiveness %
- Expert badge
- Description

Buttons:
- Primary filled
- Secondary outline
- Loading + disabled states
- Copy success toast

Dark mode supported.



==================================================
MVP SCOPE (STRICT)
==================================================

Include:
- Email/password auth
- Role system
- Template engine
- Variable personalization UI
- Copy functionality
- Ratings
- Upvotes
- Comments
- Expert applications
- Admin approvals
- Basic analytics

Exclude:
- AI execution
- Payments
- Subscriptions
- Team workspaces
- Monetization
- Template forking



==================================================
ENGINEERING GUIDELINES
==================================================

- Use REST APIs
- Use MongoDB aggregation for analytics
- Use pagination everywhere
- Index templateId and userId fields
- Keep architecture simple (no microservices)
- Prefer readable code over clever code
- Build vertical slices (end-to-end features)



==================================================
INITIAL TASK
==================================================

First:
1) Design MongoDB schemas
2) Create Express API structure
3) Implement JWT auth with roles
4) Scaffold React frontend structure
5) Implement template CRUD
6) Implement variable-based prompt generation

Always respect product rules and MVP limits.

Never add AI features or chatbot functionality unless explicitly requested.
