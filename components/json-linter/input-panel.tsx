"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import CodeMirror from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import { githubLight, githubDark } from "@uiw/codemirror-theme-github"

const PLACEHOLDER = `{
  "name": "Nilanjan",
  "role": "Data Engineer",
  "tools": ["Spark", "Kafka", "Iceberg"]
}`

interface InputPanelProps {
  value: string
  onChange: (value: string) => void
  fontSize: number
}

export default function InputPanel({ value, onChange, fontSize }: InputPanelProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="h-full overflow-auto">
        <textarea
          className="w-full h-full min-h-[40vh] p-4 font-mono bg-transparent resize-none focus:outline-none"
          style={{ fontSize: `${fontSize}px` }}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={PLACEHOLDER}
        />
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[json()]}
        theme={resolvedTheme === "dark" ? githubDark : githubLight}
        placeholder={PLACEHOLDER}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          foldGutter: false,
          autocompletion: false,
          bracketMatching: false,
          closeBrackets: false,
        }}
        style={{ height: "100%", fontSize: `${fontSize}px` }}
        className="h-full font-mono"
      />
    </div>
  )
}
