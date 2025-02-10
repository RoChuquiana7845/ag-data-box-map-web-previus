import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { fadeIn } from "@/lib/config/animations"
import { TypewriterEffect } from "@/components/ui/typewriter-effect"

export default function HomePage() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download-8QLKERaqQYa5ZgAfzGZHbDb5MMWlKQ.gif')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />
      <motion.div className="relative z-10 text-center space-y-6" initial="hidden" animate="visible" variants={fadeIn}>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          <TypewriterEffect text="AgroData Mapper" className="inline-block" speed={0.1} />
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          Advanced agricultural data management and mapping system for precision farming
        </p>
        <div className="space-x-4">
          <Link href="/auth/login">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" size="lg">
              Sign Up
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

