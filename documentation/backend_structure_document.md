# Backend Structure Document for Ibadah Tracker

## 1. Backend Architecture

We rely on Supabase, a Backend-as-a-Service, to power all server-side needs. Here’s how it’s set up:

- Client-Server Model: The React single-page app communicates with Supabase through a simple REST API and real-time channels.
- Supabase Services:
  - **Authentication**: Manages user signup, login, password reset, and secure token handling.
  - **Database**: A hosted PostgreSQL instance for storing Ibadah entries, user profiles, and related data.
  - **Realtime**: WebSocket-based channels to push live updates (e.g., shared family Ibadah tracker).
- Design Patterns:
  - **Modular Data Layer**: We encapsulate Supabase calls in custom hooks (e.g., `useIbadahEntries`) to keep business logic separate from UI.
  - **Serverless & Managed**: No custom server code—Supabase handles scaling, backups, and updates automatically.

This architecture scales seamlessly as your user base grows, keeps maintenance overhead low, and offers fast response times by using managed services with global edge infrastructure.

## 2. Database Management

- Type: Relational (SQL) database using PostgreSQL.
- Hosted and maintained by Supabase, which provides:
  - Automated backups and point-in-time recovery.
  - Built-in query performance monitoring.
  - Easy migrations via SQL scripts or Supabase CLI.
- Data Practices:
  - **Environment Variables** store credentials securely (no secrets in code).
  - **Row-Level Security (RLS)** policies enforce that users can only access their own records.
  - **JSONB Columns** for flexible storage of activity-specific details (e.g., number of rakats, page ranges).

## 3. Database Schema

All tables reside in a single PostgreSQL database. Below is a human-readable overview followed by SQL definitions.

### Human-Readable Schema

- **profiles**: Stores user metadata linked to authentication.
  - `id` (UUID): Primary key matching Supabase Auth user ID.
  - `email` (text): User’s email address.
  - `display_name` (text): Optional name for display.
  - `created_at` (timestamp): When the profile was created.

- **ibadah_entries**: Records each worship activity.
  - `id` (UUID): Primary key.
  - `user_id` (UUID): Foreign key to `profiles.id`.
  - `activity_type` (text): e.g., 'Salat', 'Quran', 'Sawm'.
  - `activity_date` (date): The date of the activity.
  - `details` (JSONB): Structured data, e.g., `{ "rakats": 4 }` or `{ "pages_read": [1,2,3] }`.
  - `created_at` (timestamp): Timestamp of when it was logged.

### SQL Definitions (PostgreSQL)

```sql
-- Profiles table
create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  display_name text,
  created_at timestamp with time zone default now()
);

-- Ibadah entries table
create table if not exists public.ibadah_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  activity_type text not null,
  activity_date date not null,
  details jsonb,
  created_at timestamp with time zone default now()
);

-- Enable Row-Level Security
alter table public.ibadah_entries enable row level security;

-- Example RLS policy: users can only see their own entries
create policy "Users can access their own entries"
  on public.ibadah_entries
  using ( auth.uid() = user_id );
```

## 4. API Design and Endpoints

We use Supabase’s built-in REST and realtime APIs rather than a custom server. Key communications:

- Authentication Endpoints (handled by Supabase Auth):
  - `POST /auth/v1/signup` – Create a new user.
  - `POST /auth/v1/token` – Login and receive JWT.
  - `POST /auth/v1/logout` – Invalidate session.

- Data Endpoints (via PostgREST):
  - `GET /rest/v1/ibadah_entries` – Fetch entries (automatically filtered by RLS).
  - `POST /rest/v1/ibadah_entries` – Create a new Ibadah entry.
  - `PATCH /rest/v1/ibadah_entries?id=eq.<entry_id>` – Update an entry.
  - `DELETE /rest/v1/ibadah_entries?id=eq.<entry_id>` – Remove an entry.
  - Similar endpoints exist for `profiles`.

- Realtime Channels:
  - Clients subscribe to `realtime:public:ibadah_entries` to receive live updates.

## 5. Hosting Solutions

- Supabase Cloud:
  - Managed PostgreSQL database and Auth servers in multiple regions.
  - Automatic horizontal scaling and failover.
  - Pay-as-you-go pricing keeps costs low at small scale.

- (Optional) Frontend Hosting:
  - Often paired with Vercel or Netlify for React app deployment.
  - Global CDN ensures fast load times regardless of user location.

## 6. Infrastructure Components

- Load Balancing & Edge Network:
  - Supabase sits behind a global CDN (powered by Cloudflare) that routes requests to the nearest edge.
  - Automatic load balancing distributes database reads and writes.

- Caching:
  - PostgREST caches query plans in PostgreSQL.
  - Client-side caching via TanStack Query reduces repeated API calls.

- Content Delivery Network (CDN):
  - Static assets (e.g., images, icons) served through the CDN of your chosen frontend host.

## 7. Security Measures

- Authentication & Authorization:
  - Supabase Auth issues JWTs, stored securely in HTTP-only cookies or local storage.
  - Row-Level Security ensures users only access their own data.

- Data Encryption:
  - All traffic encrypted in transit via HTTPS/TLS.
  - Data at rest encrypted by Supabase-managed PostgreSQL.

- Environment Security:
  - API keys and database URLs stored in environment variables, never in code.
  - Regular rotation of service keys.

## 8. Monitoring and Maintenance

- Monitoring Tools:
  - Supabase Dashboard shows database performance metrics (CPU, query latency).
  - Built-in logs for Auth and database errors.
  - (Optional) Integrate Sentry or LogRocket for error tracking on the client side.

- Maintenance Practices:
  - Use Supabase Migrations (SQL scripts) to version-control schema changes.
  - Schedule regular audits of RLS policies and indexes.
  - Keep dependencies (library versions) up to date via Dependabot or similar.

## 9. Conclusion and Overall Backend Summary

This backend setup uses Supabase to simplify everything from user authentication to data storage, real-time updates, and security. By leveraging a managed PostgreSQL database with RLS, a global CDN, and built-in monitoring, the Ibadah Tracker can grow smoothly without the overhead of managing servers. The result is a reliable, scalable, and cost-effective backend that aligns perfectly with the project’s goal: enabling Muslims to effortlessly track their worship activities with peace of mind.