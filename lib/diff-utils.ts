export interface DiffLine {
  type: "equal" | "added" | "removed"
  content: string
  leftLineNo?: number
  rightLineNo?: number
}

/**
 * Simple line-based diff using the LCS (Longest Common Subsequence) approach.
 * Good enough for a dev tool — O(n*m) but fast for typical text sizes.
 */
export function computeDiff(original: string, modified: string): DiffLine[] {
  const oldLines = original.split("\n")
  const newLines = modified.split("\n")

  // Build LCS table
  const m = oldLines.length
  const n = newLines.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to find diff
  const result: DiffLine[] = []
  let i = m
  let j = n

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({ type: "equal", content: oldLines[i - 1], leftLineNo: i, rightLineNo: j })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "added", content: newLines[j - 1], rightLineNo: j })
      j--
    } else if (i > 0) {
      result.unshift({ type: "removed", content: oldLines[i - 1], leftLineNo: i })
      i--
    }
  }

  return result
}

export interface DiffStats {
  additions: number
  deletions: number
  unchanged: number
}

export function getDiffStats(lines: DiffLine[]): DiffStats {
  return {
    additions: lines.filter((l) => l.type === "added").length,
    deletions: lines.filter((l) => l.type === "removed").length,
    unchanged: lines.filter((l) => l.type === "equal").length,
  }
}
