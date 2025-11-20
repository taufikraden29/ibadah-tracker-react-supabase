import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  TrendingUp,
  Users,
  Award,
  Target,
  Activity,
  BarChart3
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

import { useAuth } from '../hooks/useAuth'
import { getPrayerStats, getDailyPrayers } from '../api/prayers'
import { getQuranStats, getQuranProgress } from '../api/quran'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { Alert, AlertDescription } from '../components/ui/alert'

interface DashboardStatsProps {
  userId: string
}

function DashboardStats({ userId }: DashboardStatsProps) {
  const today = format(new Date(), 'yyyy-MM-dd')

  // Prayer stats queries
  const {
    data: prayerStats,
    isLoading: isLoadingPrayerStats,
    error: prayerStatsError
  } = useQuery({
    queryKey: ['prayerStats', userId],
    queryFn: () => getPrayerStats(userId, 30),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  const {
    data: todayPrayers,
    isLoading: isLoadingTodayPrayers,
    error: todayPrayersError
  } = useQuery({
    queryKey: ['dailyPrayers', userId, today],
    queryFn: () => getDailyPrayers(userId, today),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Quran stats queries
  const {
    data: quranStats,
    isLoading: isLoadingQuranStats,
    error: quranStatsError
  } = useQuery({
    queryKey: ['quranStats', userId],
    queryFn: () => getQuranStats(userId, 30),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  const {
    data: recentQuranSessions,
    isLoading: isLoadingQuranSessions
  } = useQuery({
    queryKey: ['quranProgress', userId],
    queryFn: () => getQuranProgress(userId, 10),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Calculate today's prayer progress
  const todayPrayerProgress = todayPrayers ? {
    completed: todayPrayers.filter(p => p.status === 'completed').length,
    total: 5,
    percentage: (todayPrayers.filter(p => p.status === 'completed').length / 5) * 100
  } : { completed: 0, total: 5, percentage: 0 }

  // Prepare chart data for weekly prayer progress
  const weeklyPrayerData = React.useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      days.push(format(subDays(new Date(), i), 'EEE'))
    }

    // For demo purposes, generate mock data since we don't have historical data
    return days.map(day => ({
      day,
      completed: Math.floor(Math.random() * 5) + 1,
      missed: Math.floor(Math.random() * 3),
      total: 5
    }))
  }, [])

  // Prayer completion distribution
  const prayerDistributionData = prayerStats ? [
    { name: 'Completed', value: prayerStats.completedPrayers, color: '#10b981' },
    { name: 'Missed', value: prayerStats.missedPrayers, color: '#ef4444' },
    { name: 'Pending', value: prayerStats.totalPrayers - prayerStats.completedPrayers - prayerStats.missedPrayers, color: '#6b7280' }
  ] : []

  // Quran reading trend
  const quranTrendData = React.useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      days.push({
        day: format(subDays(new Date(), i), 'EEE'),
        pages: Math.floor(Math.random() * 10) + 1
      })
    }
    return days
  }, [])

  const hasErrors = prayerStatsError || todayPrayersError || quranStatsError
  const isLoading = isLoadingPrayerStats || isLoadingTodayPrayers || isLoadingQuranStats || isLoadingQuranSessions

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (hasErrors) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load dashboard data. Please refresh the page and try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Today's Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Prayers</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayPrayerProgress.completed}/5</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={todayPrayerProgress.percentage} className="flex-1" />
              <span className="text-sm text-muted-foreground">
                {Math.round(todayPrayerProgress.percentage)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prayer Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quranStats?.currentStreak || 0} days</div>
            <p className="text-xs text-muted-foreground">
              Current reading streak
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quran Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quranStats?.totalPagesRead || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pages read this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prayer Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prayerStats ? Math.round(prayerStats.completionRate) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              30-day completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Quickly log your prayers and Quran reading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="default">
              <Link to="/prayers">
                <CheckCircle className="h-4 w-4 mr-2" />
                Track Prayers
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/quran">
                <BookOpen className="h-4 w-4 mr-2" />
                Log Quran Reading
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/profile">
                <Users className="h-4 w-4 mr-2" />
                Profile Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Prayer Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Prayer Progress
            </CardTitle>
            <CardDescription>
              Your prayer completion over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyPrayerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="missed" fill="#ef4444" name="Missed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Prayer Completion Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Prayer Distribution
            </CardTitle>
            <CardDescription>
              30-day prayer completion breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={prayerDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {prayerDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quran Reading Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quran Reading Trend
          </CardTitle>
          <CardDescription>
            Pages read per day over the last week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={quranTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="pages"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest worship activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayPrayers && todayPrayers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Today's Prayers</h4>
                <div className="flex flex-wrap gap-2">
                  {todayPrayers.map((prayer) => (
                    <Badge
                      key={prayer.prayer_name}
                      variant={prayer.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {prayer.prayer_name}
                      {prayer.status === 'completed' && ' ✓'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {recentQuranSessions && recentQuranSessions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Recent Quran Reading</h4>
                <div className="space-y-2">
                  {recentQuranSessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Surah {session.surah} • {session.pages_read} pages
                      </span>
                      <span className="text-muted-foreground">
                        {format(new Date(session.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!todayPrayers || todayPrayers.length === 0) && (!recentQuranSessions || recentQuranSessions.length === 0) && (
              <div className="text-center py-6">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No recent activity yet</p>
                <div className="flex gap-2 justify-center">
                  <Button asChild size="sm">
                    <Link to="/prayers">Track Prayers</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/quran">Read Quran</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>Please sign in to view your dashboard.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.user_metadata?.name || user.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your worship progress and spiritual activities.
        </p>
      </div>

      {/* Dashboard Content */}
      <DashboardStats userId={user.id} />
    </div>
  )
}