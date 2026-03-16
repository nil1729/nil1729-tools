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
}

export default function InputPanel({ value, onChange }: InputPanelProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="h-full overflow-auto">
        <textarea
          className="w-full h-full min-h-[40vh] p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
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
        style={{ height: "100%", fontSize: "13px" }}
        className="h-full font-mono"
      />
    </div>
  )
}
