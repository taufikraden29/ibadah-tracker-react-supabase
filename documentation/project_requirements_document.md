# Project Requirements Document (PRD)

## 1. Project Overview

Ibadah Tracker is a modern, full-stack web application designed to help Muslims log, track, and visualize their daily worship activities (Salat, Sawm, Quran reading, and more) in one convenient place. By bringing forms, calendars, progress bars, and history views into a single dashboard, it tackles the pain of manually noting down prayers or forgetting to record one’s fasting and Quran progress. Users gain an intuitive interface to capture each act of worship, making spiritual accountability simple and motivating.

This project is being built to encourage consistent practice and reflection, giving users insights into their routines and progress over time. Key objectives are fast and secure authentication, reliable storage of worship entries, clear visual feedback (dashboard and calendar), and a delightful user experience with theming and animations. Success will be measured by user engagement (frequency of logging activities), system reliability (uptime and performance), and positive user feedback on ease of use.

---

## 2. In-Scope vs. Out-of-Scope

**In-Scope (Version 1):**
- User signup, login, logout via Supabase Auth
- Core worship modules:
  - **Salat (Prayer) log:** record date, time, rakaat count
  - **Sawm (Fasting) log:** record fast dates, type (e.g., Ramadan, voluntary)
  - **Quran reading log:** pages or surah count per session
- Dashboard: summary cards for today’s Salat, Sawm, Quran progress
- History page: calendar and list views of past entries
- Basic profile settings: name, timezone, preferred theme (light/dark)
- Responsive UI built with React, Tailwind CSS, and shadcn/ui
- Client-side validation with React Hook Form and Zod
- Real-time data fetching & caching via TanStack Query
- Animations with Framer Motion for modals, progress updates

**Out-of-Scope (Phase 1):**
- Third-party prayer times API integration (will add in Phase 2)
- Family or group sharing features
- Gamification badges, streaks, or leaderboard
- Exporting data (PDF, CSV)
- Push notifications or reminders
- Mobile-specific apps (iOS/Android) or offline support beyond basic error handling

---

## 3. User Flow

First-time users arrive at a landing page (with an animated hero component) and click “Get Started.” They create an account using email and password (handled by Supabase Auth) or log in if they already have an account. Upon successful authentication, they land on the **Dashboard**, which shows summary cards (today’s prayer status, fasting calendar, Quran progress). A top navigation bar or left sidebar lets them switch to **Log Activity**, **History**, or **Profile** pages. On **Log Activity**, they choose a type (Salat, Sawm, or Quran), fill out a form (date, details), and submit. A toast notification confirms the entry, and the dashboard updates instantly.

Returning users sign in and head straight to the Dashboard to see their progress. If they want to review past worship, they click **History**, which reveals a calendar view highlighting days with entries and a scrollable list of details. They can filter by activity type or date range. In **Profile**, users adjust timezone, display preferences, or theme mode. Throughout the app, consistent UI components and animations guide the user, ensuring a smooth, predictable experience.

---

## 4. Core Features

- **Authentication Module**: Email/password signup, login, password reset via Supabase Auth
- **Prayer Logging (Salat)**:
  - Record each prayer (Fajr, Dhuhr, Asr, Maghrib, Isha)
  - Capture number of rakaats
  - Timestamp entries and store in `ibadah_entries` table
- **Fasting Logging (Sawm)**:
  - Mark fast days (obligatory & voluntary)
  - Store date and type in database
- **Quran Reading Logging**:
  - Input pages or surahs read per session
  - Store progress with optional notes
- **Dashboard**:
  - Summary cards for today’s activities
  - Progress bars and simple charts (e.g., count of prayers completed)
- **History**:
  - Calendar view showing days with entries
  - Detailed list view with filters by activity type/date
- **Profile & Settings**:
  - Update display name, timezone, theme (light/dark)
- **Form Validation & Error Handling**:
  - Use React Hook Form + Zod for schema validation
  - Display clear in-form errors and toast messages
- **Real-Time & Caching**:
  - TanStack Query for data fetching, caching, and background sync
- **Animations**:
  - Framer Motion for modal dialogs, list transitions, and progress updates

---

## 5. Tech Stack & Tools

**Frontend:**
- React 18 (functional components + hooks)
- Vite (build tool)
- TypeScript (type safety)
- Tailwind CSS (utility-first styling)
- shadcn/ui (headless, accessible UI primitives)
- React Hook Form + Zod (form management & validation)
- TanStack Query (server state & caching)
- Framer Motion (UI animations)
- next-themes (light/dark mode toggling)
- Lucide React (icons)

**Backend (BaaS):**
- Supabase (PostgreSQL database, Auth, real-time)

**Developer Tools:**
- VS Code with ESLint & Prettier plugins
- Vitest (unit testing)
- GitHub Actions (CI pipeline for linting & tests)

---

## 6. Non-Functional Requirements

- **Performance**: Initial load under 2 seconds on 3G; dashboard updates within 500 ms after activity log
- **Security**: SSL/TLS for all API calls; row-level security in Supabase to isolate user data; OWASP Top 10 compliance
- **Compliance**: GDPR-friendly (users can delete their data); strong password rules
- **Usability**: WCAG 2.1 AA accessibility; responsive design for mobile and desktop
- **Reliability**: 99% uptime; proper error states for network failures

---

## 7. Constraints & Assumptions

- Supabase free tier rate limits apply (200k requests/day); high-volume use may need plan upgrade
- Users have modern browsers supporting ES6
- Environment variables (`SUPABASE_URL`, `SUPABASE_KEY`) must be configured
- No offline caching beyond error messages; full offline mode deferred to Phase 2
- Prayer times API integration will be added later; initial date inputs are manual

---

## 8. Known Issues & Potential Pitfalls

- **Timezone Handling**: Storing and displaying dates across user timezones can cause off-by-one-day errors. Mitigation: normalize dates to UTC on save and convert on the client.
- **Rate-Limits**: Exceeding Supabase quotas could block new entries. Mitigation: batch updates, implement client-side caching.
- **Form Validation Complexity**: Custom edge cases (e.g., reading zero pages) need clear rules. Mitigation: define strict Zod schemas and comprehensive tests.
- **Database Migration**: Altering `ibadah_entries` schema later can be disruptive. Mitigation: plan tables and columns carefully upfront and use migration tools.
- **CORS & Security Rules**: Misconfigured Supabase RLS or CORS headers could expose data. Mitigation: write and test RLS policies early; lock down CORS to known origins.


This document provides a clear roadmap for building the Ibadah Tracker’s first version, covering all core requirements, boundaries, and technical considerations so subsequent design and implementation steps can proceed without ambiguity.