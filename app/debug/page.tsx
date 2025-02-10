"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { fadeIn } from "@/lib/config/animations"
import { useAuth } from "@/lib/hooks/use-auth"
import type { AuthResponse, UserRole } from "@/lib/types/auth"

// Simulated JWT tokens for debug purposes
const generateDebugToken = (role: UserRole) => {
  return `debug-${role.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

const DEBUG_USERS: Record<UserRole, AuthResponse> = {
  User: {
    access_token: generateDebugToken("User"),
    user: {
      id: "1",
      email: "user@debug.com",
      name: "Debug User",
      role: "User",
    },
  },
  Analyst: {
    access_token: generateDebugToken("Analyst"),
    user: {
      id: "2",
      email: "analyst@debug.com",
      name: "Debug Analyst",
      role: "Analyst",
    },
  },
  Admin: {
    access_token: generateDebugToken("Admin"),
    user: {
      id: "3",
      email: "admin@debug.com",
      name: "Debug Admin",
      role: "Admin",
    },
  },
}

export default function DebugPage() {
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = (role: UserRole) => {
    const debugResponse = DEBUG_USERS[role]
    // Set debug flag in localStorage to identify debug sessions
    localStorage.setItem("debug_mode", "true")
    login(debugResponse)
    // Update the path to use /dashboard/[role]
    router.push(`/dashboard/${role.toLowerCase()}`)
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen flex items-center justify-center p-4 bg-black/50"
    >
      <Card className="w-full max-w-md backdrop-blur-xl bg-background/95 border-background/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Debug Mode</CardTitle>
          <CardDescription className="text-center">
            Development Testing Environment
            <br />
            <span className="text-xs text-yellow-500">⚠️ This mode is for development purposes only</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => handleLogin("User")} className="w-full bg-blue-500/80 hover:bg-blue-600/80" size="lg">
            Debug as User
          </Button>
          <Button
            onClick={() => handleLogin("Analyst")}
            className="w-full bg-green-500/80 hover:bg-green-600/80"
            size="lg"
          >
            Debug as Analyst
          </Button>
          <Button
            onClick={() => handleLogin("Admin")}
            className="w-full bg-purple-500/80 hover:bg-purple-600/80"
            size="lg"
          >
            Debug as Admin
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

