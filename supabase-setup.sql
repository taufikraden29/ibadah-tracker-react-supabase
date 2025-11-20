-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create daily_prayers table
CREATE TABLE IF NOT EXISTS daily_prayers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prayer_name TEXT NOT NULL CHECK (prayer_name IN ('Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha')),
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'missed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prayer_name, date)
);

-- Create quran_progress table
CREATE TABLE IF NOT EXISTS quran_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  surah INTEGER NOT NULL CHECK (surah >= 1 AND surah <= 114),
  ayah_start INTEGER NOT NULL CHECK (ayah_start >= 1),
  ayah_end INTEGER NOT NULL CHECK (ayah_end >= ayah_start),
  pages_read INTEGER NOT NULL DEFAULT 1 CHECK (pages_read > 0),
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for daily_prayers table
DROP TRIGGER IF EXISTS update_daily_prayers_updated_at ON daily_prayers;
CREATE TRIGGER update_daily_prayers_updated_at
  BEFORE UPDATE ON daily_prayers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on both tables
ALTER TABLE daily_prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_prayers
-- Users can view their own prayer records
CREATE POLICY "Users can view own daily prayers" ON daily_prayers
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own prayer records
CREATE POLICY "Users can insert own daily prayers" ON daily_prayers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own prayer records
CREATE POLICY "Users can update own daily prayers" ON daily_prayers
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own prayer records
CREATE POLICY "Users can delete own daily prayers" ON daily_prayers
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for quran_progress
-- Users can view their own Quran progress
CREATE POLICY "Users can view own quran progress" ON quran_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own Quran progress
CREATE POLICY "Users can insert own quran progress" ON quran_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own Quran progress
CREATE POLICY "Users can update own quran progress" ON quran_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own Quran progress
CREATE POLICY "Users can delete own quran progress" ON quran_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_prayers_user_date ON daily_prayers(user_id, date);
CREATE INDEX IF NOT EXISTS idx_quran_progress_user_timestamp ON quran_progress(user_id, timestamp DESC);