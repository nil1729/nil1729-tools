"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle, ClipboardCopy, Eraser, FileJson } from "lucide-react"

type Indent = 2 | 4 | "\t"

interface ToolbarProps {
  indent: Indent
  output: string
  onIndentChange: (indent: Indent) => void
  onValidate: () => void
  onFormat: () => void
  onClear: () => void
}

export default function Toolbar({
  indent,
  output,
  onIndentChange,
  onValidate,
  onFormat,
  onClear,
}: ToolbarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy — try selecting manually")
    }
  }

  const indentValue = indent === "\t" ? "tab" : String(indent)

  const handleIndentChange = (value: string | null) => {
    if (value === "tab") onIndentChange("\t")
    else if (value === "2") onIndentChange(2)
    else onIndentChange(4)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b bg-muted/30">
      <div className="flex items-center gap-2 mr-auto">
        <span className="text-xs text-muted-foreground">Indent:</span>
        <Select value={indentValue} onValueChange={handleIndentChange}>
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 spaces</SelectItem>
            <SelectItem value="4">4 spaces</SelectItem>
            <SelectItem value="tab">Tab</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button size="sm" variant="outline" onClick={onValidate} className="h-7 text-xs gap-1">
        <CheckCircle className="h-3 w-3" />
        Validate
      </Button>

      <Button size="sm" onClick={onFormat} className="h-7 text-xs gap-1">
        <FileJson className="h-3 w-3" />
        Format
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleCopy}
        disabled={!output}
        className="h-7 text-xs gap-1"
      >
        <ClipboardCopy className="h-3 w-3" />
        {copied ? "Copied!" : "Copy Output"}
      </Button>

      <Button size="sm" variant="ghost" onClick={onClear} className="h-7 text-xs gap-1">
        <Eraser className="h-3 w-3" />
        Clear
      </Button>
    </div>
  )
}
