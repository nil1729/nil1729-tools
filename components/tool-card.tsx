import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface ToolCardProps {
  href: string
  icon: LucideIcon
  name: string
  description: string
}

export default function ToolCard({ href, icon: Icon, name, description }: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 p-6 border rounded-lg bg-card hover:border-foreground/30 transition-all duration-200 hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-muted group-hover:bg-muted/70 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-semibold text-lg">{name}</h2>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </Link>
  )
}
