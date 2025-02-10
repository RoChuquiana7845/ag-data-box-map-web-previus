import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login - AG-DATA-BOX-MAP",
  description: "Login to your account",
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md mx-auto">
      <LoginForm />
    </div>
  )
}

