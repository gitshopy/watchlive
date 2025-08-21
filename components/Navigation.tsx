"use client"

import { Button } from "@/components/ui/button"
import { Clock, Radio, AlarmClock, Timer, Flag } from "lucide-react"

interface NavigationProps {
  currentFeature: string
  onFeatureChange: (feature: string) => void
  themeStyles: any
}

export default function Navigation({ currentFeature, onFeatureChange, themeStyles }: NavigationProps) {
  const features = [
    { id: 'world-clock', name: 'World Clock', icon: Clock },
    { id: 'live-streams', name: 'Live Streams', icon: Radio },
    { id: 'alarm', name: 'Alarm', icon: AlarmClock },
    { id: 'timer', name: 'Timer', icon: Timer },
    { id: 'stopwatch', name: 'Stopwatch', icon: Flag }
  ]

  return (
    <nav className={`sticky top-0 z-40 backdrop-blur-md border-b ${themeStyles.sidebarBorder}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Clock className={`w-8 h-8 ${themeStyles.textColor} mr-3`} />
            <h1 className={`text-xl font-bold ${themeStyles.textColor}`}>WatchLive</h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Button
                  key={feature.id}
                  onClick={() => onFeatureChange(feature.id)}
                  variant={currentFeature === feature.id ? "default" : "ghost"}
                  className={`px-4 py-2 ${
                    currentFeature === feature.id
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : `${themeStyles.buttonBackground} ${themeStyles.textColor} hover:bg-white/10`
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {feature.name}
                </Button>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              className={`${themeStyles.buttonBackground} ${themeStyles.textColor}`}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Button
                  key={feature.id}
                  onClick={() => onFeatureChange(feature.id)}
                  variant={currentFeature === feature.id ? "default" : "ghost"}
                  className={`w-full justify-start px-3 py-2 ${
                    currentFeature === feature.id
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : `${themeStyles.buttonBackground} ${themeStyles.textColor} hover:bg-white/10`
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {feature.name}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
