"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Home, Users, Target, FileText, Calendar, BarChart3, LogOut, Globe } from "lucide-react"
import Link from "next/link"

interface DashboardUser {
  _id: string
  name: string
  email: string
  role: string
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/")
  }

  const isAdmin = user?.role === "Super Admin" || user?.role === "Domain Head"

  const menuItems = [
    {
      title: "Dashboard",
      url: isAdmin ? "/admin" : "/dashboard",
      icon: Home,
    },
    ...(isAdmin
      ? [
          {
            title: "Volunteers",
            url: "/admin/volunteers",
            icon: Users,
          },
          {
            title: "Tasks",
            url: "/admin/tasks",
            icon: Target,
          },
          {
            title: "Analytics",
            url: "/admin/analytics",
            icon: BarChart3,
          },
        ]
      : [
          {
            title: "My Tasks",
            url: "/dashboard/tasks",
            icon: Target,
          },
          {
            title: "Training",
            url: "/dashboard/training",
            icon: FileText,
          },
          {
            title: "Attendance",
            url: "/dashboard/attendance",
            icon: Calendar,
          },
        ]),
    {
      title: "Progress Feed",
      url: "/feed",
      icon: Globe,
    },
  ]

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="px-4 py-2">
            <h2 className="text-lg font-semibold">PPF Volunteer Platform</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="px-4 py-2 border-t">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{isAdmin ? "Admin Dashboard" : "Volunteer Dashboard"}</h1>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
