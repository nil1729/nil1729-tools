"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft, Copy, Trash2 } from "lucide-react"
import { toast } from "sonner"

type Mode = "encodeComponent" | "encodeURI" | "decode"

export default function UrlEncoderTool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<Mode>("encodeComponent")

  const handleEncodeComponent = () => {
    try {
      setOutput(encodeURIComponent(input))
      setMode("encodeComponent")
    } catch {
      toast.error("Failed to encode")
    }
  }

  const handleEncodeURI = () => {
    try {
      setOutput(encodeURI(input))
      setMode("encodeURI")
    } catch {
      toast.error("Failed to encode")
    }
  }

  const handleDecode = () => {
    try {
      setOutput(decodeURIComponent(input))
      setMode("decode")
    } catch {
      toast.error("Failed to decode — malformed URI")
    }
  }

  const handleSwap = () => {
    setInput(output)
    setOutput("")
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    toast.success("Copied to clipboard")
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
  }

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden bg-card">
      <div className="flex flex-wrap items-center gap-2 p-3 border-b bg-muted/30">
        <Button size="sm" onClick={handleEncodeComponent} variant={mode === "encodeComponent" ? "default" : "outline"}>
          Encode Component
        </Button>
        <Button size="sm" onClick={handleEncodeURI} variant={mode === "encodeURI" ? "default" : "outline"}>
          Encode URI
        </Button>
        <Button size="sm" onClick={handleDecode} variant={mode === "decode" ? "default" : "outline"}>
          Decode
        </Button>
        <div className="hidden md:block w-px h-6 bg-border" />
        <Button size="sm" variant="outline" onClick={handleSwap} title="Swap output → input">
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleCopy} disabled={!output}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleClear}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
        <div className="relative">
          <label className="absolute top-2 left-3 text-xs text-muted-foreground font-medium">Input</label>
          <textarea
            className="w-full h-[50vh] p-3 pt-8 font-mono text-sm bg-transparent resize-none focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste URL or text here..."
            spellCheck={false}
          />
        </div>
        <div className="relative">
          <label className="absolute top-2 left-3 text-xs text-muted-foreground font-medium">Output</label>
          <textarea
            className="w-full h-[50vh] p-3 pt-8 font-mono text-sm bg-transparent resize-none focus:outline-none"
            value={output}
            readOnly
            placeholder="Result will appear here..."
          />
        </div>
      </div>
    </div>
  )
}
