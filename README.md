# 🕌 Ibadah Tracker - Islamic Worship Tracker

A comprehensive Islamic worship tracking application built with React and Supabase. Track your daily prayers, Quran reading progress, and maintain consistency in your spiritual journey.

![Ibadah Tracker](https://img.shields.io/badge/Ibadah-Tracker-blue?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178c6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.48.1-3FCF8E?style=for-the-badge&logo=supabase)

## ✨ Features

### 🙏 Prayer Tracking
- **Daily Prayer Tracking**: Track all five daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)
- **Prayer Times Integration**: Automatic prayer times based on your location using Al-Adhan API
- **Location Services**: Geolocation support with manual city fallback
- **Prayer Reminders**: Browser notifications before prayer times
- **Progress Analytics**: View prayer completion rates and consistency

### 📖 Quran Reading Logger
- **Surah Tracking**: Complete database of all 114 Surahs with Arabic and English names
- **Reading Sessions**: Log reading sessions with ayah ranges and page counts
- **Progress Visualization**: Track reading streaks and progress statistics
- **Personal Notes**: Add reflections and notes for each reading session
- **Comprehensive Stats**: View total pages read, sessions, and reading patterns

### 📊 Dashboard & Analytics
- **Real-time Dashboard**: Overview of your worship activities
- **Interactive Charts**: Visual representations of your spiritual progress
- **Statistics**: Detailed stats for prayers and Quran reading
- **Recent Activity**: Timeline of your recent worship activities
- **Quick Actions**: Easy access to logging prayers and Quran reading

### 🔔 Smart Notifications
- **Prayer Reminders**: Customizable notifications for each prayer
- **Notification Settings**: Fine-tune which prayers you want reminders for
- **Browser Support**: Native browser notifications
- **Service Worker**: Persistent notifications even when the app is closed

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: Easy on the eyes during night prayers
- **Smooth Animations**: Beautiful transitions using Framer Motion
- **Intuitive Navigation**: Sidebar navigation with quick access to all features
- **Accessibility**: WCAG compliant design

## 🚀 Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Notifications**: Browser Notification API + Service Worker
- **Charts**: [Recharts](https://recharts.org/)

## 📋 Prerequisites

Before you begin, ensure you have the following:

- **Node.js** 18+ installed
- A [Supabase](https://supabase.com/) account for database and authentication
- Modern web browser with geolocation support (for prayer times)

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ibadah-tracker.git
cd ibadah-tracker
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

- Copy the `.env.example` file to `.env`:
  ```bash
  cp .env.example .env
  ```

### 4. Supabase Database Setup

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project
3. Run the SQL setup script from `supabase-setup.sql` in the Supabase SQL Editor
4. Go to Project Settings > API
5. Copy the `Project URL` and `anon` key to your `.env` file

Your `.env` file should look like this:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 6. Open Your Browser

Navigate to [http://localhost:5173](http://localhost:5173) to see the application.

## 🗄️ Database Setup

The application requires two main tables in your Supabase database:

### 1. Daily Prayers Table
```sql
daily_prayers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  prayer_name TEXT CHECK (prayer_name IN ('Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha')),
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('completed', 'missed', 'pending')),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 2. Quran Progress Table
```sql
quran_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  surah INTEGER CHECK (surah >= 1 AND surah <= 114),
  ayah_start INTEGER,
  ayah_end INTEGER,
  pages_read INTEGER,
  notes TEXT,
  timestamp TIMESTAMP,
  created_at TIMESTAMP
)
```

**Row Level Security (RLS)** is enabled to ensure users can only access their own data.

Run the complete setup script:
```bash
# Copy the contents of supabase-setup.sql and run it in your Supabase SQL Editor
```

## 📁 Project Structure

```
ibadah-tracker/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── auth/           # Authentication forms
│   │   ├── Navigation.tsx  # Main navigation component
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── pages/              # Main application pages
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── PrayerTracker.tsx # Prayer tracking
│   │   └── QuranLogger.tsx # Quran reading logger
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication logic
│   │   └── useNotifications.ts # Notification management
│   ├── api/                # API functions
│   │   ├── prayers.ts      # Prayer-related API calls
│   │   └── quran.ts        # Quran-related API calls
│   ├── lib/                # Utility libraries
│   │   ├── supabaseClient.ts # Supabase client setup
│   │   └── serviceWorker.ts # PWA service worker
│   └── types/              # TypeScript type definitions
├── public/
│   └── sw.js               # Service worker for notifications
├── documentation/          # Project documentation
└── supabase-setup.sql      # Database setup script
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🔧 Configuration

### Prayer Times
The app uses the [Al-Adhan API](http://api.aladhan.com/) for accurate prayer times based on:
- Your current geolocation
- Islamic calculation method (ISNA default)
- Automatic location detection with manual fallback

### Notifications
- **Browser Notifications**: Requires user permission
- **Prayer Reminders**: Configurable minutes before each prayer
- **Service Worker**: Enables notifications when app is closed
- **Settings**: Customize which prayers to get reminders for

## 🌟 Features in Detail

### Prayer Tracking
- **Five Daily Prayers**: Fajr, Dhuhr, Asr, Maghrib, Isha
- **Status Management**: Mark prayers as completed, missed, or pending
- **Historical Data**: View prayer history and patterns
- **Location-based Times**: Automatic prayer time calculation
- **Consistency Tracking**: Monitor your prayer consistency over time

### Quran Reading
- **Complete Surah Database**: All 114 Surahs with details
- **Flexible Logging**: Track ayah ranges, pages, and notes
- **Reading Streaks**: Monitor consecutive days of reading
- **Progress Insights**: Visual charts of reading patterns
- **Session Management**: Edit or delete reading sessions

### Analytics Dashboard
- **Real-time Updates**: Live data synchronization
- **Interactive Charts**: Bar charts, line charts, and pie charts
- **Statistics**: Completion rates, streaks, and trends
- **Recent Activity**: Timeline of recent worship activities
- **Quick Actions**: Fast access to tracking features

## 🔐 Security Features

- **Row Level Security**: Database-level security for user data
- **Authentication**: Secure login/signup with Supabase Auth
- **OAuth Support**: Google and GitHub login options
- **Data Privacy**: User data is isolated and secure
- **Password Security**: Secure password handling

## 📱 Browser Support

- **Chrome** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

**Required Features:**
- Geolocation API (for prayer times)
- Notifications API (for prayer reminders)
- Service Worker (for background notifications)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
1. Follow the existing code style
2. Add TypeScript types for new features
3. Write meaningful commit messages
4. Test your changes thoroughly
5. Update documentation if needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Al-Adhan API** for providing accurate prayer times
- **Supabase** for the excellent backend-as-a-service platform
- **shadcn/ui** for the beautiful and accessible UI components
- **OpenStreetMap/Nominatim** for location services fallback

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-username/ibadah-tracker/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Made with ❤️ for the Muslim Ummah**

*May this application help you in your journey of becoming closer to Allah (SWT).*