import { supabase } from '../lib/supabaseClient'
import { Database } from '../lib/supabaseClient'

type DailyPrayer = Database['public']['Tables']['daily_prayers']['Row']
type DailyPrayerInsert = Database['public']['Tables']['daily_prayers']['Insert']
type DailyPrayerUpdate = Database['public']['Tables']['daily_prayers']['Update']

export interface PrayerTimes {
  Fajr: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

export interface LocationData {
  latitude: number
  longitude: number
  city?: string
  country?: string
}

export interface PrayerApiResponse {
  times: PrayerTimes
  date: string
  location: LocationData
}

// Fetch prayer times from Al-Adhan API
export async function fetchPrayerTimes(location: LocationData, date?: string): Promise<PrayerApiResponse> {
  const targetDate = date || new Date().toISOString().split('T')[0]
  const [year, month, day] = targetDate.split('-').map(Number)

  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    method: '2', // Islamic Society of North America (ISNA)
    school: '1', // Shafi
    tune: '0,0,0,0,0,0', // No adjustments
  })

  const response = await fetch(
    `https://api.aladhan.com/v1/calendar/${year}/${month}?${params}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch prayer times')
  }

  const data = await response.json()
  const dayData = data.data.find((item: any) => item.date.gregorian.day === day.toString())

  if (!dayData) {
    throw new Error('Prayer times not found for the specified date')
  }

  return {
    times: {
      Fajr: dayData.timings.Fajr,
      Dhuhr: dayData.timings.Dhuhr,
      Asr: dayData.timings.Asr,
      Maghrib: dayData.timings.Maghrib,
      Isha: dayData.timings.Isha,
    },
    date: targetDate,
    location,
  }
}

// Get user's current location
export async function getUserLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    )
  })
}

// Get location from city name using Nominatim API
export async function getLocationFromCity(city: string): Promise<LocationData> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch location data')
  }

  const data = await response.json()

  if (data.length === 0) {
    throw new Error('City not found')
  }

  const location = data[0]
  return {
    latitude: parseFloat(location.lat),
    longitude: parseFloat(location.lon),
    city: location.display_name.split(',')[0],
    country: location.display_name.split(',').slice(-1)[0].trim(),
  }
}

// Database operations for daily prayers
export async function getDailyPrayers(userId: string, date: string): Promise<DailyPrayer[]> {
  const { data, error } = await supabase
    .from('daily_prayers')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Error fetching daily prayers: ${error.message}`)
  }

  return data || []
}

export async function upsertPrayerStatus(
  userId: string,
  prayerName: DailyPrayerInsert['prayer_name'],
  date: string,
  status: DailyPrayerInsert['status']
): Promise<DailyPrayer> {
  const { data, error } = await supabase
    .from('daily_prayers')
    .upsert({
      user_id: userId,
      prayer_name: prayerName,
      date,
      status,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating prayer status: ${error.message}`)
  }

  return data
}

export async function getPrayerHistory(
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyPrayer[]> {
  const { data, error } = await supabase
    .from('daily_prayers')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Error fetching prayer history: ${error.message}`)
  }

  return data || []
}

export async function getPrayerStats(userId: string, days: number = 30): Promise<{
  totalPrayers: number
  completedPrayers: number
  missedPrayers: number
  completionRate: number
  prayerStats: Record<string, { completed: number; total: number }>
}> {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  const prayers = await getPrayerHistory(userId, startDateStr, endDate)

  const totalPrayers = days * 5 // 5 prayers per day
  const completedPrayers = prayers.filter(p => p.status === 'completed').length
  const missedPrayers = prayers.filter(p => p.status === 'missed').length

  const prayerStats: Record<string, { completed: number; total: number }> = {
    Fajr: { completed: 0, total: days },
    Dhuhr: { completed: 0, total: days },
    Asr: { completed: 0, total: days },
    Maghrib: { completed: 0, total: days },
    Isha: { completed: 0, total: days },
  }

  prayers.forEach(prayer => {
    if (prayer.status === 'completed') {
      prayerStats[prayer.prayer_name].completed++
    }
  })

  return {
    totalPrayers,
    completedPrayers,
    missedPrayers,
    completionRate: totalPrayers > 0 ? (completedPrayers / totalPrayers) * 100 : 0,
    prayerStats,
  }
}