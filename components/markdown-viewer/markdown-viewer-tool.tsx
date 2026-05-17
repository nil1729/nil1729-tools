"use client"

import { useState } from "react"
import { Panel, Group, Separator } from "react-resizable-panels"
import { Button } from "@/components/ui/button"
import { Copy, Trash2 } from "lucide-react"
import { toast } from "sonner"
import MarkdownRenderer from "./markdown-renderer"

const TICK = "`"
const FENCE = TICK.repeat(3)

const SAMPLE_MD = [
  "# Hello World",
  "",
  "This is a **Markdown** viewer with *live preview*.",
  "",
  "## Features",
  "",
  "- GFM tables",
  "- Code blocks with syntax hints",
  "- Task lists",
  "- Blockquotes",
  "- Mermaid diagrams \uD83E\uDDDC\u200D\u2640\uFE0F",
  "",
  "### Code Example",
  "",
  FENCE + "javascript",
  "const greet = (name) => {",
  '  return "Hello, " + name + "!";',
  "};",
  'console.log(greet("Developer"));',
  FENCE,
  "",
  "### Mermaid Diagram",
  "",
  FENCE + "mermaid",
  "graph LR",
  "    A[Markdown] --> B[Parser]",
  "    B --> C{Has Mermaid?}",
  "    C -->|Yes| D[Render Diagram]",
  "    C -->|No| E[Render HTML]",
  "    D --> F[Preview]",
  "    E --> F",
  FENCE,
  "",
  "### Table",
  "",
  "| Tool | Status |",
  "|------|--------|",
  "| JSON Linter | \u2705 Done |",
  "| Diff Checker | \u2705 Done |",
  "| Markdown Viewer | \u2705 Done |",
  "",
  "> No ads. No tracking. Just tools.",
  "",
  "---",
  "",
  "- [x] Build tools",
  "- [ ] Take over the world",
].join("\n")

export default function MarkdownViewerTool() {
  const [input, setInput] = useState(SAMPLE_MD)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(input)
    toast.success("Markdown copied")
  }

  const handleClear = () => setInput("")

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
        <Button size="sm" variant="outline" onClick={handleCopy} disabled={!input}>
          <Copy className="h-4 w-4 mr-1" /> Copy MD
        </Button>
        <Button size="sm" variant="outline" onClick={handleClear}>
          <Trash2 className="h-4 w-4 mr-1" /> Clear
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {input.split("\n").length} lines
        </span>
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden md:block" style={{ height: "65vh" }}>
        <Group orientation="horizontal">
          <Panel defaultSize={50} minSize={30}>
            <textarea
              className="w-full h-full p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste Markdown here..."
              spellCheck={false}
            />
          </Panel>
          <Separator className="w-1 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full overflow-y-auto p-6">
              <MarkdownRenderer content={input} />
            </div>
          </Panel>
        </Group>
      </div>

      {/* Mobile: stacked */}
      <div className="md:hidden flex flex-col">
        <div className="h-[35vh] border-b">
          <textarea
            className="w-full h-full p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste Markdown here..."
            spellCheck={false}
          />
        </div>
        <div className="h-[35vh] overflow-y-auto p-6">
          <MarkdownRenderer content={input} />
        </div>
      </div>
    </div>
  )
}
