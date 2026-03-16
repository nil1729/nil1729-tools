"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm border-b" : "bg-transparent"
      }`}
    >
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-lg">
            Nilanjan Deb / Tools
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="https://nilanjandeb.com"
              className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              ← nilanjandeb.com
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="w-9 px-0"
            >
              {mounted && (theme === "light"
                ? <Moon className="h-4 w-4" />
                : <Sun className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
