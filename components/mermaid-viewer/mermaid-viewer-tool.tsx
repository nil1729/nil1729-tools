"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Panel, Group, Separator } from "react-resizable-panels"
import { Button } from "@/components/ui/button"
import { Copy, Trash2, Download, AlertCircle, Image, ZoomIn, ZoomOut, Maximize } from "lucide-react"
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
  const renderIdRef = useRef(0)

  // Zoom/pan state
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0 })
  const translateStart = useRef({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  // Track resolved theme to re-init mermaid on theme change
  const [resolvedTheme, setResolvedTheme] = useState<string>("default")

  // Detect theme from DOM (next-themes applies class to <html>)
  useEffect(() => {
    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains("dark")
      setResolvedTheme(isDark ? "dark" : "default")
    }
    detectTheme()

    // Watch for class changes on <html> (next-themes toggles dark class)
    const observer = new MutationObserver(detectTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  // Load mermaid from CDN
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"
    script.onload = () => {
      // @ts-expect-error mermaid is loaded from CDN
      window.mermaid.initialize({
        startOnLoad: false,
        theme: resolvedTheme,
        securityLevel: "loose",
      })
      setMermaidLoaded(true)
    }
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-initialize mermaid when theme changes and re-render
  useEffect(() => {
    if (!mermaidLoaded) return
    // @ts-expect-error mermaid is loaded from CDN
    window.mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme,
      securityLevel: "loose",
    })
    // Re-render current diagram with new theme
    renderDiagram(input)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme, mermaidLoaded])

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

  // Reset zoom when SVG changes
  useEffect(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }, [svg])

  // Prevent page scroll when hovering the canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault()
    }

    canvas.addEventListener("wheel", preventScroll, { passive: false })
    return () => canvas.removeEventListener("wheel", preventScroll)
  }, [])

  // Zoom handlers
  const handleZoomIn = () => setScale(s => Math.min(s * 1.3, 5))
  const handleZoomOut = () => setScale(s => Math.max(s / 1.3, 0.2))
  const handleZoomReset = () => { setScale(1); setTranslate({ x: 0, y: 0 }) }

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(s => Math.max(0.2, Math.min(5, s * delta)))
  }, [])

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsPanning(true)
    panStart.current = { x: e.clientX, y: e.clientY }
    translateStart.current = { ...translate }
  }, [translate])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return
    const dx = e.clientX - panStart.current.x
    const dy = e.clientY - panStart.current.y
    setTranslate({ x: translateStart.current.x + dx, y: translateStart.current.y + dy })
  }, [isPanning])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

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
    if (!input.trim()) return

    try {
      // Create a temporary hidden container for export render
      const tempDiv = document.createElement("div")
      tempDiv.style.position = "absolute"
      tempDiv.style.left = "-9999px"
      tempDiv.style.top = "-9999px"
      document.body.appendChild(tempDiv)

      // Re-initialize mermaid with 'default' (light) theme for PNG export
      // @ts-expect-error mermaid is loaded from CDN
      const mermaid = window.mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
      })

      const exportId = `mermaid-export-${Date.now()}`
      const { svg: exportSvg } = await mermaid.render(exportId, input, tempDiv)
      document.body.removeChild(tempDiv)

      // Restore the current theme after export
      mermaid.initialize({
        startOnLoad: false,
        theme: resolvedTheme,
        securityLevel: "loose",
      })

      // Parse SVG and ensure it's self-contained
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(exportSvg, "image/svg+xml")
      const svgEl = svgDoc.querySelector("svg")
      if (!svgEl) { toast.error("Invalid SVG"); return }

      // Get dimensions
      let width = parseFloat(svgEl.getAttribute("width") || "800")
      let height = parseFloat(svgEl.getAttribute("height") || "600")
      const viewBox = svgEl.getAttribute("viewBox")
      if (viewBox) {
        const parts = viewBox.split(/\s+|,/).map(Number)
        if (parts.length === 4) {
          width = parts[2]
          height = parts[3]
        }
      }

      // Force explicit dimensions and namespaces
      svgEl.setAttribute("width", String(width))
      svgEl.setAttribute("height", String(height))
      svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg")
      svgEl.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
      svgEl.setAttribute("xmlns:xhtml", "http://www.w3.org/1999/xhtml")

      // Add a white background rect as the first child
      const bgRect = svgDoc.createElementNS("http://www.w3.org/2000/svg", "rect")
      bgRect.setAttribute("width", "100%")
      bgRect.setAttribute("height", "100%")
      bgRect.setAttribute("fill", "#ffffff")
      svgEl.insertBefore(bgRect, svgEl.firstChild)

      // Inline CSS styles from the page into the SVG so foreignObject text renders
      // Mermaid injects <style> blocks inside the SVG which should be preserved
      // Just ensure we have a fallback font style for foreignObject content
      const styleEl = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style")
      styleEl.textContent = `
        foreignObject { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        foreignObject div, foreignObject span, foreignObject p { color: #1f2937; }
        .edgeLabel { background-color: #ffffff; }
      `
      svgEl.insertBefore(styleEl, svgEl.firstChild)

      // Serialize the SVG as a self-contained data URL
      // Using data URL (not blob URL) avoids canvas taint
      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(svgEl)
      const svgDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString)

      const pngScale = 2
      const canvas = document.createElement("canvas")
      canvas.width = width * pngScale
      canvas.height = height * pngScale
      const ctx = canvas.getContext("2d")
      if (!ctx) { toast.error("Canvas not supported"); return }

      const img = new window.Image()
      img.onload = () => {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.scale(pngScale, pngScale)
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          if (!blob) { toast.error("Failed to generate PNG"); return }
          const pngUrl = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = pngUrl
          a.download = "diagram.png"
          a.click()
          URL.revokeObjectURL(pngUrl)
          toast.success("PNG downloaded (2x resolution)")
        }, "image/png")
      }
      img.onerror = () => {
        toast.error("Failed to render PNG — try SVG export instead")
      }
      img.src = svgDataUrl
    } catch (err) {
      console.error("PNG export error:", err)
      toast.error("Failed to generate PNG")
    }
  }

  const handleClear = () => {
    setInput("")
    setSvg("")
    setError("")
  }

  const DiagramCanvas = ({ className = "" }: { className?: string }) => (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden select-none ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isPanning ? "grabbing" : "grab" }}
    >
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-destructive text-sm max-w-md">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="break-all">{error}</span>
          </div>
        </div>
      ) : svg ? (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.1s ease-out",
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: svg }} className="[&_svg]:max-w-none" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-muted-foreground italic">Diagram will appear here...</span>
        </div>
      )}

      {/* Zoom controls overlay */}
      {svg && (
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm border rounded-md p-1 shadow-sm"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Button size="sm" variant="ghost" onClick={handleZoomOut} className="h-7 w-7 p-0">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <button
            onClick={handleZoomReset}
            className="text-xs font-mono w-12 text-center hover:bg-muted rounded px-1 py-0.5 cursor-pointer transition-colors"
            title="Reset to 100%"
          >
            {Math.round(scale * 100)}%
          </button>
          <Button size="sm" variant="ghost" onClick={handleZoomIn} className="h-7 w-7 p-0">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleZoomReset} className="h-7 w-7 p-0" title="Fit to view">
            <Maximize className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden bg-card h-[calc(100vh-16rem)]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30 shrink-0">
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

      {/* Desktop: side-by-side — fills remaining height */}
      <div className="hidden md:block flex-1 min-h-0">
        <Group orientation="horizontal" className="h-full">
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
            <DiagramCanvas className="h-full bg-white dark:bg-zinc-900" />
          </Panel>
        </Group>
      </div>

      {/* Mobile: stacked — fills remaining height */}
      <div className="md:hidden flex flex-col flex-1 min-h-0">
        <div className="h-1/2 border-b min-h-0">
          <textarea
            className="w-full h-full p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type Mermaid syntax here..."
            spellCheck={false}
          />
        </div>
        <DiagramCanvas className="h-1/2 min-h-0 bg-white dark:bg-zinc-900" />
      </div>
    </div>
  )
}

