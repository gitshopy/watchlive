import type React from "react"
import type { Metadata } from "next"
import { Orbitron } from "next/font/google"
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-orbitron",
  display: "swap",
})

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={orbitron.variable}>
      <head>
        <style>{`
html {
  font-family: ${orbitron.style.fontFamily};
  --font-sans: ${orbitron.variable};
  --font-mono: ${orbitron.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
