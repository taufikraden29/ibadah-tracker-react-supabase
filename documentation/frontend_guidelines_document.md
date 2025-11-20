# Frontend Guideline Document for Ibadah Tracker

This document describes the frontend setup, design decisions, and tools used in the **ibadah-tracker-react-supabase** project. It’s written in clear, everyday language so anyone—developers or non-technical stakeholders—can understand how the frontend works and why certain choices were made.

## 1. Frontend Architecture

### Overall Structure
- **Single-Page Application (SPA)** built with **React 18**. This means the app loads once and dynamically updates as users navigate, giving a smooth, desktop-like experience in the browser.
- **Vite** as the build tool. Vite starts the local server almost instantly and rebuilds only what changed, speeding up development dramatically.
- **TypeScript** for all code. This adds simple checks to catch mistakes early and makes the codebase easier to maintain as it grows.

### Key Libraries
- **UI Components**: `shadcn/ui` (built on Radix UI) provides unstyled but accessible building blocks—things like cards, dialogs, and buttons—so we can craft a unique look without losing keyboard or screen-reader support.
- **Styling**: **Tailwind CSS** gives us utility classes (like `bg-green-600` or `p-4`) to style components directly in markup, avoiding separate CSS files.
- **Theming**: `next-themes` handles light/dark mode toggling and remembers users’ preferences.
- **Data Fetching & Caching**: **TanStack Query** (formerly React Query) fetches, caches, and keeps data in sync with Supabase, ensuring the UI feels snappy and up-to-date.
- **Form Handling**: **React Hook Form** plus **Zod** for fast, type-safe forms with built-in validation.
- **Animations**: **Framer Motion** adds smooth, appealing transitions (e.g., when adding a new prayer entry or showing a progress bar).
- **Icons**: **Lucide React** for a clean, consistent icon set.

### Backend Connection (Data Layer)
- **Supabase** acts as our backend service: authentication, database, and real-time updates.
- A single Supabase client is initialized in `src/lib/supabase.ts` using environment variables, then shared across hooks and components.

### Scalability & Maintainability
- **Modular folder structure** keeps features, UI primitives, and utilities separated. New features—say, a `quran` reader—go into their own `src/features` folder.
- **TypeScript** and **Zod** reduce runtime errors and clarify data shapes.
- **Utility-first CSS** avoids large, unused style sheets.
- **Component-based design** means each piece (buttons, forms, cards) is self-contained and reusable.

## 2. Design Principles

### Usability
- Clear, straightforward interfaces for logging daily worship (Salat), Quran reading, or fasting.
- Immediate feedback on user actions (e.g., toast messages when an entry is saved).

### Accessibility
- Headless components from Radix UI ensure keyboard navigation and screen-reader compatibility out of the box.
- ARIA attributes and semantic HTML (buttons, forms, headings) are used consistently.

### Responsiveness
- Mobile-first layout using Tailwind’s responsive utilities (`sm:`, `md:`) to cover phones, tablets, and desktops.

### Consistency & Clarity
- Consistent spacing, typography, and color usage across pages.
- Clear call-to-action buttons and form labels make flows intuitive.

## 3. Styling and Theming

### Styling Approach
- **Tailwind CSS** (utility-first) for rapid styling without writing custom CSS files.
- A small helper function `cn` in `src/lib/utils.ts` merges conditional class names cleanly.

### Theming
- **Light & Dark Modes** via `next-themes`. We define two sets of colors and switch based on user choice or system preference.

### Visual Style
- **Modern Flat Design** with subtle glassmorphism on key panels (semi-transparent background with light blur) to give depth.
- **Minimalist**: plenty of white space, clear icons, and simple typography.

### Color Palette (Islamic-inspired)
- Primary Green: #047857 (emerald)
- Accent Gold:   #FBBF24 (sunshine gold)
- Background Light: #F3F4F6 (warm gray)
- Background Dark:  #1F2937 (charcoal)
- Text Dark:    #111827 (nearly black)
- Text Light:   #F9FAFB (off-white)

### Fonts
- **Primary Font**: “Inter”, sans-serif (readable, modern).
- Fallbacks: system fonts for performance: `(Inter, -apple-system, BlinkMacSystemFont, sans-serif)`.

## 4. Component Structure

### Organization
- `src/components/ui/` holds reusable UI primitives (Card, Button, Input, Dialog, Calendar, Progress, etc.).
- `src/features/` (to be created) groups feature-specific code: e.g., `salat`, `quran`, `sawm` each with their own components, hooks, and types.
- `src/hooks/` for shared logic hooks (e.g., `usePrayerTimes`, `useIbadahEntries`).
- `src/lib/` for utility functions (`cn`, date formatters) and the Supabase client.

### Benefits of Component-Based Architecture
- **Reusability**: Build once, use everywhere—cards and forms stay consistent.
- **Isolation**: Changes in one component don’t ripple through unrelated parts.
- **Testability**: Small, focused components are easier to test.

## 5. State Management

### Server State: TanStack Query
- Fetches and caches data from Supabase (e.g., prayer history, fasting records).
- Provides hooks like `useQuery` and `useMutation` for reading and writing entries, with built-in loading and error states.

### Local UI State
- **React Hook Form** manages form values and validation.
- **React Context** (if needed) for app-wide state such as authentication status or theme choice.

## 6. Routing and Navigation

- **React Router DOM** will be used to define routes and pages:
  • `/dashboard` – overview of today’s activities
  • `/log-activity` – form to add a new entry
  • `/history` – past entries by day or activity
  • `/profile` – user settings

- A top‐level `<BrowserRouter>` wraps the app in `src/App.tsx`. Navigation components (nav bar, side menu) link to each route.

## 7. Performance Optimization

- **Lazy Loading & Code Splitting**: Use `React.lazy` and `Suspense` to load feature pages only when needed.
- **Tree-Shaking**: Vite and ES modules remove unused code automatically.
- **CSS Purging**: Tailwind’s built-in purge removes unused utility classes in production.
- **Image & Asset Optimization**: Compress images and serve modern formats (WebP).
- **Cache & Pagination**: TanStack Query caches data and reuses it instead of refetching on every view.
- **Reduced Motion**: Honor user preferences (`prefers-reduced-motion`) in animations.

## 8. Testing and Quality Assurance

### Code Quality
- **TypeScript** catches type errors at compile time.
- **ESLint** and **Prettier** enforce consistent style and catch common mistakes.

### Testing Strategies
- **Unit Tests** with **Vitest** and **React Testing Library** for component logic (e.g., form validation, utility functions).
- **Integration Tests** for flows like “log a prayer → see it on dashboard.”
- **End-to-End (E2E)** with **Cypress** or **Playwright** to simulate real user interactions (login, add entries, switch themes).
- **Continuous Integration (CI)** pipeline runs tests and lint checks on each pull request to catch regressions early.

## 9. Conclusion and Overall Frontend Summary

This guideline outlines a clear, modular, and scalable frontend setup for the Ibadah tracker:

- A **modern SPA** with React, Vite, and TypeScript for fast development and robust code.
- **Utility-first styling** (Tailwind) plus **headless UI components** for full creative control and accessibility.
- **Strong data handling** via Supabase and TanStack Query to keep the UI responsive and data reliable.
- **Thoughtful design principles**—usability, accessibility, and responsiveness—ensuring the app serves all users well.
- **Performance and quality** baked into every layer: lazy loading, testing, linting, and consistent theming.

With these guidelines, anyone joining the project can quickly understand the frontend setup and continue building features—like prayer timers, progress trackers, or community sharing—while maintaining a high standard of code quality and user experience.

---
*End of Frontend Guideline Document*