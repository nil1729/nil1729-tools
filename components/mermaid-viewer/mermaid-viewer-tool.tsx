"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Panel, Group, Separator } from "react-resizable-panels"
import { Button } from "@/components/ui/button"
import { Copy, Trash2, Download, AlertCircle, Image } from "lucide-react"
import { toast } from "sonner"

const SAMPLE_MERMAID = `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[Ship it 🚀]`

export default function MermaidViewerTool() {
  const [input, setInput] = useState(SAMPLE_MERMAID)
  const [svg, setSvg] = useState("")
  const [error, setError] = useState("")
  const [mermaidLoaded, setMermaidLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const renderIdRef = useRef(0)

  // Load mermaid from CDN
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"
    script.onload = () => {
      // @ts-expect-error mermaid is loaded from CDN
      window.mermaid.initialize({
        startOnLoad: false,
        theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
        securityLevel: "loose",
      })
      setMermaidLoaded(true)
    }
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  const renderDiagram = useCallback(async (code: string) => {
    if (!mermaidLoaded || !code.trim()) {
      setSvg("")
      setError("")
      return
    }

    const currentId = ++renderIdRef.current

    try {
      // @ts-expect-error mermaid is loaded from CDN
      const { svg: renderedSvg } = await window.mermaid.render(`mermaid-${currentId}`, code)
      if (currentId === renderIdRef.current) {
        setSvg(renderedSvg)
        setError("")
      }
    } catch (err) {
      if (currentId === renderIdRef.current) {
        setSvg("")
        setError(err instanceof Error ? err.message : "Failed to render diagram")
      }
    }
  }, [mermaidLoaded])

  // Re-render on input change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => renderDiagram(input), 300)
    return () => clearTimeout(timer)
  }, [input, renderDiagram])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(input)
    toast.success("Mermaid code copied")
  }

  const handleDownloadSvg = () => {
    if (!svg) return
    const blob = new Blob([svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "diagram.svg"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("SVG downloaded")
  }

  const handleDownloadPng = async () => {
    if (!svg) return

    try {
      // Convert SVG to a data URL to avoid canvas taint (blob URLs are cross-origin)
      const svgData = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string

        const img = new window.Image()
        img.onload = () => {
          const scale = 2
          const canvas = document.createElement("canvas")
          canvas.width = img.naturalWidth * scale
          canvas.height = img.naturalHeight * scale
          const ctx = canvas.getContext("2d")
          if (!ctx) return

          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.scale(scale, scale)
          ctx.drawImage(img, 0, 0)

          canvas.toBlob((blob) => {
            if (!blob) return
            const pngUrl = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = pngUrl
            a.download = "diagram.png"
            a.click()
            URL.revokeObjectURL(pngUrl)
            toast.success("PNG downloaded")
          }, "image/png")
        }
        img.onerror = () => {
          toast.error("Failed to generate PNG")
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(svgData)
    } catch {
      toast.error("Failed to generate PNG")
    }
  }

  const handleClear = () => {
    setInput("")
    setSvg("")
    setError("")
  }

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
        <Button size="sm" variant="outline" onClick={handleCopy} disabled={!input}>
          <Copy className="h-4 w-4 mr-1" /> Copy
        </Button>
        <Button size="sm" variant="outline" onClick={handleDownloadSvg} disabled={!svg}>
          <Download className="h-4 w-4 mr-1" /> SVG
        </Button>
        <Button size="sm" variant="outline" onClick={handleDownloadPng} disabled={!svg}>
          <Image className="h-4 w-4 mr-1" /> PNG
        </Button>
        <Button size="sm" variant="outline" onClick={handleClear}>
          <Trash2 className="h-4 w-4 mr-1" /> Clear
        </Button>
        {!mermaidLoaded && (
          <span className="ml-auto text-xs text-muted-foreground">Loading Mermaid...</span>
        )}
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden md:block" style={{ height: "65vh" }}>
        <Group orientation="horizontal">
          <Panel defaultSize={40} minSize={25}>
            <textarea
              className="w-full h-full p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type Mermaid syntax here..."
              spellCheck={false}
            />
          </Panel>
          <Separator className="w-1 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />
          <Panel defaultSize={60} minSize={35}>
            <div ref={containerRef} className="h-full overflow-auto flex items-center justify-center p-4">
              {error ? (
                <div className="flex items-center gap-2 text-destructive text-sm max-w-md">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="break-all">{error}</span>
                </div>
              ) : svg ? (
                <div dangerouslySetInnerHTML={{ __html: svg }} className="max-w-full" />
              ) : (
                <span className="text-muted-foreground italic">Diagram will appear here...</span>
              )}
            </div>
          </Panel>
        </Group>
      </div>

      {/* Mobile: stacked */}
      <div className="md:hidden flex flex-col">
        <div className="h-[30vh] border-b">
          <textarea
            className="w-full h-full p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type Mermaid syntax here..."
            spellCheck={false}
          />
        </div>
        <div className="h-[35vh] overflow-auto flex items-center justify-center p-4">
          {error ? (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : svg ? (
            <div dangerouslySetInnerHTML={{ __html: svg }} className="max-w-full" />
          ) : (
            <span className="text-muted-foreground italic">Diagram will appear here...</span>
          )}
        </div>
      </div>
    </div>
  )
}
