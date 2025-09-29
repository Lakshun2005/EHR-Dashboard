"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  Home,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Brain,
  FileText,
  MessageSquare,
  Calendar,
  Heart,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Toaster } from "sonner"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Clinical AI", href: "/clinical-ai", icon: Brain },
  { name: "Smart Documentation", href: "/documentation", icon: FileText },
  { name: "Communication", href: "/communication", icon: MessageSquare },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Medical Records", href: "/records", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
]

const settingsNavigation = [{ name: "Settings", href: "/settings", icon: Settings }]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth")
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <nav className="flex-grow space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center w-full justify-start px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <nav className="mt-auto space-y-1">
        {settingsNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center w-full justify-start px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-card md:block h-full">
        <div className="flex h-full max-h-screen flex-col gap-2 p-4">
          <div className="flex h-14 items-center gap-2 px-4 lg:h-[60px] lg:px-6 mb-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              <span>HealthCare EHR</span>
            </Link>
          </div>
          <SidebarContent />
        </div>
      </aside>

      <div className="flex flex-col">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm">HealthCare EHR</span>
          </Link>
          <div className="ml-auto">
            <UserMenu onSignOut={handleSignOut} />
          </div>
        </header>

        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <aside className="fixed inset-y-0 left-0 z-10 w-full bg-card p-4 animate-in slide-in-from-left-full md:hidden">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-14 items-center justify-between gap-2 px-4 lg:h-[60px] lg:px-6 mb-4">
                <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setIsSidebarOpen(false)}>
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span>HealthCare EHR</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarContent />
            </div>
          </aside>
        )}

        {/* Desktop Header */}
        <header className="hidden h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 md:flex">
          <div>
            <h1 className="text-lg font-semibold capitalize">
              {pathname === "/" ? "Dashboard" : pathname.split("/").pop()}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <NotificationMenu />
            <UserMenu onSignOut={handleSignOut} />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background overflow-auto">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}

const UserMenu = ({ onSignOut }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Avatar className="w-8 h-8">
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          <AvatarFallback>DR</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>Dr. Alex Evans</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuItem>Support</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Sign out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

const NotificationMenu = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("patient_alerts")
        .select("*, patients(first_name, last_name)")
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) {
        console.error("Error fetching alerts:", error)
      } else {
        setAlerts(data)
      }
      setLoading(false)
    }

    fetchAlerts()
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-2 text-sm text-center text-muted-foreground">Loading...</div>
        ) : alerts.length === 0 ? (
          <div className="p-2 text-sm text-center text-muted-foreground">No new notifications</div>
        ) : (
          alerts.map((alert) => (
            <DropdownMenuItem key={alert.id} className="flex flex-col items-start gap-1">
              <div className="font-medium">{alert.alert_message}</div>
              <div className="text-xs text-muted-foreground">
                {alert.patients.first_name} {alert.patients.last_name} -{" "}
                {new Date(alert.created_at).toLocaleTimeString()}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}