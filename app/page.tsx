import { FileJson, Binary, Link2, KeyRound, GitCompare, FileText, Workflow } from "lucide-react"
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
          <ToolCard
            href="/diff-checker"
            icon={GitCompare}
            name="Diff Checker"
            description="Compare two texts side-by-side with highlighted additions and deletions."
          />
          <ToolCard
            href="/markdown-viewer"
            icon={FileText}
            name="Markdown Viewer"
            description="Paste Markdown and see it rendered in real-time. Supports GFM tables, code blocks, and task lists."
          />
          <ToolCard
            href="/mermaid-viewer"
            icon={Workflow}
            name="Mermaid Viewer"
            description="Write Mermaid diagram syntax and see it rendered live. Export as SVG."
          />
          <ToolCard
            href="/base64"
            icon={Binary}
            name="Base64 Encoder & Decoder"
            description="Encode and decode Base64 strings instantly. Handles UTF-8 text."
          />
          <ToolCard
            href="/url-encoder"
            icon={Link2}
            name="URL Encoder & Decoder"
            description="Encode special characters for URLs or decode percent-encoded strings."
          />
          <ToolCard
            href="/jwt-decoder"
            icon={KeyRound}
            name="JWT Decoder"
            description="Decode JSON Web Tokens. View header, payload, and check expiration."
          />
        </div>
      </div>
    </div>
  )
}
