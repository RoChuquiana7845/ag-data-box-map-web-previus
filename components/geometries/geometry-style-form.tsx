"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { GeometryStyle } from "@/lib/types/geometry"

interface GeometryStyleFormProps {
  value: GeometryStyle
  onChange: (style: GeometryStyle) => void
}

export function GeometryStyleForm({ value, onChange }: GeometryStyleFormProps) {
  const [style, setStyle] = useState<GeometryStyle>(value)

  const handleChange = (updates: Partial<GeometryStyle>) => {
    const newStyle = { ...style, ...updates }
    setStyle(newStyle)
    onChange(newStyle)
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Color de relleno</Label>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <div className="w-10 h-10 rounded border cursor-pointer" style={{ backgroundColor: style.fillColor }} />
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="grid gap-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={style.fillColor}
                  onChange={(e) => handleChange({ fillColor: e.target.value })}
                />
              </div>
            </PopoverContent>
          </Popover>
          <div className="grid gap-2 flex-1">
            <Label>Opacidad</Label>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={[style.fillOpacity]}
              onValueChange={([value]) => handleChange({ fillOpacity: value })}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Color del borde</Label>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <div className="w-10 h-10 rounded border cursor-pointer" style={{ backgroundColor: style.strokeColor }} />
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="grid gap-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={style.strokeColor}
                  onChange={(e) => handleChange({ strokeColor: e.target.value })}
                />
              </div>
            </PopoverContent>
          </Popover>
          <div className="grid gap-2 flex-1">
            <Label>Grosor</Label>
            <Slider
              min={1}
              max={5}
              step={0.5}
              value={[style.strokeWidth]}
              onValueChange={([value]) => handleChange({ strokeWidth: value })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

