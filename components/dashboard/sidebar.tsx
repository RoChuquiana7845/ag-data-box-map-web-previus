"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"
import { BarChart3, FileText, Home, Layers, Map, Settings, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type React from "react" // Added import for React

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const isAdmin = user?.role === "Admin"
  const isAnalyst = user?.role === "Analyst"

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">General</h2>
          <div className="space-y-1">
            <Button
              asChild
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname === "/dashboard/map" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/map">
                <Map className="mr-2 h-4 w-4" />
                Mapa
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname === "/dashboard/areas" ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href="/dashboard/areas">
                <Layers className="mr-2 h-4 w-4" />
                Áreas
              </Link>
            </Button>
          </div>
        </div>
        {(isAdmin || isAnalyst) && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Análisis</h2>
            <div className="space-y-1">
              <Button
                asChild
                variant={pathname === "/dashboard/reports" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Link href="/dashboard/reports">
                  <FileText className="mr-2 h-4 w-4" />
                  Reportes
                </Link>
              </Button>
              <Button
                asChild
                variant={pathname === "/dashboard/analytics" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Link href="/dashboard/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Análisis
                </Link>
              </Button>
            </div>
          </div>
        )}
        {isAdmin && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Usuarios del Sistema</h2>
            <div className="space-y-1">
              <Button
                asChild
                variant={pathname === "/dashboard/users" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Link href="/dashboard/users">
                  <Users className="mr-2 h-4 w-4" />
                  Usuarios
                </Link>
              </Button>
              <Button
                asChild
                variant={pathname === "/dashboard/settings" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

