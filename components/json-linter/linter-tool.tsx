"use client"

import { useState } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { formatJson, validateJson } from "@/lib/json-utils"
import type { ParseError } from "@/lib/json-utils"
import Toolbar from "./toolbar"
import InputPanel from "./input-panel"
import OutputPanel from "./output-panel"
import StatusBar from "./status-bar"

type Status = "idle" | "valid" | "error"
type Indent = 2 | 4 | "\t"

export default function LinterTool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [indent, setIndent] = useState<Indent>(2)
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<ParseError | null>(null)

  const handleValidate = () => {
    if (!input.trim()) {
      setStatus("idle")
      setError(null)
      return
    }
    const result = validateJson(input)
    if (result.ok) {
      setStatus("valid")
      setError(null)
    } else {
      setStatus("error")
      setError(result.error)
    }
  }

  const handleFormat = () => {
    if (!input.trim()) {
      setStatus("idle")
      setError(null)
      return
    }
    const result = formatJson(input, indent)
    if (result.ok) {
      setOutput(result.output)
      setStatus("valid")
      setError(null)
    } else {
      setStatus("error")
      setError(result.error)
    }
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
    setStatus("idle")
    setError(null)
  }

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden bg-card">
      <Toolbar
        indent={indent}
        output={output}
        onIndentChange={setIndent}
        onValidate={handleValidate}
        onFormat={handleFormat}
        onClear={handleClear}
      />

      {/* Desktop: side-by-side resizable panels */}
      <div className="hidden md:block" style={{ height: "60vh" }}>
        <PanelGroup direction="horizontal">
          <Panel defaultSize={50} minSize={30}>
            <InputPanel value={input} onChange={setInput} />
          </Panel>
          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />
          <Panel defaultSize={50} minSize={30}>
            <OutputPanel output={output} />
          </Panel>
        </PanelGroup>
      </div>

      {/* Mobile: stacked panels */}
      <div className="md:hidden flex flex-col">
        <div className="h-[40vh] border-b">
          <InputPanel value={input} onChange={setInput} />
        </div>
        <div className="h-[40vh]">
          <OutputPanel output={output} />
        </div>
      </div>

      <StatusBar status={status} error={error} />
    </div>
  )
}
