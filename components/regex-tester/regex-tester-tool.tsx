"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

const SAMPLE_PATTERN = "([A-Z][a-z]+)\\s(\\d{4})"
const SAMPLE_TEXT = `January 2024
February 2025
March 2026
Hello World
April 2027`

interface MatchResult {
  full: string
  index: number
  groups: string[]
}

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState(SAMPLE_PATTERN)
  const [flags, setFlags] = useState("gm")
  const [text, setText] = useState(SAMPLE_TEXT)

  const flagOptions = [
    { flag: "g", label: "Global" },
    { flag: "i", label: "Case Insensitive" },
    { flag: "m", label: "Multiline" },
    { flag: "s", label: "Dotall" },
    { flag: "u", label: "Unicode" },
  ]

  const toggleFlag = (f: string) => {
    setFlags((prev) => prev.includes(f) ? prev.replace(f, "") : prev + f)
  }

  const { matches, error, highlightedHtml } = useMemo(() => {
    if (!pattern.trim()) return { matches: [], error: "", highlightedHtml: "" }

    try {
      const regex = new RegExp(pattern, flags)
      const results: MatchResult[] = []
      let match: RegExpExecArray | null

      if (flags.includes("g")) {
        while ((match = regex.exec(text)) !== null) {
          results.push({
            full: match[0],
            index: match.index,
            groups: match.slice(1),
          })
          if (!match[0]) regex.lastIndex++
        }
      } else {
        match = regex.exec(text)
        if (match) {
          results.push({
            full: match[0],
            index: match.index,
            groups: match.slice(1),
          })
        }
      }

      // Build highlighted HTML
      let html = ""
      let lastIndex = 0
      const allMatches: { start: number; end: number }[] = []

      const regex2 = new RegExp(pattern, flags.includes("g") ? flags : flags + "g")
      let m: RegExpExecArray | null
      while ((m = regex2.exec(text)) !== null) {
        allMatches.push({ start: m.index, end: m.index + m[0].length })
        if (!m[0]) regex2.lastIndex++
      }

      for (const { start, end } of allMatches) {
        html += escapeHtml(text.slice(lastIndex, start))
        html += '<mark class="bg-yellow-300/80 dark:bg-yellow-500/40 rounded px-0.5">' + escapeHtml(text.slice(start, end)) + "</mark>"
        lastIndex = end
      }
      html += escapeHtml(text.slice(lastIndex))

      return { matches: results, error: "", highlightedHtml: html }
    } catch (err) {
      return { matches: [], error: err instanceof Error ? err.message : "Invalid regex", highlightedHtml: "" }
    }
  }, [pattern, flags, text])

  const handleClear = () => {
    setPattern("")
    setFlags("gm")
    setText("")
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Pattern input */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 text-sm font-mono border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter regex pattern..."
          />
          <span className="text-sm font-medium text-muted-foreground">/{flags}</span>
          <Button size="sm" variant="outline" onClick={handleClear}>
            <Trash2 className="h-4 w-4 mr-1" /> Clear
          </Button>
        </div>

        {/* Flag toggles */}
        <div className="flex gap-2 flex-wrap">
          {flagOptions.map(({ flag, label }) => (
            <button
              key={flag}
              onClick={() => toggleFlag(flag)}
              className={`px-2 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
                flags.includes(flag)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {flag} <span className="text-[10px] opacity-70">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Test string */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Test String</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-64 p-3 font-mono text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter test string..."
            spellCheck={false}
          />
        </div>

        {/* Highlighted result */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Matches <span className="text-muted-foreground font-normal">({matches.length} found)</span>
          </label>
          <div
            className="w-full h-64 p-3 font-mono text-sm border rounded-md bg-muted/30 overflow-auto whitespace-pre-wrap break-all"
            dangerouslySetInnerHTML={{ __html: highlightedHtml || '<span class="text-muted-foreground italic">Matches will be highlighted here...</span>' }}
          />
        </div>
      </div>

      {/* Match details */}
      {matches.length > 0 && (
        <div className="border rounded-md overflow-hidden">
          <div className="bg-muted/50 px-3 py-2 text-sm font-medium border-b">
            Match Details
          </div>
          <div className="max-h-48 overflow-auto">
            {matches.map((m, i) => (
              <div key={i} className="px-3 py-2 border-b last:border-b-0 text-sm font-mono">
                <span className="text-muted-foreground">#{i + 1}</span>{" "}
                <span className="text-primary font-medium">&quot;{m.full}&quot;</span>
                <span className="text-muted-foreground ml-2">@{m.index}</span>
                {m.groups.length > 0 && (
                  <span className="ml-3 text-xs">
                    {m.groups.map((g, gi) => (
                      <span key={gi} className="inline-block mr-2 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                        ${gi + 1}: {g}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
