"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"

const PRESETS = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every day at midnight", cron: "0 0 * * *" },
  { label: "Every Monday at 9am", cron: "0 9 * * 1" },
  { label: "Every weekday at 8:30am", cron: "30 8 * * 1-5" },
  { label: "Every 15 minutes", cron: "*/15 * * * *" },
  { label: "1st of every month", cron: "0 0 1 * *" },
  { label: "Every Sunday at 2am", cron: "0 2 * * 0" },
]

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

interface CronParts {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

function parseCron(expr: string): { parts: CronParts | null; error: string } {
  const fields = expr.trim().split(/\s+/)
  if (fields.length !== 5) return { parts: null, error: `Expected 5 fields, got ${fields.length}` }
  return {
    parts: { minute: fields[0], hour: fields[1], dayOfMonth: fields[2], month: fields[3], dayOfWeek: fields[4] },
    error: ""
  }
}

function describeField(field: string, type: "minute" | "hour" | "dayOfMonth" | "month" | "dayOfWeek"): string {
  if (field === "*") return ""

  // Step: */n
  if (field.startsWith("*/")) {
    const step = field.slice(2)
    return `every ${step} ${type === "dayOfMonth" ? "days" : type + "s"}`
  }

  // Range: a-b
  if (field.includes("-") && !field.includes(",")) {
    const [start, end] = field.split("-")
    if (type === "dayOfWeek") return `${DAYS[Number(start)]} through ${DAYS[Number(end)]}`
    if (type === "month") return `${MONTHS[Number(start)]} through ${MONTHS[Number(end)]}`
    return `${start} through ${end}`
  }

  // List: a,b,c
  if (field.includes(",")) {
    const items = field.split(",")
    if (type === "dayOfWeek") return items.map(i => DAYS[Number(i)]).join(", ")
    if (type === "month") return items.map(i => MONTHS[Number(i)]).join(", ")
    return items.join(", ")
  }

  // Single value
  if (type === "dayOfWeek") return DAYS[Number(field)] || field
  if (type === "month") return MONTHS[Number(field)] || field
  return field
}

function describeCron(parts: CronParts): string {
  const { minute, hour, dayOfMonth, month, dayOfWeek } = parts
  const pieces: string[] = []

  // Every minute
  if (minute === "*" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return "Every minute"
  }

  // Time
  if (minute.startsWith("*/")) {
    pieces.push(`Every ${minute.slice(2)} minutes`)
  } else if (hour === "*" && minute !== "*") {
    pieces.push(`At minute ${minute} of every hour`)
  } else if (hour !== "*" && minute !== "*") {
    const h = hour.padStart(2, "0")
    const m = minute.padStart(2, "0")
    pieces.push(`At ${h}:${m}`)
  } else if (hour.startsWith("*/")) {
    pieces.push(`Every ${hour.slice(2)} hours`)
  }

  // Day of week
  if (dayOfWeek !== "*") {
    pieces.push(`on ${describeField(dayOfWeek, "dayOfWeek")}`)
  }

  // Day of month
  if (dayOfMonth !== "*") {
    if (dayOfMonth.startsWith("*/")) {
      pieces.push(`every ${dayOfMonth.slice(2)} days`)
    } else {
      pieces.push(`on day ${dayOfMonth} of the month`)
    }
  }

  // Month
  if (month !== "*") {
    pieces.push(`in ${describeField(month, "month")}`)
  }

  return pieces.join(" ") || "Every minute"
}

function getNextRuns(parts: CronParts, count: number = 5): Date[] {
  const results: Date[] = []
  const now = new Date()
  const candidate = new Date(now)
  candidate.setSeconds(0, 0)
  candidate.setMinutes(candidate.getMinutes() + 1)

  const maxIterations = 525960 // ~1 year of minutes

  for (let i = 0; i < maxIterations && results.length < count; i++) {
    if (matches(candidate, parts)) {
      results.push(new Date(candidate))
    }
    candidate.setMinutes(candidate.getMinutes() + 1)
  }

  return results
}

function matchesField(value: number, field: string): boolean {
  if (field === "*") return true
  if (field.startsWith("*/")) {
    const step = Number(field.slice(2))
    return value % step === 0
  }
  if (field.includes(",")) {
    return field.split(",").map(Number).includes(value)
  }
  if (field.includes("-")) {
    const [start, end] = field.split("-").map(Number)
    return value >= start && value <= end
  }
  return value === Number(field)
}

function matches(date: Date, parts: CronParts): boolean {
  const minute = date.getMinutes()
  const hour = date.getHours()
  const dayOfMonth = date.getDate()
  const month = date.getMonth() + 1
  const dayOfWeek = date.getDay()

  return (
    matchesField(minute, parts.minute) &&
    matchesField(hour, parts.hour) &&
    matchesField(dayOfMonth, parts.dayOfMonth) &&
    matchesField(month, parts.month) &&
    matchesField(dayOfWeek, parts.dayOfWeek)
  )
}

export default function CronParserTool() {
  const [expression, setExpression] = useState("0 9 * * 1-5")

  const result = useMemo(() => {
    if (!expression.trim()) return null
    const { parts, error } = parseCron(expression)
    if (error || !parts) return { error, description: "", nextRuns: [] }

    const description = describeCron(parts)
    const nextRuns = getNextRuns(parts, 5)
    return { error: "", description, nextRuns, parts }
  }, [expression])

  const copyValue = async (val: string) => {
    await navigator.clipboard.writeText(val)
    toast.success("Copied!")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Cron Expression</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="flex-1 px-4 py-3 text-lg font-mono border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring tracking-wider"
            placeholder="* * * * *"
          />
          <Button size="sm" variant="ghost" onClick={() => copyValue(expression)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground font-mono">
          <span>┌ minute (0-59)</span>
          <span>│ ┌ hour (0-23)</span>
          <span>│ │ ┌ day (1-31)</span>
          <span>│ │ │ ┌ month (1-12)</span>
          <span>│ │ │ │ ┌ weekday (0-6)</span>
        </div>
      </div>

      {/* Description */}
      {result && !result.error && (
        <div className="p-4 border rounded-lg bg-muted/30">
          <div className="text-lg font-medium">{result.description}</div>
        </div>
      )}

      {result?.error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {result.error}
        </div>
      )}

      {/* Next runs */}
      {result && result.nextRuns.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-4 py-2 text-sm font-medium border-b">Next 5 Run Times</div>
          <div className="divide-y">
            {result.nextRuns.map((date, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-muted-foreground w-8">#{i + 1}</span>
                <span className="text-sm font-mono flex-1">{date.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground ml-4">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Presets */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 text-sm font-medium border-b">Common Presets</div>
        <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0">
          {PRESETS.map(({ label, cron }) => (
            <button
              key={cron}
              onClick={() => setExpression(cron)}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors text-left cursor-pointer border-b sm:border-b-0 sm:odd:border-r"
            >
              <span className="text-sm">{label}</span>
              <code className="text-xs font-mono text-muted-foreground">{cron}</code>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
