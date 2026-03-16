"use client"

import { Button } from "@/components/ui/button"

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container px-4 mx-auto py-24 flex flex-col items-center text-center gap-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground">An unexpected error occurred.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
