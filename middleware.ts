import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { UserRole } from "@/lib/types/auth"

// Helper function to verify debug mode
function isDebugMode(request: NextRequest): boolean {
  return request.cookies.get("debug_mode")?.value === "true"
}

// Helper function to verify role access
function canAccessRole(userRole: UserRole, targetRole: string): boolean {
  const roleHierarchy: Record<UserRole, string[]> = {
    Admin: ["admin", "analyst", "user"],
    Analyst: ["analyst", "user"],
    User: ["user"],
  }

  return roleHierarchy[userRole]?.includes(targetRole.toLowerCase()) ?? false
}

// Helper function to check if path requires analyst role
function requiresAnalystRole(pathname: string): boolean {
  return [
    "/dashboard/analytics",
    "/dashboard/reports",
    "/api/analytics",
    "/api/reports",
    "/api/satellite",
    "/api/geo-statistics",
  ].some((path) => pathname.startsWith(path))
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const userRole = request.cookies.get("user-role")?.value as UserRole
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  const isApiRoute = request.nextUrl.pathname.startsWith("/api")
  const isPublicRoute = request.nextUrl.pathname === "/"
  const isDebugPage = request.nextUrl.pathname.startsWith("/debug")
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard")

  // Allow debug page in development
  if (isDebugPage && process.env.NODE_ENV === "development") {
    return NextResponse.next()
  }

  // Block debug page in production
  if (isDebugPage && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check analyst role requirements for both API and dashboard routes
  if (requiresAnalystRole(request.nextUrl.pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    if (!userRole || !["Admin", "Analyst"].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Handle remaining API routes
  if (isApiRoute) {
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Redirect to login if no token (except for auth pages)
  if (!token && !isAuthPage) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("from", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing auth pages with token
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Handle dashboard routes
  if (isDashboardRoute) {
    // In debug mode, allow access
    if (isDebugMode(request)) {
      return NextResponse.next()
    }

    try {
      // Here you would normally decode and verify the JWT token
      if (!token) {
        throw new Error("Invalid token")
      }

      // For role-specific routes, check permissions
      const matches = request.nextUrl.pathname.match(/^\/dashboard\/([^/]+)/)
      if (matches) {
        const targetRole = matches[1].toLowerCase()

        if (!canAccessRole(userRole, targetRole)) {
          // Redirect to base dashboard if user doesn't have access
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      }

      return NextResponse.next()
    } catch (error) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

