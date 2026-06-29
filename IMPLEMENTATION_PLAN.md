# CivicSense v2.0 — Implementation Plan

## 1. Overview

A crowdsourced civic issue reporting platform with 3 roles:
- **Helper** (citizen): Reports issues with geo-tagged photos
- **Admin**: Oversees reports, assigns to workers (mostly automated)
- **Worker**: Resolves issues in the field, uploads proof

## 2. Tech Stack

| Layer | Tool |
|---|---|
| Framework | **Next.js 15** (App Router, React 19) |
| Styling | Tailwind CSS 3 |
| Auth | **Supabase Auth** (email/password + Google OAuth) |
| Database | Supabase PostgreSQL (direct queries via `@supabase/ssr`) |
| Storage | Supabase Storage (2 buckets) |
| Realtime | Supabase Realtime (postgres_changes) |
| AI/ML | Google Gemini 1.5 Flash |
| Email | Resend |
| Maps | Leaflet + React-Leaflet |
| Charts | Recharts |
| Deploy | Vercel (Next.js) |

### Migration from v1.0

| What changed | Before (v1.0) | After (v2.0) |
|---|---|---|
| Framework | React + Vite SPA | Next.js 15 App Router |
| Auth | Clerk | Supabase Auth |
| ORM | Prisma | Direct Supabase queries |
| API | Vercel Serverless (`/api/*.js`) | Next.js Route Handlers (`/app/api/*/route.js`) |
| Routing | React Router DOM | Next.js file-based routing |
| Entry point | `index.html` + `src/main.jsx` | `app/layout.jsx` + `app/page.jsx` |

## 3. Architecture

```
Browser
  │
  ├─ Landing (/)          → Role selector
  ├─ /login/helper        → Supabase signUp / signIn
  ├─ /login/worker        → Supabase signIn only
  ├─ /login/admin         → Supabase signIn only
  ├─ /auth/callback       → OAuth redirect handler
  │
  ├─ /helper/*            → Citizen portal (submit reports, view status)
  ├─ /admin/*             → Admin portal (manage reports, workers, analytics)
  └─ /worker/*            → Worker portal (tasks, map, profile)
        │
        ▼
  Next.js Middleware (middleware.js)
  → Refreshes Supabase session cookies
  → Redirects unauthenticated users from protected routes
        │
        ▼
  Next.js API Route Handlers (app/api/*/route.js)
  → Authenticate via Supabase server client (cookie-based)
  → Query Supabase PostgreSQL directly
  → Call Gemini AI, Resend, etc.
        │
        ▼
  Supabase (PostgreSQL + Auth + Storage + Realtime)
```

## 4. Auth Flow (Supabase)

```
User visits /login/:role
  ↓
Email/Password → supabase.auth.signInWithPassword()
Google OAuth   → supabase.auth.signInWithOAuth({ provider: 'google' })
Sign up        → supabase.auth.signUp() (helper only)
  ↓
Supabase sets session cookies (managed by @supabase/ssr)
  ↓
Middleware refreshes session on every request
  ↓
AuthContext (client) calls GET /api/me
  ↓
/api/me checks auth, finds/creates profile, returns { id, role, fullName, email }
  ↓
AuthContext stores user + role in React state
  ↓
Portal layouts render based on role
```

**Role assignment:**
- New sign-ups default to `helper` role
- Workers are created by admin via `/api/create-worker` (uses Supabase Admin API)
- Admins are bootstrapped via `BOOTSTRAP_ADMIN_EMAILS` env var or direct DB update

## 5. Database Schema

Tables are created directly in Supabase (no Prisma migrations):

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Matches Supabase Auth user ID |
| full_name | text | |
| email | text | |
| phone | text | |
| avatar_url | text | |
| role | text | `helper`, `admin`, or `worker` |
| created_at | timestamptz | |

### `reports`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| reporter_id | uuid (FK → profiles) | |
| title | text | |
| description | text | |
| image_url | text | Supabase Storage URL |
| lat | float | GPS latitude |
| lng | float | GPS longitude |
| address | text | |
| category | text | pothole, garbage, streetlight, flooding, vandalism, other |
| status | text | pending, analyzing, assigned, in_progress, resolved, duplicate, escalated |
| priority | text | critical, high, medium, low |
| ai_category | text | Gemini-predicted category |
| ai_priority | text | Gemini-predicted priority |
| ai_confidence | float | 0-1 confidence score |
| ai_summary | text | AI-generated description |
| ai_suggested_action | text | |
| duplicate_of | uuid (FK → reports) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `workers`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK, FK → profiles) | Same as profile ID |
| zone | text | Geographic zone assignment |
| is_available | boolean | |
| current_lat | float | Live GPS |
| current_lng | float | Live GPS |
| last_location_update | timestamptz | |
| active_task_count | int | |
| total_completed | int | |

### `tasks`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| report_id | uuid (FK → reports) | |
| worker_id | uuid (FK → workers) | |
| assigned_by | uuid (FK → profiles) | |
| status | text | assigned, in_progress, completed, cancelled, escalated |
| before_image | text | |
| after_image | text | Completion proof photo |
| notes | text | |
| assigned_at | timestamptz | |
| started_at | timestamptz | |
| completed_at | timestamptz | |

### `notifications`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles) | |
| title | text | |
| message | text | |
| type | text | task_assigned, task_completed, report_update, alert |
| is_read | boolean | |
| metadata | jsonb | |
| created_at | timestamptz | |

### `alerts`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| report_id | uuid (FK → reports) | |
| severity | text | |
| message | text | |
| acknowledged | boolean | |
| created_at | timestamptz | |

## 6. Storage Buckets

| Bucket | Public | Purpose |
|---|---|---|
| `report-images` | Yes | Photos uploaded with issue reports |
| `completion-images` | Yes | After-photos uploaded by workers |

## 7. API Route Handlers

All routes live under `app/api/*/route.js`:

| Route | Methods | Auth | Purpose |
|---|---|---|---|
| `/api/me` | GET | Cookie session | Get/create user profile + role |
| `/api/reports` | GET, POST, PATCH | Cookie session | CRUD for reports |
| `/api/tasks` | GET, PATCH | Cookie session | Read/update tasks + trigger completion flow |
| `/api/workers` | GET, PATCH | Cookie session | Read/update workers |
| `/api/notifications` | GET, PATCH | Cookie session | Read/mark notifications |
| `/api/create-worker` | POST | Cookie session (admin) | Create Supabase user + worker profile |
| `/api/update-role` | POST | Cookie session (admin) | Change a user's role |
| `/api/analyze-report` | POST | Cookie session | Send to Gemini AI for analysis |
| `/api/check-duplicate` | POST | Cookie session | Spatial duplicate detection |
| `/api/auto-assign` | POST | Cookie session | Hybrid worker assignment algorithm |
| `/api/send-completion-email` | POST | Internal | Send emails via Resend on task completion |
| `/auth/callback` | GET | — | OAuth redirect handler |

## 8. AI Pipeline

```
Helper submits report → POST /api/reports (status: pending)
  ↓
Admin clicks "Run AI Analysis" → POST /api/analyze-report
  ↓
  ├─ Status → 'analyzing'
  ├─ Image + text → Gemini 1.5 Flash
  ├─ Response: { category, priority, confidence, summary, suggestedAction }
  ├─ Updates report ai_* fields
  ├─ If critical → creates Alert
  └─ Status → 'pending' (ready for assignment)
  ↓
Admin clicks "Auto-Assign" → POST /api/auto-assign
  ↓
  ├─ Queries available workers
  ├─ Scores: 50% proximity + 30% workload + 20% zone
  ├─ Creates task, updates report status → 'assigned'
  └─ Creates notification for worker
```

## 9. Worker Assignment Algorithm

```
Score(worker) = 0.5 * proximityScore + 0.3 * workloadScore + 0.2 * zoneScore

Where:
  proximityScore = 1 / (1 + haversineDistance(worker, report))
  workloadScore  = 1 / (1 + worker.activeTaskCount)
  zoneScore      = worker.zone matches report area ? 1.0 : 0.0

Filters:
  - is_available = true
  - last_location_update within 1 hour

Fallback: if no workers available → status stays 'pending', admin notified
```

## 10. Project Structure

```
civicsense/
├── app/                        # Next.js App Router
│   ├── layout.jsx              # Root layout (AuthProvider)
│   ├── page.jsx                # Landing page (role selector)
│   ├── globals.css             # Tailwind base
│   │
│   ├── login/
│   │   ├── AuthPage.jsx        # Shared Supabase auth UI
│   │   ├── helper/page.jsx     # → AuthPage role="helper"
│   │   ├── worker/page.jsx     # → AuthPage role="worker"
│   │   └── admin/page.jsx      # → AuthPage role="admin"
│   │
│   ├── auth/
│   │   └── callback/route.js   # OAuth code exchange
│   │
│   ├── helper/                 # Citizen portal
│   │   ├── layout.jsx          # Sidebar + Navbar shell
│   │   ├── page.jsx            # Redirect → /helper/home
│   │   ├── home/page.jsx       # Dashboard, recent reports, stats
│   │   ├── submit/page.jsx     # Camera + GPS + report form
│   │   └── my-reports/page.jsx # List of user's reports
│   │
│   ├── admin/                  # Admin portal
│   │   ├── layout.jsx          # Sidebar + Navbar shell
│   │   ├── page.jsx            # Redirect → /admin/dashboard
│   │   ├── dashboard/page.jsx  # Stats, charts, map, worker overview
│   │   ├── reports/page.jsx    # Filterable report list + AI/assign actions
│   │   ├── workers/page.jsx    # Worker cards + create worker modal
│   │   └── analytics/page.jsx  # Charts, resolution rate, trends
│   │
│   ├── worker/                 # Field worker portal
│   │   ├── layout.jsx          # Dark-themed sidebar + navbar
│   │   ├── page.jsx            # Redirect → /worker/dashboard
│   │   ├── dashboard/page.jsx  # Task list with start/complete/escalate
│   │   ├── map/
│   │   │   ├── page.jsx        # Map wrapper (dynamic import)
│   │   │   └── MapContent.jsx  # Leaflet map (client-only)
│   │   └── profile/page.jsx    # Profile info + availability toggle
│   │
│   └── api/                    # Route handlers (11 endpoints)
│       ├── me/route.js
│       ├── reports/route.js
│       ├── tasks/route.js
│       ├── workers/route.js
│       ├── notifications/route.js
│       ├── create-worker/route.js
│       ├── update-role/route.js
│       ├── analyze-report/route.js
│       ├── check-duplicate/route.js
│       ├── auto-assign/route.js
│       └── send-completion-email/route.js
│
├── components/                 # Shared UI components
│   ├── camera/GeoCamera.jsx    # Camera capture + file upload
│   ├── charts/
│   │   ├── CategoryPie.jsx     # Recharts pie chart
│   │   ├── PriorityBar.jsx     # Recharts bar chart
│   │   ├── Timeline.jsx        # 7-day area chart
│   │   └── DepartmentPerf.jsx  # Resolution rate by category
│   ├── layout/
│   │   ├── Navbar.jsx          # Top bar (role-themed)
│   │   └── Sidebar.jsx         # Side navigation (role-themed)
│   └── maps/
│       └── ReportMap.jsx       # Leaflet map for report pins
│
├── context/
│   └── AuthContext.jsx         # Supabase session + role provider
│
├── hooks/                      # Client-side data hooks
│   ├── useReports.js           # Fetch + realtime reports
│   ├── useWorkers.js           # Fetch + realtime workers
│   ├── useWorkerTasks.js       # Fetch + realtime tasks
│   ├── useNotifications.js     # Fetch + realtime notifications
│   ├── useGeolocation.js       # Browser GPS
│   └── useCamera.js            # Camera stream + capture
│
├── lib/
│   ├── constants.js            # Enums, colors, config values
│   ├── utils.js                # cn(), timeAgo, haversine, uploadToSupabase
│   └── supabase/
│       ├── client.js           # Browser client (createBrowserClient)
│       ├── server.js           # Server client (createServerClient + cookies)
│       ├── admin.js            # Service role client (admin operations)
│       └── middleware.js        # Session refresh middleware
│
├── middleware.js               # Next.js middleware (session refresh + route protection)
├── next.config.js              # Image domains, etc.
├── tailwind.config.js          # Tailwind content paths + theme
├── postcss.config.mjs          # PostCSS plugins
├── jsconfig.json               # @ path alias
└── package.json                # Next.js 15, React 19, Supabase, etc.
```

## 11. Environment Variables

All in `.env.local` (gitignored):

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # For admin operations (create-worker)

# Google Gemini AI
GEMINI_API_KEY=your-gemini-key

# Resend Email
RESEND_API_KEY=re_...

# Admin bootstrap
ADMIN_EMAILS=admin@example.com
BOOTSTRAP_ADMIN_EMAILS=admin@example.com
BOOTSTRAP_WORKER_EMAILS=worker@example.com
```

## 12. Key Flows

### Helper: Submit Report
1. Opens camera or uploads photo → `GeoCamera` component
2. Browser GPS auto-captures coordinates → `useGeolocation` hook
3. Fills title, description, category
4. Photo uploads to `report-images` bucket via `uploadToSupabase()`
5. `POST /api/reports` creates report (status: pending)
6. Redirected to My Reports page
7. Realtime subscription updates status in real-time

### Admin: Process Report
1. Views all reports on `/admin/reports` with status/category filters
2. Clicks "Run AI Analysis" → Gemini analyzes image + text
3. AI populates category, priority, summary, suggested action
4. Clicks "Auto-Assign Worker" → algorithm scores available workers
5. Task created, worker notified, report status → assigned
6. Monitors progress on dashboard with charts + map

### Worker: Complete Task
1. Views assigned tasks on `/worker/dashboard`
2. Clicks "Start Task" → status: in_progress
3. Clicks "Navigate" → opens Google Maps directions
4. On-site: clicks "Mark Complete" → uploads after-photo
5. Task completed → report resolved → worker stats updated
6. Completion email sent to admin + original reporter
7. Can escalate if unable to resolve

## 13. Realtime Subscriptions

All hooks subscribe to Supabase postgres_changes:
- `useReports` → listens on `reports` table
- `useWorkers` → listens on `workers` table
- `useWorkerTasks` → listens on `tasks` table (filtered by worker_id)
- `useNotifications` → listens on `notifications` table (filtered by user_id)

## 14. Security Model

- **Auth**: Supabase manages sessions via HTTP-only cookies
- **Middleware**: Refreshes session on every request, redirects unauthenticated users
- **API routes**: Every handler calls `supabase.auth.getUser()` to verify auth
- **Admin operations**: `create-worker` and `update-role` use `SUPABASE_SERVICE_ROLE_KEY`
- **Storage**: Public buckets for report/completion images (no PII)
- **No RLS needed**: Frontend never queries DB directly; all data flows through authenticated API routes

## 15. Deployment (Vercel)

1. Connect GitHub repo to Vercel
2. Framework: Next.js (auto-detected)
3. Set environment variables in Vercel dashboard
4. Enable Supabase Google OAuth redirect URL: `https://your-domain.vercel.app/auth/callback`
5. Deploy — zero config needed
