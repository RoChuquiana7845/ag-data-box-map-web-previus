import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"
import { Navbar } from "@/components/layout/navbar"
import "@/styles/globals.css"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AgroData Mapper",
  description: "Advanced Agricultural Data Management and Mapping System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            {children}
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  )
}



import './globals.css'