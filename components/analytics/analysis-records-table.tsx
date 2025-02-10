"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Edit2, Play, Trash2 } from "lucide-react"
import { AnalysisVisualization } from "./analysis-visualization"

interface AnalysisRecord {
  id: string
  name: string
  description?: string
  createdAt: string
  type: "hillshade" | "slope" | "ndvi"
  parameters: Record<string, any>
}

interface AnalysisRecordsTableProps {
  records: AnalysisRecord[]
  onDelete: (id: string) => Promise<void>
  onUpdate: (id: string, data: { name: string; description?: string }) => Promise<void>
  onExecute: (id: string) => Promise<void>
}

export function AnalysisRecordsTable({ records, onDelete, onUpdate, onExecute }: AnalysisRecordsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [visualizationDialogOpen, setVisualizationDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  })
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!selectedRecord) return

    try {
      setIsLoading(true)
      await onDelete(selectedRecord.id)
      toast({
        title: "Análisis eliminado",
        description: "El análisis se ha eliminado correctamente.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el análisis.",
      })
    } finally {
      setIsLoading(false)
      setDeleteDialogOpen(false)
      setSelectedRecord(null)
    }
  }

  const handleUpdate = async () => {
    if (!selectedRecord) return

    try {
      setIsLoading(true)
      await onUpdate(selectedRecord.id, editForm)
      toast({
        title: "Análisis actualizado",
        description: "El análisis se ha actualizado correctamente.",
      })
      setEditDialogOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el análisis.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecute = async (record: AnalysisRecord) => {
    try {
      setIsLoading(true)
      await onExecute(record.id)
      setSelectedRecord(record)
      setVisualizationDialogOpen(true)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo ejecutar el análisis.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Fecha de Creación</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.name}</TableCell>
              <TableCell>{record.description || "Sin descripción"}</TableCell>
              <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRecord(record)
                      setEditForm({
                        name: record.name,
                        description: record.description || "",
                      })
                      setEditDialogOpen(true)
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRecord(record)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExecute(record)}>
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el análisis y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Análisis</DialogTitle>
            <DialogDescription>Modifique el nombre y la descripción del análisis.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedRecord && (
        <AnalysisVisualization
          open={visualizationDialogOpen}
          onOpenChange={setVisualizationDialogOpen}
          analysisId={selectedRecord.id}
          analysisType={selectedRecord.type}
          parameters={selectedRecord.parameters}
        />
      )}
    </>
  )
}

