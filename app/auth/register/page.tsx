import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Register - AG-DATA-BOX-MAP",
  description: "Create a new account",
}

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md mx-auto">
      <RegisterForm />
    </div>
  )
}

