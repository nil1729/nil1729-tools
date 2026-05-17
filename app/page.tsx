import { FileJson, Binary, Link2, KeyRound, GitCompare, FileText, Workflow, Regex, ArrowRightLeft, Clock, Hash, Palette, Timer } from "lucide-react"
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
            href="/regex-tester"
            icon={Regex}
            name="Regex Tester"
            description="Test regular expressions with live matching, capture groups, and flag toggles."
          />
          <ToolCard
            href="/yaml-json"
            icon={ArrowRightLeft}
            name="YAML ↔ JSON Converter"
            description="Convert between YAML and JSON formats instantly. Bidirectional with swap."
          />
          <ToolCard
            href="/timestamp"
            icon={Clock}
            name="Unix Timestamp Converter"
            description="Convert between Unix timestamps and human-readable dates with live clock."
          />
          <ToolCard
            href="/hash-generator"
            icon={Hash}
            name="Hash Generator"
            description="Generate MD5, SHA-1, SHA-256, SHA-512 hashes using Web Crypto API."
          />
          <ToolCard
            href="/color-converter"
            icon={Palette}
            name="Color Converter"
            description="Convert between HEX, RGB, and HSL with live preview and WCAG contrast check."
          />
          <ToolCard
            href="/cron-parser"
            icon={Timer}
            name="Cron Expression Parser"
            description="Parse cron expressions into plain English with next scheduled run times."
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
            description="Write Mermaid diagram syntax and see it rendered live. Export as SVG or PNG."
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
