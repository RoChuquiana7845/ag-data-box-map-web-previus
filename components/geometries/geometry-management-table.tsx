"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Map } from "lucide-react"
import type { GeometryManagement } from "@/lib/types/geometry-management"

interface GeometryManagementTableProps {
  geometries: GeometryManagement[]
  pagination?: {
    total: number
    page: number
    limit: number
  }
}

export function GeometryManagementTable({ geometries, pagination }: GeometryManagementTableProps) {
  const [currentPage, setCurrentPage] = useState(pagination?.page || 1)
  const [pageSize, setPageSize] = useState(pagination?.limit || 10)
  const router = useRouter()

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

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Área</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Última modificación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {geometries.map((item) => (
              <TableRow key={item.area.id}>
                <TableCell className="font-medium">
                  {item.area.code}
                  <br />
                  <span className="text-sm text-muted-foreground">{item.area.description}</span>
                </TableCell>
                <TableCell>{item.area.project.name}</TableCell>
                <TableCell>
                  <Badge variant={item.geometry ? "default" : "secondary"}>
                    {item.geometry ? "Con geometría" : "Sin geometría"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(item.lastModified).toLocaleDateString()}
                  <br />
                  <span className="text-sm text-muted-foreground">por {item.modifiedBy}</span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/map?areaId=${item.area.id}`)}
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Ver en mapa
                  </Button>
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
    </div>
  )
}

