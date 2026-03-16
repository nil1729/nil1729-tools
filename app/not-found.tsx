import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container px-4 mx-auto py-24 flex flex-col items-center text-center gap-4">
      <h1 className="text-2xl font-bold">Page Not Found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Button asChild>
        <Link href="/">Back to Tools</Link>
      </Button>
    </div>
  )
}
