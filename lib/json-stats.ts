export interface JsonStats {
  bytes: number
  keys: number
  depth: number
  objects: number
  arrays: number
}

export function computeJsonStats(input: string): JsonStats | null {
  try {
    const parsed = JSON.parse(input)
    const stats: JsonStats = {
      bytes: new TextEncoder().encode(input).length,
      keys: 0,
      depth: 0,
      objects: 0,
      arrays: 0,
    }

    function walk(value: unknown, currentDepth: number) {
      if (currentDepth > stats.depth) {
        stats.depth = currentDepth
      }

      if (value !== null && typeof value === "object") {
        if (Array.isArray(value)) {
          stats.arrays++
          for (const item of value) {
            walk(item, currentDepth + 1)
          }
        } else {
          stats.objects++
          const keys = Object.keys(value as Record<string, unknown>)
          stats.keys += keys.length
          for (const key of keys) {
            walk((value as Record<string, unknown>)[key], currentDepth + 1)
          }
        }
      }
    }

    walk(parsed, 0)
    return stats
  } catch {
    return null
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
