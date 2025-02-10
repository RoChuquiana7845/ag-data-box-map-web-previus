"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/hooks/use-auth"
import { getProfile } from "@/lib/services/auth"
import { fadeIn } from "@/lib/config/animations"
import { ResizableLayout } from "@/components/dashboard/resizable-layout"
import { CompactSidebar } from "@/components/dashboard/compact-sidebar"
import { Mail, Calendar, Shield } from "lucide-react"
import type { User } from "@/lib/types/auth"

function ProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-8 w-[150px]" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileContent({ user }: { user: User | null }) {
  if (!user) return <ProfileSkeleton />

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-500"
      case "Analyst":
        return "bg-blue-500"
      default:
        return "bg-green-500"
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <Card className="backdrop-blur-sm bg-background/95 border-background/20">
        <CardHeader>
          <CardTitle className="text-2xl">Perfil de Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <Badge variant="secondary" className={`${getRoleColor(user.role)} text-white mt-2`}>
                {user.role}
              </Badge>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid gap-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Correo Electrónico</p>
                <p className="text-lg">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nivel de Acceso</p>
                <p className="text-lg capitalize">{user.role}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Miembro desde</p>
                <p className="text-lg">
                  {new Date().toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function ProfilePage() {
  const { user: initialUser, token } = useAuth()
  const [user, setUser] = useState<User | null>(initialUser)

  useEffect(() => {
    async function fetchProfile() {
      try {
        if (token) {
          const profile = await getProfile(token)
          setUser(profile)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }

    fetchProfile()
  }, [token])

  const content = (
    <div className="p-6">
      <ProfileContent user={user} />
    </div>
  )

  return <ResizableLayout sidebar={<CompactSidebar />} content={content} />
}

