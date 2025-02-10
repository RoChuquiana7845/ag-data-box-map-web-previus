"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableLayout } from "@/components/dashboard/resizable-layout"
import { CompactSidebar } from "@/components/dashboard/compact-sidebar"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { fadeIn } from "@/lib/config/animations"
import { Suspense } from "react"

function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <RadioGroup defaultValue={theme} onValueChange={(value) => setTheme(value)} className="grid grid-cols-3 gap-4">
      <Label
        htmlFor="light"
        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
      >
        <RadioGroupItem value="light" id="light" className="sr-only" />
        <Sun className="mb-3 h-6 w-6" />
        <p className="text-sm font-medium">Claro</p>
      </Label>
      <Label
        htmlFor="dark"
        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
      >
        <RadioGroupItem value="dark" id="dark" className="sr-only" />
        <Moon className="mb-3 h-6 w-6" />
        <p className="text-sm font-medium">Oscuro</p>
      </Label>
      <Label
        htmlFor="system"
        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
      >
        <RadioGroupItem value="system" id="system" className="sr-only" />
        <Monitor className="mb-3 h-6 w-6" />
        <p className="text-sm font-medium">Sistema</p>
      </Label>
    </RadioGroup>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-[200px]" />
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-[100px] mb-2" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsContent() {
  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">
          Administre la configuración de su cuenta y las preferencias del sistema.
        </p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="notifications" disabled>
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="display" disabled>
            Pantalla
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="backdrop-blur-sm bg-background/95 border-background/20">
            <CardHeader>
              <CardTitle>Tema</CardTitle>
              <CardDescription>Seleccione el tema que desea utilizar en la aplicación.</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSelector />
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/95 border-background/20">
            <CardHeader>
              <CardTitle>Personalización</CardTitle>
              <CardDescription>Otras opciones de personalización estarán disponibles próximamente.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[200px] items-center justify-center rounded-md border-2 border-dashed">
                <p className="text-sm text-muted-foreground">Próximamente más opciones de personalización</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

export default function SettingsPage() {
  const content = (
    <div className="p-6">
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  )

  return <ResizableLayout sidebar={<CompactSidebar />} content={content} />
}

