"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft, Copy, Trash2 } from "lucide-react"
import { toast } from "sonner"

const SAMPLE_YAML = `name: Nilanjan Deb
role: Data Engineer
skills:
  - Spark
  - Kafka
  - Iceberg
config:
  environment: production
  debug: false
  max_retries: 3
  tags:
    team: platform
    priority: high`

const SAMPLE_JSON = JSON.stringify({
  name: "Nilanjan Deb",
  role: "Data Engineer",
  skills: ["Spark", "Kafka", "Iceberg"],
  config: {
    environment: "production",
    debug: false,
    max_retries: 3,
    tags: { team: "platform", priority: "high" }
  }
}, null, 2)

// Simple YAML parser (handles common cases: scalars, arrays, nested objects)
function parseYaml(yaml: string): unknown {
  const lines = yaml.split("\n")
  return parseBlock(lines, 0, 0).value
}

interface ParseResult {
  value: unknown
  consumed: number
}

function parseBlock(lines: string[], start: number, indent: number): ParseResult {
  const result: Record<string, unknown> = {}
  let i = start

  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === "" || line.trim().startsWith("#")) { i++; continue }

    const currentIndent = line.length - line.trimStart().length
    if (currentIndent < indent) break

    const trimmed = line.trim()

    // Array item at this indent level
    if (trimmed.startsWith("- ")) {
      // We're parsing an array
      const arr: unknown[] = []
      while (i < lines.length) {
        const l = lines[i]
        if (l.trim() === "" || l.trim().startsWith("#")) { i++; continue }
        const ci = l.length - l.trimStart().length
        if (ci < indent) break
        if (ci === indent && l.trim().startsWith("- ")) {
          const val = l.trim().slice(2)
          if (val.includes(": ")) {
            // Inline object in array
            const obj: Record<string, unknown> = {}
            val.split(", ").forEach(pair => {
              const [k, ...v] = pair.split(": ")
              obj[k.trim()] = parseScalar(v.join(": ").trim())
            })
            arr.push(obj)
          } else {
            arr.push(parseScalar(val))
          }
          i++
        } else if (ci > indent) {
          // Nested content under array item
          const nested = parseBlock(lines, i, ci)
          arr[arr.length - 1] = nested.value
          i = start + nested.consumed
        } else {
          break
        }
      }
      return { value: arr, consumed: i - start }
    }

    // Key-value pair
    const colonIdx = trimmed.indexOf(":")
    if (colonIdx > 0) {
      const key = trimmed.slice(0, colonIdx).trim()
      const valueStr = trimmed.slice(colonIdx + 1).trim()

      if (valueStr === "" || valueStr === "|" || valueStr === ">") {
        // Block value — check next lines
        i++
        if (i < lines.length) {
          const nextLine = lines[i]
          const nextIndent = nextLine.length - nextLine.trimStart().length
          if (nextIndent > currentIndent) {
            // Check if it's an array or nested object
            if (lines[i].trim().startsWith("- ")) {
              const nested = parseBlock(lines, i, nextIndent)
              result[key] = nested.value
              i = start + (i - start) + nested.consumed
            } else {
              const nested = parseBlock(lines, i, nextIndent)
              result[key] = nested.value
              i = start + (i - start) + nested.consumed
            }
          } else {
            result[key] = null
          }
        } else {
          result[key] = null
        }
      } else {
        result[key] = parseScalar(valueStr)
        i++
      }
    } else {
      i++
    }
  }

  return { value: result, consumed: i - start }
}

function parseScalar(val: string): unknown {
  if (val === "true" || val === "True" || val === "TRUE") return true
  if (val === "false" || val === "False" || val === "FALSE") return false
  if (val === "null" || val === "~" || val === "Null" || val === "NULL") return null
  if (/^-?\d+$/.test(val)) return parseInt(val, 10)
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val)
  // Strip quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1)
  }
  // Inline array
  if (val.startsWith("[") && val.endsWith("]")) {
    try { return JSON.parse(val) } catch { /* fall through */ }
    return val.slice(1, -1).split(",").map(s => parseScalar(s.trim()))
  }
  // Inline object
  if (val.startsWith("{") && val.endsWith("}")) {
    try { return JSON.parse(val) } catch { /* fall through */ }
  }
  return val
}

// JSON to YAML serializer
function jsonToYaml(obj: unknown, indent: number = 0): string {
  const prefix = "  ".repeat(indent)

  if (obj === null || obj === undefined) return "null"
  if (typeof obj === "boolean") return obj.toString()
  if (typeof obj === "number") return obj.toString()
  if (typeof obj === "string") {
    if (obj.includes("\n") || obj.includes(": ") || obj.includes("#") || obj.startsWith("{") || obj.startsWith("[")) {
      return JSON.stringify(obj)
    }
    return obj
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]"
    return obj.map(item => {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        const inner = jsonToYaml(item, indent + 1)
        const firstLine = inner.split("\n")[0]
        const rest = inner.split("\n").slice(1).join("\n")
        return `${prefix}- ${firstLine}${rest ? "\n" + rest : ""}`
      }
      return `${prefix}- ${jsonToYaml(item, indent + 1)}`
    }).join("\n")
  }

  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0) return "{}"
    return entries.map(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        const inner = jsonToYaml(value, indent + 1)
        return `${prefix}${key}:\n${inner}`
      }
      return `${prefix}${key}: ${jsonToYaml(value, indent + 1)}`
    }).join("\n")
  }

  return String(obj)
}

export default function YamlJsonTool() {
  const [left, setLeft] = useState(SAMPLE_YAML)
  const [right, setRight] = useState("")
  const [mode, setMode] = useState<"yaml-to-json" | "json-to-yaml">("yaml-to-json")
  const [error, setError] = useState("")

  const convert = () => {
    setError("")
    try {
      if (mode === "yaml-to-json") {
        const parsed = parseYaml(left)
        setRight(JSON.stringify(parsed, null, 2))
      } else {
        const parsed = JSON.parse(left)
        setRight(jsonToYaml(parsed))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed")
      setRight("")
    }
  }

  const swap = () => {
    setMode(mode === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json")
    setLeft(right)
    setRight("")
    setError("")
  }

  const handleCopy = async () => {
    if (!right) return
    await navigator.clipboard.writeText(right)
    toast.success("Output copied!")
  }

  const handleClear = () => {
    setLeft("")
    setRight("")
    setError("")
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" onClick={convert}>
          Convert {mode === "yaml-to-json" ? "YAML → JSON" : "JSON → YAML"}
        </Button>
        <Button size="sm" variant="outline" onClick={swap}>
          <ArrowRightLeft className="h-4 w-4 mr-1" /> Swap
        </Button>
        <Button size="sm" variant="outline" onClick={handleCopy} disabled={!right}>
          <Copy className="h-4 w-4 mr-1" /> Copy
        </Button>
        <Button size="sm" variant="outline" onClick={handleClear}>
          <Trash2 className="h-4 w-4 mr-1" /> Clear
        </Button>
        <span className="ml-auto text-xs text-muted-foreground font-mono">
          {mode === "yaml-to-json" ? "YAML → JSON" : "JSON → YAML"}
        </span>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Panels */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            Input ({mode === "yaml-to-json" ? "YAML" : "JSON"})
          </label>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            className="w-full h-80 p-3 font-mono text-sm border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={mode === "yaml-to-json" ? "Paste YAML here..." : "Paste JSON here..."}
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            Output ({mode === "yaml-to-json" ? "JSON" : "YAML"})
          </label>
          <textarea
            value={right}
            readOnly
            className="w-full h-80 p-3 font-mono text-sm border rounded-md bg-muted/30 resize-none"
            placeholder="Converted output will appear here..."
          />
        </div>
      </div>
    </div>
  )
}
