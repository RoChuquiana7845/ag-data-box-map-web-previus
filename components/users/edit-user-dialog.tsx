"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff } from "lucide-react"
import type { UserRole } from "@/lib/types/auth"
import type { User } from "@/lib/types/user"
import { updateUser } from "@/lib/services/users"

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireNumbers: true,
  requireUppercase: true,
  requireLowercase: true,
  requireSpecialChars: true,
}

const editUserSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre debe tener menos de 50 caracteres")
    .regex(/^[a-zA-Z\s]*$/, "El nombre solo puede contener letras y espacios"),
  email: z.string().email("Correo electrónico inválido").max(100, "El correo debe tener menos de 100 caracteres"),
  password: z
    .string()
    .min(
      PASSWORD_REQUIREMENTS.minLength,
      `La contraseña debe tener al menos ${PASSWORD_REQUIREMENTS.minLength} caracteres`,
    )
    .regex(/[0-9]/, "La contraseña debe contener al menos un número")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
    .regex(/[^A-Za-z0-9]/, "La contraseña debe contener al menos un carácter especial")
    .optional()
    .or(z.literal("")),
  role: z.enum(["User", "Analyst", "Admin"] as const),
})

type EditUserData = z.infer<typeof editUserSchema>

const ROLES: { value: UserRole; label: string }[] = [
  { value: "User", label: "Usuario" },
  { value: "Analyst", label: "Analista" },
  { value: "Admin", label: "Administrador" },
]

interface EditUserDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()

  const form = useForm<EditUserData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    },
  })

  async function onSubmit(data: EditUserData) {
    try {
      // Only send non-empty values
      const updateData = {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.password && { password: data.password }),
        ...(data.role && { role: data.role }),
      }

      await updateUser(user.id, updateData)
      toast({
        title: "Usuario actualizado",
        description: "El usuario se ha actualizado correctamente.",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el usuario",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modificar Usuario</DialogTitle>
          <DialogDescription>
            Modifique los datos del usuario. Deje la contraseña en blanco para mantener la actual.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormDescription>Nombre completo del usuario</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="juan@ejemplo.com" {...field} />
                  </FormControl>
                  <FormDescription>Correo electrónico corporativo</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Dejar en blanco para mantener la actual"
                        {...field}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>Si se establece, la nueva contraseña debe contener:</FormDescription>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1">
                    <li>Al menos {PASSWORD_REQUIREMENTS.minLength} caracteres</li>
                    <li>Una letra mayúscula</li>
                    <li>Una letra minúscula</li>
                    <li>Un número</li>
                    <li>Un carácter especial</li>
                  </ul>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Nivel de acceso del usuario</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Actualizar Usuario
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

