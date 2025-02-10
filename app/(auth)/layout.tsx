import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 relative min-h-[calc(100vh-4rem)]">
      {/* Background container */}
      <div
        className="absolute inset-0 w-full"
        style={{
          backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download-8QLKERaqQYa5ZgAfzGZHbDb5MMWlKQ.gif')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Content container with backdrop blur */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4">{children}</div>
    </div>
  )
}

