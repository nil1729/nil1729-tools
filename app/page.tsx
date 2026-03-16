import { FileJson } from "lucide-react"
import ToolCard from "@/components/tool-card"

export default function HomePage() {
  return (
    <div className="container px-4 md:px-6 mx-auto py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Developer Tools</h1>
          <p className="text-lg text-muted-foreground">
            Clean, ad-free tools built for developers.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ToolCard
            href="/json-linter"
            icon={FileJson}
            name="JSON Linter & Formatter"
            description="Validate and format JSON instantly in your browser. Clean output, readable errors."
          />
        </div>
      </div>
    </div>
  )
}
