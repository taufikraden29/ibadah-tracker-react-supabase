import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { MapPin, Clock, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import {
  fetchPrayerTimes,
  getUserLocation,
  getLocationFromCity,
  getDailyPrayers,
  upsertPrayerStatus,
  type PrayerTimes,
  type LocationData,
  type PrayerApiResponse
} from '../api/prayers'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Switch } from '../components/ui/switch'
import { toast } from 'sonner'

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const
type PrayerName = typeof PRAYER_NAMES[number]

interface PrayerCardProps {
  name: PrayerName
  time: string
  status: 'completed' | 'missed' | 'pending'
  onToggle: (name: PrayerName, newStatus: 'completed' | 'missed' | 'pending') => void
  isUpdating: boolean
}

function PrayerCard({ name, time, status, onToggle, isUpdating }: PrayerCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'missed':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'missed':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const handleToggle = () => {
    if (status === 'completed') {
      onToggle(name, 'pending')
    } else if (status === 'pending') {
      onToggle(name, 'completed')
    } else {
      onToggle(name, 'pending')
    }
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {getStatusIcon()}
            {name}
          </CardTitle>
          <div className="text-right">
            <div className="text-sm font-medium">{time}</div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(`2000-01-01 ${time}`), 'h:mm a')}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              checked={status === 'completed'}
              onCheckedChange={handleToggle}
              disabled={isUpdating}
            />
            <span className="text-sm capitalize">
              {status === 'completed' ? 'Completed' : status === 'missed' ? 'Missed' : 'Pending'}
            </span>
          </div>
          {isUpdating && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function PrayerTracker() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [cityInput, setCityInput] = useState('')
  const [showCityInput, setShowCityInput] = useState(false)

  // Query for prayer times
  const {
    data: prayerData,
    isLoading: isLoadingPrayers,
    error: prayerError,
    refetch: refetchPrayers,
  } = useQuery({
    queryKey: ['prayerTimes', selectedDate],
    queryFn: async () => {
      // Try to get user location first
      try {
        const location = await getUserLocation()
        return await fetchPrayerTimes(location, selectedDate)
      } catch (error) {
        // Fallback to a default location (Mecca)
        const defaultLocation: LocationData = {
          latitude: 21.4225,
          longitude: 39.8262,
          city: 'Mecca',
          country: 'Saudi Arabia',
        }
        return await fetchPrayerTimes(defaultLocation, selectedDate)
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
  })

  // Query for prayer statuses
  const {
    data: prayerStatuses,
    isLoading: isLoadingStatuses,
    error: statusError,
  } = useQuery({
    queryKey: ['dailyPrayers', user?.id, selectedDate],
    queryFn: () => getDailyPrayers(user!.id, selectedDate),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Mutation for updating prayer status
  const updatePrayerMutation = useMutation({
    mutationFn: async ({ prayerName, status }: { prayerName: PrayerName; status: 'completed' | 'missed' | 'pending' }) => {
      if (!user) throw new Error('User not authenticated')
      return await upsertPrayerStatus(user.id, prayerName, selectedDate, status)
    },
    onMutate: async ({ prayerName, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['dailyPrayers', user?.id, selectedDate] })

      // Snapshot the previous value
      const previousStatuses = queryClient.getQueryData(['dailyPrayers', user?.id, selectedDate])

      // Optimistically update
      queryClient.setQueryData(['dailyPrayers', user?.id, selectedDate], (old: any) => {
        if (!old) return old
        return old.map((prayer: any) =>
          prayer.prayer_name === prayerName ? { ...prayer, status } : prayer
        )
      })

      return { previousStatuses }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousStatuses) {
        queryClient.setQueryData(['dailyPrayers', user?.id, selectedDate], context.previousStatuses)
      }
      toast.error('Failed to update prayer status')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['dailyPrayers', user?.id, selectedDate] })
    },
    onSuccess: () => {
      toast.success('Prayer status updated successfully')
    },
  })

  // Mutation for manual city location
  const cityLocationMutation = useMutation({
    mutationFn: getLocationFromCity,
    onSuccess: async (location) => {
      try {
        const prayerData = await fetchPrayerTimes(location, selectedDate)
        queryClient.setQueryData(['prayerTimes', selectedDate], prayerData)
        setShowCityInput(false)
        setCityInput('')
        toast.success(`Prayer times updated for ${location.city}`)
      } catch (error) {
        toast.error('Failed to fetch prayer times for this city')
      }
    },
    onError: () => {
      toast.error('City not found. Please try a different city name.')
    },
  })

  const handleLocationRequest = async () => {
    try {
      const location = await getUserLocation()
      const prayerData = await fetchPrayerTimes(location, selectedDate)
      queryClient.setQueryData(['prayerTimes', selectedDate], prayerData)
      toast.success('Prayer times updated based on your location')
    } catch (error) {
      setShowCityInput(true)
      toast.info('Please enable location access or enter your city manually')
    }
  }

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cityInput.trim()) {
      cityLocationMutation.mutate(cityInput.trim())
    }
  }

  const handlePrayerToggle = (prayerName: PrayerName, newStatus: 'completed' | 'missed' | 'pending') => {
    updatePrayerMutation.mutate({ prayerName, status: newStatus })
  }

  const getPrayerStatus = (prayerName: PrayerName) => {
    const prayer = prayerStatuses?.find(p => p.prayer_name === prayerName)
    return prayer?.status || 'pending'
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>Please sign in to track your prayers.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Prayer Tracker</h1>
        <p className="text-gray-600">Track your daily prayers and monitor your consistency</p>
      </div>

      {/* Date and Location Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                {prayerData?.location.city && (
                  <>
                    <MapPin className="h-4 w-4" />
                    {prayerData.location.city}, {prayerData.location.country}
                  </>
                )}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLocationRequest}
                  disabled={isLoadingPrayers}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Use My Location
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchPrayers()}
                  disabled={isLoadingPrayers}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingPrayers ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* City Input Form */}
        {showCityInput && (
          <CardContent className="pt-0">
            <form onSubmit={handleCitySubmit} className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="city" className="text-sm">Enter your city:</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="e.g., New York, London, Jakarta"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  disabled={cityLocationMutation.isPending}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={cityLocationMutation.isPending}>
                  {cityLocationMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Set Location'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCityInput(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Error States */}
      {(prayerError || statusError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {prayerError?.message || statusError?.message || 'Failed to load prayer data'}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {(isLoadingPrayers || isLoadingStatuses) && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading prayer times...</p>
          </div>
        </div>
      )}

      {/* Prayer Cards */}
      {prayerData && !isLoadingPrayers && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PRAYER_NAMES.map((prayerName) => (
            <PrayerCard
              key={prayerName}
              name={prayerName}
              time={prayerData.times[prayerName]}
              status={getPrayerStatus(prayerName)}
              onToggle={handlePrayerToggle}
              isUpdating={updatePrayerMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}