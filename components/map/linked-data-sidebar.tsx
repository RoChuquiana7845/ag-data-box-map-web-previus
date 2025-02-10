"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronRight, Map, MapPin } from "lucide-react"
import { getLinkedData } from "@/lib/services/linked-data"
import type { LinkedData } from "@/lib/types/linked-data"

interface LinkedDataSidebarProps {
  projectId: string
  onAreaSelect?: (areaId: string) => void
  selectedAreaId?: string | null
}

export function LinkedDataSidebar({ projectId, onAreaSelect, selectedAreaId }: LinkedDataSidebarProps) {
  const [data, setData] = useState<LinkedData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)
        const result = await getLinkedData(projectId)

        if (result.isBackendError) {
          setError("No se pudo cargar la información del proyecto")
          return
        }

        setData(result.data)
      } catch (err) {
        setError("Error al cargar los datos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-4 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>{error || "No se encontraron datos"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{data.project.name}</h2>
        <p className="text-sm text-muted-foreground">{data.project.description}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Áreas</h3>
            <Badge variant="secondary">
              {data.areas.length} {data.areas.length === 1 ? "área" : "áreas"}
            </Badge>
          </div>

          <div className="space-y-3">
            {data.areas.map((area) => (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    selectedAreaId === area.id ? "border-primary" : ""
                  }`}
                  onClick={() => onAreaSelect?.(area.id)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center justify-between">
                      {area.code}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground mb-2">{area.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Map className="h-4 w-4 text-muted-foreground" />
                        <span>{area.size} ha</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={area.geometry ? "default" : "secondary"} className="text-xs">
                          {area.geometry ? "Con geometría" : "Sin geometría"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button variant="outline" className="w-full" asChild>
          <a href={`/dashboard/areas?projectId=${projectId}`}>Ver todas las áreas</a>
        </Button>
      </div>
    </div>
  )
}

