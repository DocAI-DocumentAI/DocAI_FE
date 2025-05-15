 
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  href: string
}

export function FeatureCard({ icon, title, description, href }: FeatureCardProps) {
  return (
    <Link to={href} className="block rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  )
}
