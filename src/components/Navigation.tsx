import React from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  User,
  Settings,
  Bell,
  LogOut,
  Mosque,
  Moon,
  Sun
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { Button } from './ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from './ui/sidebar'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { toast } from 'sonner'

const navigationItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    description: 'Overview of your progress'
  },
  {
    title: 'Prayer Tracker',
    icon: Calendar,
    path: '/prayers',
    description: 'Track daily prayers'
  },
  {
    title: 'Quran Logger',
    icon: BookOpen,
    path: '/quran',
    description: 'Log Quran reading'
  },
]

function NavigationContent() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { settings, updateSettings, requestPermission, canRequestPermission } = useNotifications()

  const handleSignOut = async () => {
    const result = await signOut()
    if (!result.success) {
      toast.error('Failed to sign out')
    }
  }

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && canRequestPermission) {
      const granted = await requestPermission()
      if (!granted) {
        toast.error('Notification permission denied')
        return
      }
    }
    updateSettings({ enabled })
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="pb-4">
          <div className="flex items-center gap-2 px-2 py-1">
            <Mosque className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Ibadah Tracker</span>
              <span className="text-xs text-muted-foreground">Islamic Worship Tracker</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path

                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link to={item.path}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-3"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </motion.div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Link to="/profile">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton>
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80" align="start">
                      <DropdownMenuLabel>Notification Settings</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <div className="p-2">
                        <div className="flex items-center justify-between space-x-2">
                          <Label htmlFor="notifications" className="text-sm">
                            Enable Notifications
                          </Label>
                          <Switch
                            id="notifications"
                            checked={settings.enabled}
                            onCheckedChange={handleNotificationToggle}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Get prayer reminders and progress updates
                        </p>
                      </div>

                      {settings.enabled && (
                        <div className="p-2 space-y-3">
                          <div className="text-sm font-medium">Prayer Reminders</div>
                          {Object.entries(settings.prayerReminders).map(([prayer, enabled]) => (
                            <div key={prayer} className="flex items-center justify-between space-x-2">
                              <Label htmlFor={prayer} className="text-sm">
                                {prayer}
                              </Label>
                              <Switch
                                id={prayer}
                                checked={enabled}
                                onCheckedChange={(checked) =>
                                  updateSettings({
                                    prayerReminders: {
                                      ...settings.prayerReminders,
                                      [prayer]: checked
                                    }
                                  })
                                }
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {user && (
            <div className="p-2 border-t border-sidebar-border">
              <div className="flex items-center gap-2 px-2 py-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user.user_metadata?.name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">
                    {user.user_metadata?.name || user.email?.split('@')[0]}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <SidebarTrigger />
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <div className="w-full flex-1 md:w-auto md:flex-none">
                <Button variant="ghost" size="sm" className="text-xs">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                {settings.enabled && (
                  <Badge variant="secondary" className="text-xs">
                    <Bell className="h-3 w-3 mr-1" />
                    Notifications On
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export function Navigation() {
  return <NavigationContent />
}