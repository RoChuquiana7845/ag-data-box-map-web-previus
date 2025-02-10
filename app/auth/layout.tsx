import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 relative">
      {/* Background container with lower z-index */}
      <div
        className="fixed inset-0 w-full z-0"
        style={{
          backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download-8QLKERaqQYa5ZgAfzGZHbDb5MMWlKQ.gif')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Overlay with medium z-index */}
      <div className="fixed inset-0 bg-background/30 backdrop-blur-sm z-10" />

      {/* Content container with highest z-index */}
      <div className="relative z-20 w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  )
}

