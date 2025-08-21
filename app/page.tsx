"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import Navigation from "@/components/Navigation"
import WorldClock from "@/components/WorldClock"
import LiveStreams from "@/components/LiveStreams"
import Alarm from "@/components/Alarm"
import Timer from "@/components/Timer"
import Stopwatch from "@/components/Stopwatch"

export default function Home() {
  const { theme } = useTheme()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentFeature, setCurrentFeature] = useState('world-clock')

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Theme styles
  const themeStyles = {
    textColor: theme === 'dark' ? 'text-white' : 'text-gray-900',
    buttonBackground: theme === 'dark' ? 'bg-white/10' : 'bg-gray-100/80',
    sidebarBorder: theme === 'dark' ? 'border-white/20' : 'border-gray-200',
  }

  // Glassmorphism style function
  const getGlassStyle = (): React.CSSProperties => ({
    background: theme === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    border: theme === 'dark' 
      ? '1px solid rgba(255, 255, 255, 0.1)' 
      : '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: theme === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
  })

  const renderCurrentFeature = () => {
    switch (currentFeature) {
      case 'world-clock':
        return <WorldClock currentTime={currentTime} getGlassStyle={getGlassStyle} themeStyles={themeStyles} />
      case 'live-streams':
        return <LiveStreams getGlassStyle={getGlassStyle} themeStyles={themeStyles} />
      case 'alarm':
        return <Alarm getGlassStyle={getGlassStyle} themeStyles={themeStyles} />
      case 'timer':
        return <Timer getGlassStyle={getGlassStyle} themeStyles={themeStyles} />
      case 'stopwatch':
        return <Stopwatch getGlassStyle={getGlassStyle} themeStyles={themeStyles} />
      default:
        return <WorldClock currentTime={currentTime} getGlassStyle={getGlassStyle} themeStyles={themeStyles} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-black">
      <Navigation 
        currentFeature={currentFeature} 
        onFeatureChange={setCurrentFeature} 
        themeStyles={themeStyles} 
      />
      
      <main className="container mx-auto px-4 py-8">
        {renderCurrentFeature()}
      </main>
    </div>
  )
}
