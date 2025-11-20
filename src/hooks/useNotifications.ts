import { useState, useEffect, useCallback } from 'react'
import { fetchPrayerTimes, getUserLocation, type PrayerTimes, type LocationData } from '../api/prayers'

export interface NotificationSettings {
  enabled: boolean
  prayerReminders: {
    Fajr: boolean
    Dhuhr: boolean
    Asr: boolean
    Maghrib: boolean
    Isha: boolean
  }
  reminderMinutes: number // Minutes before prayer time
  soundEnabled: boolean
}

export interface ScheduledNotification {
  id: string
  prayerName: string
  time: string
  scheduledTime: Date
  message: string
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  prayerReminders: {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
  reminderMinutes: 10,
  soundEnabled: true,
}

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([])
  const [isSupported, setIsSupported] = useState(false)

  // Check if notifications are supported
  useEffect(() => {
    setIsSupported('Notification' in window)

    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('notificationSettings')
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) })
      }
    } catch (error) {
      console.error('Error loading notification settings:', error)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: NotificationSettings) => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(newSettings))
      setSettings(newSettings)
    } catch (error) {
      console.error('Error saving notification settings:', error)
    }
  }, [])

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false
    }

    if (Notification.permission === 'granted') {
      setPermission('granted')
      return true
    }

    if (Notification.permission !== 'denied') {
      const permissionResult = await Notification.requestPermission()
      setPermission(permissionResult)
      return permissionResult === 'granted'
    }

    return false
  }, [isSupported])

  // Show a notification immediately
  const showNotification = useCallback((
    title: string,
    options?: NotificationOptions & { onClick?: () => void }
  ) => {
    if (!isSupported || permission !== 'granted' || !settings.enabled) {
      return false
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'ibadah-tracker',
        requireInteraction: true,
        ...options,
      })

      if (options?.onClick) {
        notification.onclick = options.onClick
      }

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close()
      }, 10000)

      return true
    } catch (error) {
      console.error('Error showing notification:', error)
      return false
    }
  }, [isSupported, permission, settings.enabled])

  // Schedule prayer notifications for a specific day
  const schedulePrayerNotifications = useCallback(async (
    prayerTimes: PrayerTimes,
    date: string = new Date().toISOString().split('T')[0]
  ) => {
    if (!settings.enabled || permission !== 'granted') {
      return []
    }

    const notifications: ScheduledNotification[] = []
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

    for (const prayerName of prayers) {
      if (!settings.prayerReminders[prayerName]) {
        continue
      }

      const prayerTime = prayerTimes[prayerName]
      if (!prayerTime) continue

      // Parse prayer time (assuming format is "HH:MM")
      const [hours, minutes] = prayerTime.split(':').map(Number)
      const prayerDateTime = new Date(date)
      prayerDateTime.setHours(hours, minutes, 0, 0)

      // Subtract reminder minutes
      const reminderTime = new Date(prayerDateTime.getTime() - settings.reminderMinutes * 60000)

      // Only schedule if reminder time is in the future
      if (reminderTime > new Date()) {
        const notification: ScheduledNotification = {
          id: `${prayerName}-${date}-${Date.now()}`,
          prayerName,
          time: prayerTime,
          scheduledTime: reminderTime,
          message: `Time for ${prayerName} prayer in ${settings.reminderMinutes} minutes`,
        }

        notifications.push(notification)

        // Schedule the notification
        const timeoutId = setTimeout(() => {
          showNotification(notification.message, {
            body: `It's time to prepare for ${prayerName} prayer.`,
            tag: `prayer-${prayerName}`,
            onClick: () => {
              // Focus on the prayer tracker page
              window.location.href = '/prayers'
            },
          })
        }, reminderTime.getTime() - Date.now())

        // Store timeout ID for cleanup
        ;(notification as any).timeoutId = timeoutId
      }
    }

    setScheduledNotifications(prev => [...prev, ...notifications])
    return notifications
  }, [settings, permission, showNotification])

  // Clear all scheduled notifications
  const clearScheduledNotifications = useCallback(() => {
    scheduledNotifications.forEach(notification => {
      if ((notification as any).timeoutId) {
        clearTimeout((notification as any).timeoutId)
      }
    })
    setScheduledNotifications([])
  }, [scheduledNotifications])

  // Auto-schedule notifications for today's prayers
  const scheduleTodaysPrayers = useCallback(async () => {
    try {
      // Get user location and prayer times
      let location: LocationData
      try {
        location = await getUserLocation()
      } catch (error) {
        // Fallback to default location
        location = {
          latitude: 21.4225,
          longitude: 39.8262,
          city: 'Mecca',
          country: 'Saudi Arabia',
        }
      }

      const prayerData = await fetchPrayerTimes(location)
      await schedulePrayerNotifications(prayerData.times)
    } catch (error) {
      console.error('Error scheduling today\'s prayers:', error)
    }
  }, [schedulePrayerNotifications])

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    saveSettings(updatedSettings)

    // If notifications were disabled, clear scheduled notifications
    if (!updatedSettings.enabled) {
      clearScheduledNotifications()
    }
  }, [settings, saveSettings, clearScheduledNotifications])

  // Enable/disable prayer reminders
  const togglePrayerReminder = useCallback((prayerName: keyof typeof settings.prayerReminders) => {
    updateSettings({
      prayerReminders: {
        ...settings.prayerReminders,
        [prayerName]: !settings.prayerReminders[prayerName],
      },
    })
  }, [settings.prayerReminders, updateSettings])

  // Set reminder minutes
  const setReminderMinutes = useCallback((minutes: number) => {
    updateSettings({ reminderMinutes: minutes })
  }, [updateSettings])

  // Toggle sound
  const toggleSound = useCallback(() => {
    updateSettings({ soundEnabled: !settings.soundEnabled })
  }, [settings.soundEnabled, updateSettings])

  // Test notification
  const testNotification = useCallback(() => {
    showNotification('Test Notification', {
      body: 'This is a test notification from Ibadah Tracker.',
      tag: 'test',
    })
  }, [showNotification])

  return {
    // State
    settings,
    permission,
    isSupported,
    scheduledNotifications,

    // Actions
    requestPermission,
    showNotification,
    schedulePrayerNotifications,
    scheduleTodaysPrayers,
    clearScheduledNotifications,
    updateSettings,
    togglePrayerReminder,
    setReminderMinutes,
    toggleSound,
    testNotification,

    // Computed
    canRequestPermission: isSupported && permission === 'default',
    canShowNotifications: isSupported && permission === 'granted' && settings.enabled,
    isPermissionDenied: isSupported && permission === 'denied',
  }
}