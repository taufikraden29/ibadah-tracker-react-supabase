import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Database = {
  public: {
    Tables: {
      daily_prayers: {
        Row: {
          id: string
          user_id: string
          prayer_name: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'
          date: string
          status: 'completed' | 'missed' | 'pending'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prayer_name: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'
          date: string
          status?: 'completed' | 'missed' | 'pending'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prayer_name?: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'
          date?: string
          status?: 'completed' | 'missed' | 'pending'
          created_at?: string
          updated_at?: string
        }
      }
      quran_progress: {
        Row: {
          id: string
          user_id: string
          surah: number
          ayah_start: number
          ayah_end: number
          pages_read: number
          notes?: string
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          surah: number
          ayah_start: number
          ayah_end: number
          pages_read: number
          notes?: string
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          surah?: number
          ayah_start?: number
          ayah_end?: number
          pages_read?: number
          notes?: string
          timestamp?: string
          created_at?: string
        }
      }
    }
  }
}