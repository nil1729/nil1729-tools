import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import localFont from "next/font/local"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const monaspaceneon = localFont({
  src: "../public/fonts/MonaspaceNeonVar.woff2",
  variable: "--font-monaspace",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://tools.nilanjandeb.com"),
  title: {
    default: "Developer Tools — Nilanjan Deb",
    template: "%s | Nilanjan Deb Tools",
  },
  description:
    "Clean, ad-free developer tools by Nilanjan Deb. JSON linter, formatter, and more — no clutter, no distractions.",
  keywords: [
    "developer tools",
    "JSON linter",
    "JSON formatter",
    "JSON validator",
    "online JSON tool",
    "free developer tools",
    "Nilanjan Deb",
    "web tools",
    "code formatter",
  ],
  authors: [{ name: "Nilanjan Deb", url: "https://nilanjandeb.com" }],
  creator: "Nilanjan Deb",
  publisher: "Nilanjan Deb",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tools.nilanjandeb.com",
    siteName: "Nilanjan Deb Tools",
    title: "Developer Tools — Nilanjan Deb",
    description: "Clean, ad-free developer tools by Nilanjan Deb. No clutter, no distractions.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Nilanjan Deb Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Tools — Nilanjan Deb",
    description: "Clean, ad-free developer tools by Nilanjan Deb. No clutter, no distractions.",
    images: ["/og-image.jpg"],
    creator: "@nil1729",
  },
  alternates: { canonical: "https://tools.nilanjandeb.com" },
  category: "Technology",
  classification: "Developer Tools",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://tools.nilanjandeb.com/#website",
      url: "https://tools.nilanjandeb.com",
      name: "Nilanjan Deb Tools",
      description: "Clean, ad-free developer tools by Nilanjan Deb.",
      publisher: { "@id": "https://nilanjandeb.com/#person" },
    },
    {
      "@type": "WebPage",
      "@id": "https://tools.nilanjandeb.com/#webpage",
      url: "https://tools.nilanjandeb.com",
      name: "Developer Tools — Nilanjan Deb",
      isPartOf: { "@id": "https://tools.nilanjandeb.com/#website" },
      about: { "@id": "https://nilanjandeb.com/#person" },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head suppressHydrationWarning>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        {/* JSON-LD structured data — static hardcoded object, no XSS risk */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {/* Console easter egg — static string literal, no XSS risk */}
        <script dangerouslySetInnerHTML={{ __html: `console.log('%c nil1729/tools ', 'background: #0a0a0a; color: white; padding: 4px 8px; border-radius: 4px; font-size: 14px; font-weight: bold;');` }} />
      </head>
      <body className={`${geistSans.variable} ${monaspaceneon.variable} font-sans min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="nilanjan-theme">
          <Navigation />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
          <Toaster richColors closeButton />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
