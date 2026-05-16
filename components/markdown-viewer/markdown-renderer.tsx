"use client"

import { useMemo } from "react"

interface MarkdownRendererProps {
  content: string
}

/**
 * Lightweight Markdown → HTML renderer. Handles the most common GFM features.
 * No external dependency — keeps the bundle small.
 */
function parseMarkdown(md: string): string {
  let html = md

  // Escape HTML entities
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  // Code blocks (fenced)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    return `<pre class="md-codeblock"><code class="language-${lang}">${code.trim()}</code></pre>`
  })

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

  return html
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => parseMarkdown(content), [content])

  if (!content.trim()) {
    return <p className="text-muted-foreground italic">Preview will appear here...</p>
  }

  return (
    <div
      className="md-body prose prose-sm dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
