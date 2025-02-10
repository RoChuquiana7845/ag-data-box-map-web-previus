"use client"

import { useState, useEffect } from "react"
import { ReportEditor } from "./report-editor"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Download, Plus } from "lucide-react"
import { exportToPdf } from "@/lib/utils/pdf"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const STORAGE_KEY = "report-content"
const DEFAULT_CONTENT = "<p>Comience a escribir su reporte aquí...</p>"

export function ReportsContent() {
  const [content, setContent] = useState(() => {
    // Initialize from localStorage if available, otherwise use default
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_CONTENT
    }
    return DEFAULT_CONTENT
  })

  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [showNewReportDialog, setShowNewReportDialog] = useState(false)

  // Save content whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && content !== null) {
      localStorage.setItem(STORAGE_KEY, content)
    }
  }, [content])

  // Sync content across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setContent(e.newValue)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await exportToPdf(content)
      toast({
        title: "Reporte exportado",
        description: "El reporte se ha exportado correctamente en formato PDF.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo exportar el reporte. Por favor, intente nuevamente.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleNewReport = () => {
    setShowNewReportDialog(true)
  }

  const confirmNewReport = () => {
    setContent(DEFAULT_CONTENT)
    localStorage.setItem(STORAGE_KEY, DEFAULT_CONTENT)
    setShowNewReportDialog(false)
    toast({
      title: "Nuevo reporte",
      description: "Se ha creado un nuevo reporte.",
    })
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    localStorage.setItem(STORAGE_KEY, newContent)
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
            <p className="text-muted-foreground">Cree y gestione reportes detallados</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exportando..." : "Exportar PDF"}
            </Button>
            <Button onClick={handleNewReport}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Reporte
            </Button>
          </div>
        </div>

        <Card className="min-h-[calc(100vh-12rem)] flex flex-col">
          <ReportEditor content={content} onChange={handleContentChange} />
        </Card>
      </div>

      <AlertDialog open={showNewReportDialog} onOpenChange={setShowNewReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Crear nuevo reporte?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará todo el contenido actual. Asegúrese de exportar su reporte actual antes de
              continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNewReport}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

