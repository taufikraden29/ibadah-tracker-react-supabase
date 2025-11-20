# Tech Stack Document for Ibadah Tracker

This document explains in everyday language the technologies chosen for your Muslim Ibadah tracker. It covers the frontend, backend, infrastructure, integrations, security, and performance considerations, so anyone can understand why each tool was picked and how it contributes to the project.

## 1. Frontend Technologies

Our goal on the frontend is to build a fast, interactive, and beautiful user interface where someone can track their worship activities effortlessly. Here’s what we use:

- **React 18**
  - A popular JavaScript library for building user interfaces. It helps us create fast, responsive pages by breaking the UI into small, reusable pieces called components.
- **TypeScript**
  - A version of JavaScript that adds basic type checks. It catches mistakes early in development and makes the code easier to understand and maintain.
- **Vite**
  - A modern build tool that starts your development server almost instantly and bundles your code quickly for production. This means less waiting and a smoother workflow.
- **Tailwind CSS**
  - A utility-first styling framework. Instead of writing long CSS files, you apply small, descriptive classes directly in your HTML or JSX. This speeds up design and keeps everything consistent.
- **shadcn/ui (Radix UI primitives)**
  - A library of unstyled, accessible components (like buttons, cards, dialogs) that you can customize fully with Tailwind. It ensures your app works for everyone, including people using screen readers.
- **TanStack Query (React Query)**
  - Manages data fetching, caching, and updates from the backend. When you log a prayer, the UI updates right away while the data syncs behind the scenes.
- **React Hook Form + Zod**
  - A powerful combo for building and validating forms. React Hook Form handles form state efficiently, and Zod ensures the data is in the correct format before it’s sent to the backend.
- **Framer Motion**
  - A library for adding smooth animations. It brings subtle motion to components—like sliding in a new log or animating progress bars—making the app feel more polished.
- **Lucide React**
  - A simple set of clean, modern icons for actions like adding new entries, editing, or navigating through the app.
- **next-themes**
  - Provides easy light and dark mode switching. Users can choose an Islamic-themed color palette or their own preference.
- **(Optional) React Router DOM**
  - If you want multiple pages (e.g., dashboard, history, settings), this library helps you define routes and navigate between them seamlessly.

> How this enhances user experience:
> - Fast load times and instant updates.
> - Clean, consistent design with Tailwind and headless components.
> - Reliable forms and data handling for worry-free logging.
> - Engaging animations for a delightful feel.

## 2. Backend Technologies

Our backend needs to securely store user accounts and all Ibadah activity records, while offering real-time updates if shared tracking is desired.

- **Supabase**
  - A Backend-as-a-Service built on PostgreSQL. It provides:
    - **Authentication**: Sign-up, login, and secure user sessions out of the box.
    - **Database**: A PostgreSQL database for storing worship logs (`ibadah_entries`), user profiles, and related data.
    - **Real-time**: Optional real-time subscriptions, so updates made by one user can appear instantly for another.
- **Supabase JavaScript Client**
  - A library for connecting the app to Supabase. It handles queries, mutations, and authentication calls using environment variables (kept secret) to protect your keys.

> How these work together:
> - The frontend calls Supabase client functions to sign in/out, fetch prayer logs, or save new entries.
> - Supabase securely manages the data and sends back structured responses.
> - TanStack Query on the frontend keeps everything in sync.

## 3. Infrastructure and Deployment

To keep the project reliable, easy to update, and scalable, we’ve chosen the following setup:

- **Version Control (Git + GitHub)**
  - Every code change is tracked in a Git repository hosted on GitHub. This allows for collaboration, review, and rollback if needed.
- **Continuous Integration / Continuous Deployment (CI/CD)**
  - **GitHub Actions**: Automates tests and code quality checks (ESLint, Prettier) on every pull request.
  - **Automated Deployments**: On merging to the main branch, the app is rebuilt and redeployed.
- **Hosting Platform**
  - **Vercel** (or Netlify as an alternative): Optimized for projects built with Vite and React. It offers global CDN, HTTPS out of the box, and instant rollbacks if something goes wrong.
- **Environment Management**
  - Environment variables (`.env`) store sensitive keys for Supabase and any third-party services. These never get exposed to the public.
- **Linting & Formatting**
  - **ESLint** (linter) and **Prettier** (formatter) enforce consistent code style and prevent common mistakes.
- **Testing (Optional)**
  - **Vitest**: A fast testing framework for unit and integration tests, ensuring critical logic—like calculating daily completion—always works as expected.

> Benefits:
> - Automated checks keep your code healthy.
> - Hosting on Vercel ensures fast load times around the world.
> - CI/CD pipeline means you spend less time on manual deployments.

## 4. Third-Party Integrations

To enhance functionality and user convenience, we plan or support the following external services:

- **Al-Adhan API**
  - Supplies accurate prayer times based on user location, automatically populating daily targets.
- **Analytics (Optional)**
  - **Google Analytics** or **Plausible**: Track user engagement to understand which features are used most.

> How they help:
> - Prayer times come from a trusted source, saving you the effort of calculating them yourself.
> - Analytics reveal usage patterns, guiding future improvements.

## 5. Security and Performance Considerations

Keeping user data safe and the app quick is a top priority. Here’s what we’ve built in:

- **Authentication & Authorization**
  - Supabase Auth uses industry-standard encryption. Users only see their own data.
- **Data Validation**
  - Zod schemas check all incoming data at the form level, preventing bad or malicious data from reaching the database.
- **Secure Environment Variables**
  - Keys for Supabase and third-party APIs are never hard-coded; they live in protected environment settings.
- **HTTPS Everywhere**
  - Hosting on Vercel ensures secure connections by default.
- **Caching & Background Updates**
  - TanStack Query caches data and runs background fetches to keep the UI fast without repeatedly hitting the server.
- **Code Splitting & Tree Shaking**
  - Vite bundles only what’s needed, reducing download size and speeding up initial page loads.
- **Linting & Automatic Formatting**
  - ESLint and Prettier catch errors before they reach production, minimizing performance issues caused by code mistakes.

## 6. Conclusion and Overall Tech Stack Summary

In building the Ibadah tracker, we’ve chosen tools that together deliver:

- A **snappy**, interactive frontend (React 18, Vite, Tailwind CSS).
- **Reliable data handling** (Supabase, TanStack Query, React Hook Form + Zod).
- **Beautiful, accessible UI** (shadcn/ui, Framer Motion, Lucide icons).
- **Smooth development and deployment** (TypeScript, ESLint/Prettier, GitHub Actions, Vercel).
- **Secure and scalable** architecture (HTTPS, environment variables, real-time capable database).

These choices align with the project’s goal of creating a friendly, engaging, and trustworthy Ibadah tracking experience for the Muslim community. With this foundation in place, you can focus on adding meaningful features—like Ramadan fast tracking, Quran reading goals, and community sharing—without worrying about the underlying plumbing.