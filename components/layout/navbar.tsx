"use client"

import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { MapIcon, Search } from "lucide-react"
import { TypewriterEffect } from "@/components/ui/typewriter-effect"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { AvatarButton } from "@/components/ui/avatar-button"
import { cn } from "@/lib/utils"

const navVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.2,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
}

export function Navbar() {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center space-x-2 transition-colors hover:text-primary">
          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
            <MapIcon className="h-6 w-6 text-primary" />
          </motion.div>
          <TypewriterEffect text="AgroData Mapper" className="hidden sm:inline-block font-bold" speed={0.08} />
        </Link>

        {isAuthenticated && (
          <div className="flex-1 max-w-xl ml-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar proyectos..." className="pl-8 bg-background/50" />
            </div>
          </div>
        )}

        <motion.div className="flex flex-1 items-center justify-end space-x-4" variants={navVariants}>
          {isAuthenticated ? (
            <>
              <motion.div variants={itemVariants}>
                <ThemeToggle />
              </motion.div>
              <motion.div variants={itemVariants}>
                <AvatarButton />
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <Link href="/auth/login">
                  <Button
                    variant={pathname === "/auth/login" ? "secondary" : "ghost"}
                    className={cn(
                      "space-x-2",
                      pathname === "/auth/login" && "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link href="/auth/register">
                  <Button
                    variant={pathname === "/auth/register" ? "secondary" : "secondary"}
                    className={cn(
                      "space-x-2",
                      pathname === "/auth/register" && "bg-primary text-primary-foreground hover:bg-primary/90",
                      pathname !== "/auth/register" && "hover:bg-secondary/80",
                    )}
                  >
                    Registrarse
                  </Button>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <ThemeToggle />
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </motion.nav>
  )
}

