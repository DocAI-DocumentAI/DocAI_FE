import type React from "react"
import { Logo } from "./logo"

interface AuthContainerProps {
  children: React.ReactNode
}

export function AuthContainer({ children }: AuthContainerProps) {
  return (
    <div className="w-full max-w-md">
      <Logo />
      {children}
    </div>
  )
}
