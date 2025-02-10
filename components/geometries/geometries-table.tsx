"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Map,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { GeometryPreview } from "./geometry-preview"
import { updateGeometry } from "@/lib/services/geometries"
import type { AreaGeometry } from "@/lib/types/geometry"

interface GeometriesTableProps {
  geometries: AreaGeometry[]
  pagination?: {
    total: number
    page: number
    limit: number
  }
  onDelete?: (id: string) => void
}

export function GeometriesTable({ geometries, pagination, onDelete }: GeometriesTableProps) {
  const [currentPage, setCurrentPage] = useState(pagination?.page || 1)
  const [pageSize, setPageSize] = useState(pagination?.limit || 10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [geometryToDelete, setGeometryToDelete] = useState<AreaGeometry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const totalPages = Math.ceil((pagination?.total || geometries.length) / pageSize)

  // Pagination controls
  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const previousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const firstPage = () => {
    setCurrentPage(1)
  }

  const lastPage = () => {
    setCurrentPage(totalPages)
  }

  const handleDeleteClick = (geometry: AreaGeometry) => {
    setGeometryToDelete(geometry)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!geometryToDelete) return

    try {
      setIsDeleting(true)
      await updateGeometry(geometryToDelete.areaId, null)
      onDelete?.(geometryToDelete.id)

      toast({
        title: "Geometría eliminada",
        description: "La geometría ha sido eliminada correctamente.",
      })

      // Adjust current page if necessary
      if (geometries.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la geometría",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setGeometryToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vista previa</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Estilo</TableHead>
              <TableHead>Última modificación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {geometries.map((geometry) => (
              <TableRow key={geometry.id}>
                <TableCell className="w-[200px]">
                  <GeometryPreview geometry={geometry} height={120} />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{geometry.areaId}</div>
                  <div className="text-sm text-muted-foreground">
                    {geometry.simplified ? "Versión simplificada" : "Versión completa"}
                  </div>
                </TableCell>
                <TableCell>{geometry.area?.project?.name || "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: geometry.style.fillColor }}
                    />
                    <Badge variant="outline">{Math.round(geometry.style.fillOpacity * 100)}% opacidad</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(geometry.lastModified).toLocaleDateString()}
                  <div className="text-sm text-muted-foreground">por {geometry.modifiedBy}</div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/map?areaId=${geometry.areaId}`)}>
                        <Map className="mr-2 h-4 w-4" />
                        Ver en mapa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/map?edit=${geometry.areaId}`)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(geometry)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Filas por página</p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={firstPage}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Ir a la primera página</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-8 w-8 p-0" onClick={previousPage} disabled={currentPage === 1}>
              <span className="sr-only">Ir a la página anterior</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-8 w-8 p-0" onClick={nextPage} disabled={currentPage === totalPages}>
              <span className="sr-only">Ir a la página siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={lastPage}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Ir a la última página</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la geometría del área.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

