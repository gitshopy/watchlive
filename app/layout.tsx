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
  title: "Watch Live App",
  description: "Watch live streams from Twitch, YouTube, and Kick, world clock, sleep calculator, timer, stopwatch, and more.",

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
      <body>
        {children}
        
        {/* Footer with Disclaimers and Trademark Warnings */}
        <footer className="bg-gray-900 text-gray-300 py-8 px-4 mt-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Platform Disclaimers */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Platform Disclaimers</h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="font-medium text-blue-400 mb-1">Twitch</p>
                    <p className="text-xs">We are not affiliated with, endorsed by, or sponsored by Twitch Interactive, Inc. Twitch is a registered trademark of Twitch Interactive, Inc.</p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="font-medium text-red-400 mb-1">YouTube</p>
                    <p className="text-xs">We are not affiliated with, endorsed by, or sponsored by Google LLC or YouTube. YouTube is a registered trademark of Google LLC.</p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="font-medium text-green-400 mb-1">Kick</p>
                    <p className="text-xs">We are not affiliated with, endorsed by, or sponsored by Kick Streaming, Inc. Kick is a registered trademark of Kick Streaming, Inc.</p>
                  </div>
                </div>
              </div>

              {/* Legal Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Legal Information</h3>
                <div className="space-y-3 text-sm">
                  <p>This application aggregates and displays live streaming content from various platforms for informational and entertainment purposes only.</p>
                  <p>All trademarks, service marks, and trade names are the property of their respective owners.</p>
                  <p>We do not claim ownership of any content streamed through these platforms.</p>
                </div>
              </div>

              {/* Contact & Support */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">About</h3>
                <div className="space-y-3 text-sm">
                  <p>WatchLive is an independent streaming aggregator that helps users discover and watch live content across multiple platforms.</p>
                  <p>For support or questions, please contact us through our official channels.</p>
                  <div className="pt-4">
                    <p className="text-xs text-gray-500">
                      © {new Date().getFullYear()} WatchLive. All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Disclaimer Bar */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="text-center text-xs text-gray-500">
                <p className="mb-2">
                  <strong>IMPORTANT:</strong> This application is not affiliated with, endorsed by, or sponsored by any of the streaming platforms mentioned above. 
                  All content is streamed directly from the respective platforms' official embed players.
                </p>
                <p>
                  By using this application, you acknowledge that you are accessing content through third-party platforms 
                  and agree to comply with their respective terms of service and community guidelines.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
