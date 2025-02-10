"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { DraggableCard } from "@/components/ui/draggable-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface VegetationData {
  date: string
  ndvi: number
  evi: number
}

interface SensorDistribution {
  type: string
  count: number
}

interface MapChartsProps {
  vegetationData: VegetationData[]
  sensorDistribution: SensorDistribution[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function MapCharts({ vegetationData, sensorDistribution }: MapChartsProps) {
  return (
    <DraggableCard
      id="analysis-charts"
      title="Análisis"
      defaultPosition={{ x: window.innerWidth - 730, y: window.innerHeight - 461 }}
      className="w-[630px]"
    >
      <div className="p-4">
        <Tabs defaultValue="vegetation" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="vegetation" className="flex-1">
              Índices de Vegetación
            </TabsTrigger>
            <TabsTrigger value="sensors" className="flex-1">
              Distribución de Sensores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vegetation" className="mt-4">
            <div className="h-[285px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vegetationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line type="monotone" dataKey="ndvi" stroke="hsl(var(--primary))" name="NDVI" strokeWidth={2} />
                  <Line type="monotone" dataKey="evi" stroke="hsl(var(--secondary))" name="EVI" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="sensors" className="mt-4">
            <div className="h-[285px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sensorDistribution}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sensorDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DraggableCard>
  )
}

