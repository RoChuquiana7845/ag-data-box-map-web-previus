"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DataVisualizationProps {
  ndviData?: Array<{
    date: string
    ndvi: number
    cloudCoverage: number
  }>
  terrainData?: {
    elevation: number
    slope: number
    aspect: number
  }
}

export default function DataVisualization({
  ndviData = [],
  terrainData = {
    elevation: 0,
    slope: 0,
    aspect: 0,
  },
}: DataVisualizationProps) {
  const [activeTab, setActiveTab] = useState("temporal")

  // Procesar datos para el gráfico temporal
  const temporalData = ndviData.map((item) => ({
    date: new Date(item.date).toLocaleDateString(),
    ndvi: item.ndvi,
    cloudCoverage: item.cloudCoverage,
  }))

  // Procesar datos para el gráfico de distribución
  const distributionData = [
    {
      label: "NDVI < 0.2",
      value: ndviData.filter((item) => item.ndvi < 0.2).length,
      color: "hsl(var(--destructive))",
    },
    {
      label: "0.2 ≤ NDVI < 0.4",
      value: ndviData.filter((item) => item.ndvi >= 0.2 && item.ndvi < 0.4).length,
      color: "hsl(var(--warning))",
    },
    {
      label: "0.4 ≤ NDVI < 0.6",
      value: ndviData.filter((item) => item.ndvi >= 0.4 && item.ndvi < 0.6).length,
      color: "hsl(var(--primary))",
    },
    {
      label: "NDVI ≥ 0.6",
      value: ndviData.filter((item) => item.ndvi >= 0.6).length,
      color: "hsl(var(--success))",
    },
  ]

  // Mover el cálculo de correlationData dentro del renderizado condicional
  const correlationData =
    ndviData?.length > 0
      ? ndviData.map((item) => ({
          ndvi: item.ndvi,
          cloudCoverage: item.cloudCoverage,
        }))
      : []

  // Si no hay datos, mostrar mensaje
  if (ndviData.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Análisis de Datos</h3>
        <p className="text-center text-gray-500 py-8">
          No hay datos disponibles para visualizar. Seleccione una imagen para ver los análisis.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Análisis de Datos</h3>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="temporal">Evolución Temporal</TabsTrigger>
          <TabsTrigger value="distribution">Distribución NDVI</TabsTrigger>
          <TabsTrigger value="correlation">Correlaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="temporal">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Evolución temporal de NDVI y Cobertura de Nubes</h4>
            <ChartContainer
              config={{
                ndvi: {
                  label: "NDVI",
                  color: "hsl(var(--success))",
                },
                cloudCoverage: {
                  label: "Cobertura de Nubes (%)",
                  color: "hsl(var(--muted-foreground))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temporalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" domain={[0, 1]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="ndvi" stroke="var(--color-ndvi)" yAxisId="left" strokeWidth={2} />
                  <Line
                    type="monotone"
                    dataKey="cloudCoverage"
                    stroke="var(--color-cloudCoverage)"
                    yAxisId="right"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>

        <TabsContent value="distribution">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Distribución de valores NDVI</h4>
            <ChartContainer className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-primary)">
                    {distributionData.map((entry, index) => (
                      <Bar key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>

        <TabsContent value="correlation">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Correlación NDVI vs. Cobertura de Nubes</h4>
            {ndviData.length > 0 ? (
              <ChartContainer
                config={{
                  area: {
                    label: "Correlación",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ndvi" domain={[0, 1]} label={{ value: "NDVI", position: "bottom" }} />
                    <YAxis
                      dataKey="cloudCoverage"
                      domain={[0, 100]}
                      label={{ value: "Cobertura de Nubes (%)", angle: -90, position: "insideLeft" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="cloudCoverage"
                      stroke="var(--color-area)"
                      fill="var(--color-area)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] bg-muted/10 rounded-lg">
                <p className="text-sm text-muted-foreground">No hay datos suficientes para mostrar la correlación</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

