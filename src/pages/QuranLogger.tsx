import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { BookOpen, Plus, Trash2, Loader2, TrendingUp, Calendar, Award, Target } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import {
  logQuranReading,
  getQuranProgress,
  getQuranStats,
  deleteQuranSession,
  QURAN_SURAH_DATA,
  type QuranProgress,
  type QuranStats
} from '../api/quran'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { toast } from 'sonner'

const quranReadingSchema = z.object({
  surah: z.string().min(1, 'Please select a Surah'),
  ayahStart: z.number().min(1, 'Start ayah must be at least 1'),
  ayahEnd: z.number().min(1, 'End ayah must be at least 1'),
  pagesRead: z.number().min(1, 'Must read at least 1 page'),
  notes: z.string().optional(),
}).refine((data) => data.ayahEnd >= data.ayahStart, {
  message: "End ayah must be greater than or equal to start ayah",
  path: ["ayahEnd"],
})

type QuranReadingFormData = z.infer<typeof quranReadingSchema>

interface ReadingSessionCardProps {
  session: QuranProgress
  onDelete: (sessionId: string) => void
  isDeleting: boolean
}

function ReadingSessionCard({ session, onDelete, isDeleting }: ReadingSessionCardProps) {
  const surahInfo = QURAN_SURAH_DATA.find(s => s.number === session.surah)

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {surahInfo?.englishName || `Surah ${session.surah}`}
            </CardTitle>
            <CardDescription>
              {surahInfo?.name} • Ayah {session.ayah_start}-{session.ayah_end}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{session.pages_read} pages</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(session.id)}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Read on {format(new Date(session.timestamp), 'MMM d, yyyy • h:mm a')}
          </div>
          {session.notes && (
            <div className="text-sm bg-gray-50 p-2 rounded border">
              <span className="font-medium">Notes:</span> {session.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
            {trend.value}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function QuranLogger() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form setup
  const form = useForm<QuranReadingFormData>({
    resolver: zodResolver(quranReadingSchema),
    defaultValues: {
      surah: '',
      ayahStart: 1,
      ayahEnd: 1,
      pagesRead: 1,
      notes: '',
    },
  })

  // Watch surah selection to update ayah validation
  const selectedSurah = form.watch('surah')
  const selectedSurahInfo = selectedSurah
    ? QURAN_SURAH_DATA.find(s => s.number.toString() === selectedSurah)
    : null

  // Update form schema when surah changes
  React.useEffect(() => {
    if (selectedSurahInfo) {
      form.setValue('ayahEnd', Math.min(form.getValues('ayahEnd'), selectedSurahInfo.ayahs))
      form.setValue('ayahStart', Math.min(form.getValues('ayahStart'), selectedSurahInfo.ayahs))
    }
  }, [selectedSurah, selectedSurahInfo, form])

  // Queries
  const {
    data: readingSessions = [],
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = useQuery({
    queryKey: ['quranProgress', user?.id],
    queryFn: () => getQuranProgress(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ['quranStats', user?.id],
    queryFn: () => getQuranStats(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 15, // 15 minutes
  })

  // Mutations
  const logReadingMutation = useMutation({
    mutationFn: logQuranReading,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quranProgress', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['quranStats', user?.id] })
      form.reset()
      setIsDialogOpen(false)
      toast.success('Quran reading session logged successfully!')
    },
    onError: () => {
      toast.error('Failed to log reading session')
    },
  })

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => deleteQuranSession(sessionId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quranProgress', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['quranStats', user?.id] })
      toast.success('Reading session deleted')
    },
    onError: () => {
      toast.error('Failed to delete reading session')
    },
  })

  const onSubmit = (data: QuranReadingFormData) => {
    if (!user) return

    logReadingMutation.mutate({
      user_id: user.id,
      surah: parseInt(data.surah),
      ayah_start: data.ayahStart,
      ayah_end: data.ayahEnd,
      pages_read: data.pagesRead,
      notes: data.notes,
      timestamp: new Date().toISOString(),
    })
  }

  const handleDeleteSession = (sessionId: string) => {
    deleteSessionMutation.mutate(sessionId)
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>Please sign in to track your Quran reading.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quran Reading Logger</h1>
        <p className="text-gray-600">Track your Quran reading progress and maintain consistency</p>
      </div>

      {/* Stats Section */}
      {!isLoadingStats && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Sessions"
            value={stats.totalSessions}
            description="Reading sessions logged"
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Pages Read"
            value={stats.totalPagesRead}
            description="Total pages completed"
            icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Current Streak"
            value={`${stats.currentStreak} days`}
            description="Days of consistent reading"
            icon={<Award className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Avg Pages/Session"
            value={stats.averagePagesPerSession.toFixed(1)}
            description="Pages per reading session"
            icon={<Target className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      )}

      {/* Action Button */}
      <div className="mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Log Reading Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Log Quran Reading Session</DialogTitle>
              <DialogDescription>
                Record your Quran reading progress
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="surah"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surah</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Surah" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {QURAN_SURAH_DATA.map((surah) => (
                            <SelectItem key={surah.number} value={surah.number.toString()}>
                              {surah.number}. {surah.englishName} ({surah.name}) - {surah.ayahs} ayahs
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ayahStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Ayah</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={selectedSurahInfo?.ayahs || 1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ayahEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Ayah</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={form.getValues('ayahStart') || 1}
                            max={selectedSurahInfo?.ayahs || 1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="pagesRead"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pages Read</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any reflections or notes about your reading..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={logReadingMutation.isPending}
                  >
                    {logReadingMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Log Session'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recently Read Surahs */}
      {!isLoadingStats && stats?.recentlyReadSurahs && stats.recentlyReadSurahs.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Recently Read Surahs</CardTitle>
            <CardDescription>Your most frequently read surahs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentlyReadSurahs.map((surah, index) => (
                <div key={surah.surah} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{surah.surahName}</div>
                      <div className="text-sm text-muted-foreground">
                        {surah.sessions} sessions • {surah.pagesRead} pages
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{surah.pagesRead} pages</div>
                    <Progress value={(surah.pagesRead / 50) * 100} className="w-20 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error States */}
      {(sessionsError || statsError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Failed to load Quran reading data. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Reading Sessions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Reading Sessions</h2>

        {isLoadingSessions ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading reading sessions...</p>
            </div>
          </div>
        ) : readingSessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reading sessions yet</h3>
              <p className="text-gray-600 text-center mb-4">
                Start tracking your Quran reading progress by logging your first session.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {readingSessions.map((session) => (
              <ReadingSessionCard
                key={session.id}
                session={session}
                onDelete={handleDeleteSession}
                isDeleting={deleteSessionMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}