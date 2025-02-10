"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"
import { BarChart3, BrushIcon as Draw, FileText, Home, Layers, Map, Settings, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type React from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CompactSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const isAdmin = user?.role === "Admin"
  const isAnalyst = user?.role === "Analyst"

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("pb-12 w-[60px]", className)} style={{ width: "60px" }}>
        <div className="space-y-4 py-4">
          <div className="px-2 py-2">
            <div className="space-y-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                      className="w-full h-10 p-0"
                    >
                      <Link href="/dashboard">
                        <Home className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Dashboard</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant={pathname === "/dashboard/map" ? "secondary" : "ghost"}
                      className="w-full h-10 p-0"
                    >
                      <Link href="/dashboard/map">
                        <Map className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Mapa</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant={pathname === "/dashboard/areas" ? "secondary" : "ghost"}
                      className="w-full h-10 p-0"
                    >
                      <Link href="/dashboard/areas">
                        <Layers className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Áreas</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant={pathname === "/dashboard/geometries" ? "secondary" : "ghost"}
                      className="w-full h-10 p-0"
                    >
                      <Link href="/dashboard/geometries">
                        <Draw className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Geometrías</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {(isAdmin || isAnalyst) && (
            <div className="px-2 py-2">
              <div className="space-y-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant={pathname === "/dashboard/reports" ? "secondary" : "ghost"}
                        className="w-full h-10 p-0"
                      >
                        <Link href="/dashboard/reports">
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Reportes</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant={pathname === "/dashboard/analytics" ? "secondary" : "ghost"}
                        className="w-full h-10 p-0"
                      >
                        <Link href="/dashboard/analytics">
                          <BarChart3 className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Análisis</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="px-2 py-2">
              <div className="space-y-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant={pathname === "/dashboard/users" ? "secondary" : "ghost"}
                        className="w-full h-10 p-0"
                      >
                        <Link href="/dashboard/users">
                          <Users className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Usuarios</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant={pathname === "/dashboard/settings" ? "secondary" : "ghost"}
                        className="w-full h-10 p-0"
                      >
                        <Link href="/settings">
                          <Settings className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Configuración</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

