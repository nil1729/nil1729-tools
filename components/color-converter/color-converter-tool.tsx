"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }

function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace(/^#/, "")
  let r: number, g: number, b: number
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16)
    g = parseInt(clean[1] + clean[1], 16)
    b = parseInt(clean[2] + clean[2], 16)
  } else if (clean.length === 6) {
    r = parseInt(clean.slice(0, 2), 16)
    g = parseInt(clean.slice(2, 4), 16)
    b = parseInt(clean.slice(4, 6), 16)
  } else {
    return null
  }
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null
  return { r, g, b }
}

function rgbToHex(rgb: RGB): string {
  return "#" + [rgb.r, rgb.g, rgb.b].map(c => c.toString(16).padStart(2, "0")).join("")
}

function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360, s = hsl.s / 100, l = hsl.l / 100
  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

function relativeLuminance(rgb: RGB): number {
  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(rgb: RGB, bg: RGB): number {
  const l1 = relativeLuminance(rgb)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export default function ColorConverterTool() {
  const [hex, setHex] = useState("#6366f1")
  const [rgbStr, setRgbStr] = useState("99, 102, 241")
  const [hslStr, setHslStr] = useState("239, 84%, 67%")
  const [activeInput, setActiveInput] = useState<"hex" | "rgb" | "hsl">("hex")

  const color = useMemo(() => {
    let rgb: RGB | null = null

    if (activeInput === "hex") {
      rgb = hexToRgb(hex)
    } else if (activeInput === "rgb") {
      const parts = rgbStr.split(",").map(s => parseInt(s.trim()))
      if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
        rgb = { r: parts[0], g: parts[1], b: parts[2] }
      }
    } else if (activeInput === "hsl") {
      const parts = hslStr.replace(/%/g, "").split(",").map(s => parseFloat(s.trim()))
      if (parts.length === 3 && !parts.some(isNaN)) {
        rgb = hslToRgb({ h: parts[0], s: parts[1], l: parts[2] })
      }
    }

    if (!rgb) return null

    const hsl = rgbToHsl(rgb)
    const hexVal = rgbToHex(rgb)
    const whiteContrast = contrastRatio(rgb, { r: 255, g: 255, b: 255 })
    const blackContrast = contrastRatio(rgb, { r: 0, g: 0, b: 0 })

    return { rgb, hsl, hex: hexVal, whiteContrast, blackContrast }
  }, [hex, rgbStr, hslStr, activeInput])

  // Sync all fields when color changes from one input
  const updateFromHex = (val: string) => {
    setHex(val)
    setActiveInput("hex")
    const rgb = hexToRgb(val)
    if (rgb) {
      setRgbStr(`${rgb.r}, ${rgb.g}, ${rgb.b}`)
      const hsl = rgbToHsl(rgb)
      setHslStr(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`)
    }
  }

  const updateFromRgb = (val: string) => {
    setRgbStr(val)
    setActiveInput("rgb")
    const parts = val.split(",").map(s => parseInt(s.trim()))
    if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
      const rgb = { r: parts[0], g: parts[1], b: parts[2] }
      setHex(rgbToHex(rgb))
      const hsl = rgbToHsl(rgb)
      setHslStr(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`)
    }
  }

  const updateFromHsl = (val: string) => {
    setHslStr(val)
    setActiveInput("hsl")
    const parts = val.replace(/%/g, "").split(",").map(s => parseFloat(s.trim()))
    if (parts.length === 3 && !parts.some(isNaN)) {
      const rgb = hslToRgb({ h: parts[0], s: parts[1], l: parts[2] })
      setHex(rgbToHex(rgb))
      setRgbStr(`${rgb.r}, ${rgb.g}, ${rgb.b}`)
    }
  }

  const copyValue = async (val: string) => {
    await navigator.clipboard.writeText(val)
    toast.success("Copied!")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Color preview */}
      <div className="flex gap-4 items-stretch">
        <div
          className="w-32 h-32 rounded-lg border shadow-sm shrink-0"
          style={{ backgroundColor: color?.hex || "#000000" }}
        />
        <div className="flex flex-col justify-center gap-2">
          {color && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-16 h-8 rounded border flex items-center justify-center text-xs font-bold" style={{ backgroundColor: color.hex, color: color.blackContrast > color.whiteContrast ? "#000" : "#fff" }}>
                  Aa
                </div>
                <span className="text-xs text-muted-foreground">
                  vs white: {color.whiteContrast.toFixed(2)}:1 | vs black: {color.blackContrast.toFixed(2)}:1
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {color.whiteContrast >= 4.5 ? "✅" : "❌"} WCAG AA (white bg) •{" "}
                {color.blackContrast >= 4.5 ? "✅" : "❌"} WCAG AA (black bg)
              </div>
            </>
          )}
        </div>
      </div>

      {/* Input fields */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">HEX</label>
          <div className="flex gap-1">
            <input
              type="text"
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
              className="flex-1 px-3 py-2 text-sm font-mono border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="#6366f1"
            />
            <Button size="sm" variant="ghost" onClick={() => copyValue(color?.hex || hex)}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">RGB</label>
          <div className="flex gap-1">
            <input
              type="text"
              value={rgbStr}
              onChange={(e) => updateFromRgb(e.target.value)}
              className="flex-1 px-3 py-2 text-sm font-mono border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="99, 102, 241"
            />
            <Button size="sm" variant="ghost" onClick={() => copyValue(`rgb(${color ? `${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}` : rgbStr})`)}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">HSL</label>
          <div className="flex gap-1">
            <input
              type="text"
              value={hslStr}
              onChange={(e) => updateFromHsl(e.target.value)}
              className="flex-1 px-3 py-2 text-sm font-mono border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="239, 84%, 67%"
            />
            <Button size="sm" variant="ghost" onClick={() => copyValue(`hsl(${color ? `${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%` : hslStr})`)}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* CSS formats */}
      {color && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-4 py-2 text-sm font-medium border-b">CSS Values</div>
          <div className="divide-y">
            {[
              { label: "HEX", value: color.hex },
              { label: "RGB", value: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})` },
              { label: "HSL", value: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)` },
              { label: "RGBA", value: `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, 1)` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-muted-foreground w-16">{label}</span>
                <code className="text-sm font-mono flex-1">{value}</code>
                <Button size="sm" variant="ghost" onClick={() => copyValue(value)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color picker native */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Pick from system:</label>
        <input
          type="color"
          value={color?.hex || "#000000"}
          onChange={(e) => updateFromHex(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer border"
        />
      </div>
    </div>
  )
}
