"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Clock } from "lucide-react"
import { toast } from "sonner"

export default function TimestampTool() {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))
  const [timestamp, setTimestamp] = useState(String(Math.floor(Date.now() / 1000)))
  const [dateStr, setDateStr] = useState("")
  const [error, setError] = useState("")

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto-convert timestamp input
  useEffect(() => {
    if (!timestamp.trim()) { setDateStr(""); setError(""); return }
    const num = Number(timestamp.trim())
    if (isNaN(num)) { setError("Invalid number"); setDateStr(""); return }

    // Detect seconds vs milliseconds
    const ms = num > 1e12 ? num : num * 1000
    const date = new Date(ms)
    if (isNaN(date.getTime())) { setError("Invalid timestamp"); setDateStr(""); return }

    setError("")
    setDateStr(date.toISOString())
  }, [timestamp])

  const handleDateToTimestamp = () => {
    if (!dateStr.trim()) return
    const date = new Date(dateStr.trim())
    if (isNaN(date.getTime())) {
      setError("Invalid date string")
      return
    }
    setTimestamp(String(Math.floor(date.getTime() / 1000)))
    setError("")
  }

  const handleNow = () => {
    setTimestamp(String(now))
  }

  const copyValue = async (val: string) => {
    await navigator.clipboard.writeText(val)
    toast.success("Copied!")
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts * 1000)
    return {
      utc: d.toUTCString(),
      iso: d.toISOString(),
      local: d.toLocaleString(),
      relative: getRelative(ts),
    }
  }

  const getRelative = (ts: number) => {
    const diff = now - ts
    if (Math.abs(diff) < 60) return `${Math.abs(diff)} seconds ${diff >= 0 ? "ago" : "from now"}`
    if (Math.abs(diff) < 3600) return `${Math.floor(Math.abs(diff) / 60)} minutes ${diff >= 0 ? "ago" : "from now"}`
    if (Math.abs(diff) < 86400) return `${Math.floor(Math.abs(diff) / 3600)} hours ${diff >= 0 ? "ago" : "from now"}`
    return `${Math.floor(Math.abs(diff) / 86400)} days ${diff >= 0 ? "ago" : "from now"}`
  }

  const parsed = !error && timestamp.trim() ? formatDate(Number(timestamp) > 1e12 ? Number(timestamp) / 1000 : Number(timestamp)) : null

  return (
    <div className="flex flex-col gap-6">
      {/* Live clock */}
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <div className="font-mono text-sm">
          <span className="text-muted-foreground">Now: </span>
          <span className="font-bold text-lg">{now}</span>
          <span className="text-muted-foreground ml-4">{new Date(now * 1000).toISOString()}</span>
        </div>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => copyValue(String(now))}>
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      {/* Timestamp → Date */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">Unix Timestamp</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="flex-1 px-3 py-2 text-sm font-mono border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. 1700000000"
            />
            <Button size="sm" variant="outline" onClick={handleNow}>Now</Button>
          </div>
          <p className="text-xs text-muted-foreground">Supports seconds (10 digits) and milliseconds (13 digits)</p>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium">Date String</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="flex-1 px-3 py-2 text-sm font-mono border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. 2024-01-15T10:30:00Z"
            />
            <Button size="sm" variant="outline" onClick={handleDateToTimestamp}>→ TS</Button>
          </div>
          <p className="text-xs text-muted-foreground">ISO 8601, RFC 2822, or any parseable date format</p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</div>
      )}

      {/* Results */}
      {parsed && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-4 py-2 text-sm font-medium border-b">Converted Values</div>
          <div className="divide-y">
            {[
              { label: "ISO 8601", value: parsed.iso },
              { label: "UTC", value: parsed.utc },
              { label: "Local", value: parsed.local },
              { label: "Relative", value: parsed.relative },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-muted-foreground w-24">{label}</span>
                <span className="text-sm font-mono flex-1">{value}</span>
                <Button size="sm" variant="ghost" onClick={() => copyValue(value)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
