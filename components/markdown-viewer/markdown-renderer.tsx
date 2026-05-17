"use client"

import { useMemo, useEffect, useRef, useState } from "react"

interface MarkdownRendererProps {
  content: string
}

interface MermaidBlockProps {
  code: string
  id: string
}

function MermaidBlock({ code, id }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    const renderMermaid = async () => {
      // @ts-expect-error mermaid loaded from CDN
      if (!window.mermaid) {
        await new Promise<void>((resolve, reject) => {
          // @ts-expect-error mermaid loaded from CDN
          if (window.mermaid) { resolve(); return }
          const existing = document.querySelector('script[src*="mermaid"]')
          if (existing) {
            existing.addEventListener("load", () => resolve())
            return
          }
          const script = document.createElement("script")
          script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"
          script.onload = () => {
            // @ts-expect-error mermaid loaded from CDN
            window.mermaid.initialize({
              startOnLoad: false,
              theme: document.documentElement.classList.contains("dark") ? "dark" : "default",
              securityLevel: "loose",
            })
            resolve()
          }
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      try {
        // @ts-expect-error mermaid loaded from CDN
        const { svg: rendered } = await window.mermaid.render(`md-mermaid-${id}`, code)
        if (!cancelled) {
          setSvg(rendered)
          setError("")
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Mermaid render error")
          setSvg("")
        }
      }
    }

    renderMermaid()
    return () => { cancelled = true }
  }, [code, id])

  if (error) {
    return (
      <div className="border border-destructive/30 rounded p-3 text-sm text-destructive bg-destructive/5 my-3">
        <span className="font-medium">Mermaid Error:</span> {error}
      </div>
    )
  }

  if (!svg) {
    return (
      <div className="border rounded p-4 my-3 text-center text-muted-foreground text-sm animate-pulse">
        Rendering diagram...
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="my-3 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

function parseMarkdown(md: string): string {
  let html = md

  // Extract code blocks FIRST (before HTML escaping corrupts their content)
  const codeBlocks: string[] = []
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    if (lang === "mermaid") {
      const placeholder = `%%CODEBLOCK_${codeBlocks.length}%%`
      codeBlocks.push(`<div data-mermaid-code="${encodeURIComponent(code.trim())}"></div>`)
      return placeholder
    }
    const escaped = code.trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const placeholder = `%%CODEBLOCK_${codeBlocks.length}%%`
    codeBlocks.push(`<pre class="md-codeblock"><code class="language-${lang}">${escaped}</code></pre>`)
    return placeholder
  })

  // Escape HTML entities in remaining content
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="md-h6">$1</h6>')
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="md-h5">$1</h5>')
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="md-h4">$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="md-h3">$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="md-h2">$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="md-h1">$1</h1>')

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="md-hr" />')

  // Blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>")

  // Links and images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-img" />')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="md-link" target="_blank" rel="noopener noreferrer">$1</a>')

  // Tables
  html = html.replace(/^(\|.+\|)\n\|[-|: ]+\|\n((?:\|.+\|\n?)*)/gm, (_match, headerRow, bodyRows) => {
    const headers = headerRow.split("|").filter((c: string) => c.trim()).map((c: string) => `<th class="md-th">${c.trim()}</th>`).join("")
    const rows = bodyRows.trim().split("\n").map((row: string) => {
      const cells = row.split("|").filter((c: string) => c.trim()).map((c: string) => `<td class="md-td">${c.trim()}</td>`).join("")
      return `<tr>${cells}</tr>`
    }).join("")
    return `<table class="md-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`
  })

  // Task lists
  html = html.replace(/^- \[x\]\s+(.+)$/gm, '<div class="md-task"><input type="checkbox" checked disabled /> $1</div>')
  html = html.replace(/^- \[ \]\s+(.+)$/gm, '<div class="md-task"><input type="checkbox" disabled /> $1</div>')

  // Unordered lists
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li class="md-li">$1</li>')
  html = html.replace(/((?:<li class="md-li">.*<\/li>\n?)+)/g, '<ul class="md-ul">$1</ul>')

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="md-oli">$1</li>')
  html = html.replace(/((?:<li class="md-oli">.*<\/li>\n?)+)/g, '<ol class="md-ol">$1</ol>')

  // Paragraphs — wrap remaining loose text
  html = html.replace(/^(?!<[a-z/])(\S.+)$/gm, '<p class="md-p">$1</p>')

  // Restore code blocks from placeholders
  codeBlocks.forEach((block, i) => {
    html = html.replace(`%%CODEBLOCK_${i}%%`, block)
  })

  return html
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const parsed = useMemo(() => parseMarkdown(content), [content])

  // Extract mermaid blocks and split the HTML
  const segments = useMemo(() => {
    const parts: Array<{ type: "html"; content: string } | { type: "mermaid"; code: string; id: string }> = []
    const regex = /<div data-mermaid-code="([^"]+)"><\/div>/g
    let lastIndex = 0
    let match
    let mermaidIdx = 0

    while ((match = regex.exec(parsed)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "html", content: parsed.slice(lastIndex, match.index) })
      }
      parts.push({ type: "mermaid", code: decodeURIComponent(match[1]), id: `${mermaidIdx++}` })
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < parsed.length) {
      parts.push({ type: "html", content: parsed.slice(lastIndex) })
    }
    return parts
  }, [parsed])

  if (!content.trim()) {
    return <p className="text-muted-foreground italic">Preview will appear here...</p>
  }

  return (
    <div className="md-body prose prose-sm dark:prose-invert max-w-none">
      {segments.map((seg, idx) =>
        seg.type === "html" ? (
          <div key={idx} dangerouslySetInnerHTML={{ __html: seg.content }} />
        ) : (
          <MermaidBlock key={idx} code={seg.code} id={seg.id} />
        )
      )}
    </div>
  )
}
