# PromptMarket — Industry-Tested Prompt Template Platform

A curated MERN-stack marketplace where experts publish structured AI prompt templates and users browse, personalize variables, and copy the final prompt for use in any LLM. The platform **does not** execute AI models — it is a management and distribution tool for prompts.

## Table of Contents

- [Core Concept](#core-concept)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Seeder](#database-seeder)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Frontend Architecture](#frontend-architecture)
- [Key Features](#key-features)
- [Deployment](#deployment)
- [License](#license)

---

## Core Concept

Each template ships with a **locked tone, output format, and structural instruction**. The only thing users change are predefined **variables** (e.g. `{{company_name}}`, `{{target_audience}}`). The app performs simple string replacement — `{{variable}}` becomes the user's value — and the user copies the assembled prompt to paste into ChatGPT, Claude, Gemini, or any other LLM.

**What this platform is:**
- A library/marketplace for structured prompt templates
- A variable-based personalization engine
- A community with ratings, upvotes, and threaded comments

**What this platform is NOT:**
- A chatbot or conversational AI
- An AI execution or inference platform
- A prompt auto-generator

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 7 | Build tool and dev server |
| Tailwind CSS 3 | Utility-first styling |
| Framer Motion 12 | Page transitions and animations |
| React Router DOM 7 | Client-side routing |
| Lucide React | Icon library |
| react-hot-toast | Toast notifications |
| clsx + tailwind-merge | Conditional class utilities |

### Backend

| Technology | Purpose |
|---|---|
| Express 5 | HTTP framework |
| Mongoose 9 | MongoDB ODM |
| JWT (jsonwebtoken) | Authentication tokens |
| bcrypt | Password hashing |
| Multer | File upload handling |
| Nodemailer | Transactional emails |
| Helmet | Security headers |
| Morgan | HTTP request logging |

### Infrastructure

| Technology | Purpose |
|---|---|
| MongoDB Atlas | Database |
| Ubuntu VPS | Hosting |
| Nginx | Reverse proxy |
| PM2 | Process manager |
| GitHub Actions | CI/CD pipeline |

---

## Project Structure

```
prompt-template/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── animations/
│   │   │   └── index.js             # Framer Motion animation variants
│   │   ├── components/
│   │   │   ├── AdminTemplateModal.jsx
│   │   │   ├── ConfirmationModal.jsx
│   │   │   ├── DashboardLayout.jsx   # Sidebar layout for Expert/Admin
│   │   │   ├── Layout.jsx            # Public pages layout (Navbar + Footer)
│   │   │   ├── Navbar.jsx            # Search bar, filters, auth, mobile menu
│   │   │   ├── PageTransition.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── PlaceholderPage.jsx
│   │   │   ├── RequestExpertModal.jsx
│   │   │   ├── TemplateCard.jsx      # Card with star ratings, badges
│   │   │   ├── TemplateModal.jsx     # Create/edit template form
│   │   │   └── Toast.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state (localStorage + token refresh)
│   │   ├── hooks/
│   │   │   └── useDebounce.js        # Generic debounce hook
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Public template browsing
│   │   │   ├── TemplateDetails.jsx   # Full template view, variables, copy, comments, ratings
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── SetPassword.jsx       # Token-based password setup
│   │   │   ├── DashboardOverview.jsx # Stats for Expert/Admin
│   │   │   ├── Templates.jsx         # Admin: manage all templates
│   │   │   ├── MyTemplates.jsx       # Expert: manage own templates
│   │   │   ├── Users.jsx             # Admin: manage users
│   │   │   ├── ExpertRequests.jsx    # Admin: approve/reject expert applications
│   │   │   ├── LLMs.jsx             # Admin: CRUD for LLM models
│   │   │   ├── Industries.jsx        # Admin: CRUD for industries
│   │   │   └── Categories.jsx        # Admin: CRUD for categories
│   │   ├── App.jsx                   # Route definitions
│   │   ├── App.css
│   │   ├── index.css                 # Tailwind directives
│   │   └── main.jsx                  # Entry point
│   └── package.json
│
├── server/                           # Express backend
│   ├── controllers/
│   │   ├── authController.js         # Register, login, set-password
│   │   ├── userController.js         # User CRUD, admin invitation
│   │   ├── templateController.js     # Template CRUD with image handling
│   │   ├── llmController.js          # LLM CRUD with logo upload
│   │   ├── industryController.js     # Industry CRUD
│   │   ├── categoryController.js     # Category CRUD
│   │   ├── commentController.js      # Threaded comments
│   │   ├── ratingController.js       # Effectiveness ratings + upvotes
│   │   └── expertRequestController.js# Expert application workflow
│   ├── middleware/
│   │   └── authMiddleware.js         # protect, admin, optionalAuth
│   ├── models/
│   │   ├── User.js
│   │   ├── Template.js
│   │   ├── LLM.js
│   │   ├── Industry.js
│   │   ├── Category.js
│   │   ├── Comment.js
│   │   ├── Rating.js
│   │   ├── Upvote.js
│   │   └── ExpertRequest.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── templateRoutes.js
│   │   ├── llmRoutes.js
│   │   ├── industryRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── ratingRoutes.js
│   │   └── expertRequestRoutes.js
│   ├── utils/
│   │   ├── generateToken.js          # JWT token generation (30-day expiry)
│   │   └── sendEmail.js              # Nodemailer transport
│   ├── uploads/                      # Static file storage
│   │   ├── llm-logos/
│   │   └── templates/
│   │       └── temp/                 # Temporary upload staging
│   ├── index.js                      # Express app entry point
│   ├── seeder.js                     # Admin user seed script
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml                # GitHub Actions CI/CD
├── ecosystem.config.js               # PM2 configuration
├── instructions.md                   # Product specification
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local instance or Atlas URI)
- **SMTP credentials** for transactional emails (registration, expert approvals)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd prompt-template
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in `server/` (see [Environment Variables](#environment-variables)), then start the dev server:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Setup Frontend

```bash
cd client
npm install
```

Create a `.env` file in `client/` with:

```env
VITE_API_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`.

### 4. Seed the Admin User

```bash
cd server
node seeder.js
```

This creates the initial admin account. Update credentials in `seeder.js` before running.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/prompt-template` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_jwt_secret_key` |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_SECURE` | Use TLS (`true` for port 465) | `false` |
| `SMTP_USER` | Email account username | `you@example.com` |
| `SMTP_PASS` | Email account password or app password | `your_app_password` |
| `SMTP_FROM` | Sender address shown in emails | `PromptMarket <noreply@example.com>` |

### Client (`client/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

---

## Database Seeder

Run the seeder to create the first admin user:

```bash
cd server
node seeder.js
```

Edit `seeder.js` to change the default admin name, email, and password before running. The seeder is idempotent — it skips creation if the admin email already exists.

---

## User Roles and Permissions

| Capability | Guest | User | Expert | Admin |
|---|:---:|:---:|:---:|:---:|
| Browse templates | Yes | Yes | Yes | Yes |
| View sample outputs | Yes | Yes | Yes | Yes |
| View ratings | Yes | Yes | Yes | Yes |
| Personalize variables and copy prompt | — | Yes | Yes | Yes |
| Rate template effectiveness | — | Yes | Yes | Yes |
| Upvote templates | — | Yes | Yes | Yes |
| Comment on templates | — | Yes | Yes | Yes |
| Apply to become an expert | — | Yes | — | — |
| Submit and manage own templates | — | — | Yes | Yes |
| View template performance stats | — | — | Yes | Yes |
| Manage all users | — | — | — | Yes |
| Approve/reject expert requests | — | — | — | Yes |
| Approve/reject templates | — | — | — | Yes |
| Manage LLMs, Industries, Categories | — | — | — | Yes |
| Moderate comments | — | — | — | Yes |
| Invite new admins | — | — | — | Yes |

### Registration Flow

1. User signs up with name and email
2. A temporary password is generated (user never sees it)
3. A set-password email is sent with a 24-hour token link
4. User clicks the link and sets their password
5. User can now log in

### Expert Application Flow

1. Authenticated user submits an expert request with details
2. All admins receive an email notification
3. Admin approves or rejects from the dashboard
4. On approval: user role changes to Expert and an approval email is sent
5. On rejection: a rejection email is sent

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| name | String | Required |
| email | String | Required, unique, lowercase |
| password | String | Hashed with bcrypt (salt 10) |
| role | Enum | `User`, `Expert`, `Admin` (default: `User`) |
| isVerifiedExpert | Boolean | Badge indicator (default: `false`) |
| resetPasswordToken | String | SHA-256 hashed token for password setup |
| resetPasswordExpire | Date | Token expiry timestamp |

### LLM
| Field | Type | Notes |
|---|---|---|
| name | String | Required, unique |
| slug | String | Required, unique, auto-generated |
| description | String | Optional |
| icon | String | File path to uploaded logo |
| isActive | Boolean | Soft-delete flag (default: `true`) |

### Industry
| Field | Type | Notes |
|---|---|---|
| llm | ObjectId → LLM | Required, parent LLM reference |
| name | String | Required, unique |
| slug | String | Required, unique |
| description | String | Optional |
| isActive | Boolean | Default: `true` |

### Category
| Field | Type | Notes |
|---|---|---|
| industry | ObjectId → Industry | Required, parent industry reference |
| name | String | Required |
| slug | String | Required, unique |
| description | String | Optional |
| isActive | Boolean | Default: `true` |

### Template
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → User | Template author |
| title | String | Required |
| description | String | Required |
| industry | ObjectId → Industry | Required |
| category | ObjectId → Category | Required |
| useCase | String | Recommended usage context |
| tone | String | Locked tone instruction |
| outputFormat | String | Locked output format |
| structuralInstruction | String | Locked structural instruction |
| basePromptText | String | Required, contains `{{variable}}` placeholders |
| variables | Array | `[{ name, description, defaultValue, required }]` |
| sampleOutput | [String] | Up to 5 image paths |
| repurposingIdeas | String | Suggestions for alternative uses |
| status | Enum | `Draft`, `Pending`, `Approved`, `Rejected` |

### Rating
| Field | Type | Notes |
|---|---|---|
| templateId | ObjectId → Template | Indexed |
| userId | ObjectId → User | One rating per user per template (unique compound index) |
| effectivenessRange | Enum | `0-10`, `10-50`, `50-80`, `80-100` |

### Upvote
| Field | Type | Notes |
|---|---|---|
| templateId | ObjectId → Template | Indexed |
| userId | ObjectId → User | One upvote per user per template (unique compound index) |

### Comment
| Field | Type | Notes |
|---|---|---|
| templateId | ObjectId → Template | Indexed |
| userId | ObjectId → User | Comment author |
| parentId | ObjectId → Comment | `null` for root comments, parent ID for replies (threaded) |
| content | String | Required, max 2000 characters |
| role | Enum | `user`, `expert`, `admin` — derived from user at creation time |

### ExpertRequest
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → User | Applicant |
| status | Enum | `Pending`, `Approved`, `Rejected` |
| details | String | Application details |

---

## API Reference

All endpoints are prefixed with `/api`. Authentication uses `Bearer <token>` in the `Authorization` header.

### Authentication and Users — `/api/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Public | Register a new user (sends set-password email) |
| POST | `/login` | Public | Login and receive JWT token |
| PUT | `/setpassword/:resetToken` | Public | Set password using emailed token |
| GET | `/profile` | Protected | Get current user profile |
| GET | `/` | Admin | List all users (paginated, search by name, filter by role) |
| POST | `/admin` | Admin | Invite a new admin (sends set-password email) |
| DELETE | `/:id` | Admin | Delete a user |

### Templates — `/api/templates`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public (optionalAuth) | List templates (paginated). Guests see Approved only; Admins see all. Supports `search`, `llm`, `industry`, `category`, `status` query params |
| GET | `/my` | Protected | List current user's templates |
| GET | `/stats` | Protected | Get template count breakdown by status |
| POST | `/` | Protected | Create template (multipart form, up to 5 images) |
| GET | `/:id` | Public (optionalAuth) | Get single template. Non-owners see Approved only |
| PUT | `/:id` | Protected (Owner/Admin) | Update template (multipart form) |
| DELETE | `/:id` | Protected (Owner/Admin) | Delete template and all associated images, comments, ratings |

### LLMs — `/api/llms`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List LLMs (paginated, search, filter by active/inactive) |
| GET | `/:id` | Public | Get single LLM |
| POST | `/` | Admin | Create LLM (supports logo upload, 2MB max) |
| PUT | `/:id` | Admin | Update LLM |
| DELETE | `/:id` | Admin | Delete LLM (must be inactive first) |

### Industries — `/api/industries`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List industries (paginated, search, filter by LLM/status) |
| GET | `/:id` | Protected | Get single industry |
| POST | `/` | Admin | Create industry (must belong to an active LLM) |
| PUT | `/:id` | Admin | Update industry |
| DELETE | `/:id` | Admin | Delete industry (must be inactive first) |

### Categories — `/api/categories`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List categories (paginated, search, filter by industry/status) |
| GET | `/:id` | Protected | Get single category |
| POST | `/` | Admin | Create category (must belong to an active industry) |
| PUT | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category (must be inactive first) |

### Comments — `/api/comments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/:templateId` | Public | Get threaded comments for a template |
| POST | `/:templateId` | Protected | Create a comment or reply (set `parentId` for replies) |
| DELETE | `/:id` | Protected (Owner/Admin) | Delete comment and all nested replies |

### Ratings — `/api/ratings`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/:templateId` | Public (optionalAuth) | Get rating distribution, average score, and current user's rating |
| POST | `/:templateId` | Protected | Submit or update effectiveness rating |
| GET | `/:templateId/upvote` | Public (optionalAuth) | Get upvote count and current user's upvote status |
| POST | `/:templateId/upvote` | Protected | Toggle upvote (add/remove) |

### Expert Requests — `/api/expert-requests`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Protected | Submit expert application (one pending request at a time) |
| GET | `/` | Admin | List all expert requests |
| PUT | `/:id` | Admin | Approve or reject (updates user role, sends email) |
| DELETE | `/:id` | Admin | Delete an expert request |

### Static Files

Uploaded files are served from `/uploads/` (template images and LLM logos).

---

## Frontend Architecture

### Routing

| Path | Component | Access | Description |
|---|---|---|---|
| `/` | Home | Public | Template browsing with search, filters, pagination |
| `/template/:id` | TemplateDetails | Public | Full template view with variable editor, copy, comments, ratings |
| `/login` | Login | Public | Email/password login |
| `/signup` | Signup | Public | Registration (triggers set-password email) |
| `/set-password/:token` | SetPassword | Public | Token-based password setup |
| `/dashboard` | DashboardOverview | Expert/Admin | Stats overview |
| `/dashboard/templates` | Templates | Admin | Manage all templates (approve, reject, delete) |
| `/dashboard/models` | MyTemplates | Expert | Manage own templates |
| `/dashboard/users` | Users | Admin | User management |
| `/dashboard/requests` | ExpertRequests | Admin | Expert application review |
| `/dashboard/llms` | LLMs | Admin | LLM management |
| `/dashboard/industries` | Industries | Admin | Industry management |
| `/dashboard/categories` | Categories | Admin | Category management |

### State Management

- **AuthContext** — Manages authentication state via React Context. Stores user info and JWT token in `localStorage`. On mount, validates the stored token against `/api/users/profile` and clears it on 401.
- **URL Search Params** — Filter state (search, LLM, industry, category, page) is stored in URL query parameters for bookmarkable/shareable searches.

### Layouts

- **Layout** — Public pages wrapper with Navbar (search, filters, profile dropdown, mobile menu) and Footer.
- **DashboardLayout** — Protected sidebar layout for Expert and Admin users. Collapsible sidebar with role-aware navigation items. Redirects regular users to home.

---

## Key Features

### Live Debounced Search
The Navbar search input updates results in real-time as the user types, with a 300ms debounce to minimize API calls. Debounced navigations use `replace: true` to keep browser history clean. Pressing Enter or clicking the search button triggers an immediate search.

### Cascading Filters
Filters follow the hierarchy **LLM → Industry → Category**. Selecting an LLM loads its industries; selecting an industry loads its categories. Changing a parent filter resets child filters.

### Template Variable Engine
Templates contain `{{variable_name}}` placeholders in their `basePromptText`. On the details page, users fill in variable values through form inputs (pre-populated with defaults). The app performs string replacement and presents the assembled prompt with a one-click copy button.

### Effectiveness Rating System
Users rate templates on an effectiveness range (`0-10%`, `10-50%`, `50-80%`, `80-100%`). Ratings are aggregated using weighted midpoints (5, 30, 65, 90) to produce an average effectiveness score displayed as a 5-star rating on template cards.

### Threaded Comments
Comments support nested replies via `parentId`. The API returns a flat list that the controller assembles into a threaded tree structure. Role badges (Admin, Expert, User) are shown next to commenter names.

### Upvote System
A simple toggle upvote per user per template, with count and user status returned from the API.

### File Upload Management
Template sample output images (up to 5, max 5MB each) are uploaded to a temp directory, then moved to `uploads/templates/{templateId}/` after creation. On template deletion, all associated images, comments, and ratings are cleaned up. LLM logos (max 2MB) are stored in `uploads/llm-logos/`.

### Email Notifications
- Registration: set-password link (24-hour expiry)
- Admin invitation: set-password link
- Expert request submitted: notification to all admins
- Expert request approved/rejected: notification to applicant

### Responsive Design
Fully responsive UI with mobile-optimized navigation. The mobile menu includes a search input with an explicit search button, filter dropdowns, and user actions.

### Animations
Page transitions, modal animations, staggered list rendering, dropdown animations, and button interactions are powered by Framer Motion.

---

## Deployment

### CI/CD Pipeline

The project uses GitHub Actions (`.github/workflows/deploy.yml`) for automated deployment. On every push to `main`:

1. SSH into the staging server
2. Pull the latest code from `origin/main`
3. Install client and server dependencies
4. Build the client (`npm run build`)
5. Copy the built files to `client/public/`
6. Reload the PM2 process using `ecosystem.config.js`

### PM2 Configuration

```js
// ecosystem.config.js
{
  name: "prompt-template",
  script: "server/src/index.js",
  instances: 1,
  exec_mode: "fork",
  max_memory_restart: "500M",
  env_staging: {
    NODE_ENV: "staging",
    PORT: 9000
  }
}
```

### Manual Deployment

```bash
# Build the client
cd client
npm run build

# Copy build output
cp -r dist/* public/

# Start with PM2
pm2 start ecosystem.config.js --env staging
```

---

## Available Scripts

### Server (`server/`)

| Command | Description |
|---|---|
| `npm start` | Start production server (`node index.js`) |
| `npm run dev` | Start development server with hot reload (`nodemon index.js`) |

### Client (`client/`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## License

This project is licensed under the ISC License.
