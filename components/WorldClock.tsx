"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface WorldClockProps {
  currentTime: Date
  getGlassStyle: () => React.CSSProperties
  themeStyles: any
}

interface Timezone {
  name: string
  value: string
}

export default function WorldClock({ currentTime, getGlassStyle, themeStyles }: WorldClockProps) {
  // Timezone management
  const [availableTimezones, setAvailableTimezones] = useState<Timezone[]>([
    { name: 'New York', value: 'America/New_York' },
    { name: 'London', value: 'Europe/London' },
    { name: 'Tokyo', value: 'Asia/Tokyo' },
    { name: 'Sydney', value: 'Australia/Sydney' },
    { name: 'Paris', value: 'Europe/Paris' },
    { name: 'Berlin', value: 'Europe/Berlin' },
    { name: 'Moscow', value: 'Europe/Moscow' },
    { name: 'Dubai', value: 'Asia/Dubai' },
    { name: 'Los Angeles', value: 'America/Los_Angeles' },
    { name: 'Singapore', value: 'Asia/Singapore' }
  ])
  const [newTimezone, setNewTimezone] = useState('')
  const [newTimezoneName, setNewTimezoneName] = useState('')
  const [fullscreenTimebox, setFullscreenTimebox] = useState<string | null>(null)
  const [timeboxSize, setTimeboxSize] = useState<'normal' | 'large' | 'fullscreen'>('normal')

  // Timezone management functions
  const addTimezone = () => {
    if (newTimezone && newTimezoneName && !availableTimezones.find(tz => tz.value === newTimezone)) {
      setAvailableTimezones([...availableTimezones, { name: newTimezoneName, value: newTimezone }])
      setNewTimezone('')
      setNewTimezoneName('')
      toast({
        title: "Timezone Added",
        description: `${newTimezoneName} has been added to your timezone list.`,
      })
    }
  }

  const removeTimezone = (timezoneValue: string) => {
    setAvailableTimezones(availableTimezones.filter(tz => tz.value !== timezoneValue))
    toast({
      title: "Timezone Removed",
      description: "Timezone has been removed from your list.",
    })
  }

  const toggleFullscreen = (timeboxId: string) => {
    if (fullscreenTimebox === timeboxId) {
      setFullscreenTimebox(null)
      setTimeboxSize('normal')
    } else {
      setFullscreenTimebox(timeboxId)
      setTimeboxSize('fullscreen')
    }
  }

  const resizeTimebox = (size: 'normal' | 'large' | 'fullscreen') => {
    setTimeboxSize(size)
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Add New Timezone */}
      <div className="mb-6 p-4" style={getGlassStyle()}>
        <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textColor}`}>Add New Timezone</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Timezone Name (e.g., Mumbai, Rio)"
            value={newTimezoneName}
            onChange={(e) => setNewTimezoneName(e.target.value)}
            className={`flex-1 px-4 py-2 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
          />
          <select
            value={newTimezone}
            onChange={(e) => setNewTimezone(e.target.value)}
            className={`px-4 py-2 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
          >
            <option value="">Select Timezone</option>
            <option value="Asia/Kolkata">Asia/Kolkata (India)</option>
            <option value="America/Sao_Paulo">America/Sao_Paulo (Brazil)</option>
            <option value="Asia/Shanghai">Asia/Shanghai (China)</option>
            <option value="Europe/Rome">Europe/Rome (Italy)</option>
            <option value="Africa/Cairo">Africa/Cairo (Egypt)</option>
            <option value="Asia/Seoul">Asia/Seoul (South Korea)</option>
            <option value="America/Toronto">America/Toronto (Canada)</option>
            <option value="Europe/Amsterdam">Europe/Amsterdam (Netherlands)</option>
            <option value="Asia/Jakarta">Asia/Jakarta (Indonesia)</option>
            <option value="America/Mexico_City">America/Mexico_City (Mexico)</option>
          </select>
          <Button
            onClick={addTimezone}
            disabled={!newTimezone || !newTimezoneName}
            className={`px-6 py-2 ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 disabled:opacity-50`}
          >
            Add
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Current Time */}
        <div className={`p-6 transition-all duration-300 ${fullscreenTimebox === 'current' ? 'fixed inset-4 z-50 bg-black/95 backdrop-blur-md' : ''}`} style={fullscreenTimebox === 'current' ? {} : getGlassStyle()}>
          <div className="text-center relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${themeStyles.textColor}`}>Current Time</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => resizeTimebox(timeboxSize === 'normal' ? 'large' : 'normal')}
                  size="sm"
                  className={`p-1 ${themeStyles.buttonBackground} ${themeStyles.textColor}`}
                >
                  {timeboxSize === 'normal' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={() => toggleFullscreen('current')}
                  size="sm"
                  className={`p-1 ${themeStyles.buttonBackground} ${themeStyles.textColor}`}
                >
                  {fullscreenTimebox === 'current' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className={`font-mono font-bold ${themeStyles.textColor} ${timeboxSize === 'large' ? 'text-6xl' : 'text-4xl'}`}>
              {currentTime.toLocaleTimeString()}
            </div>
            <div className={`text-sm ${themeStyles.textColor} opacity-70 mt-2`}>
              {currentTime.toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Local Timezone */}
        <div className={`p-6 transition-all duration-300 ${fullscreenTimebox === 'local' ? 'fixed inset-4 z-50 bg-black/95 backdrop-blur-md' : ''}`} style={fullscreenTimebox === 'local' ? {} : getGlassStyle()}>
          <div className="text-center relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${themeStyles.textColor}`}>Local Time</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => resizeTimebox(timeboxSize === 'normal' ? 'large' : 'normal')}
                  size="sm"
                  className={`p-1 ${themeStyles.buttonBackground} ${themeStyles.textColor}`}
                >
                  {timeboxSize === 'normal' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={() => toggleFullscreen('local')}
                  size="sm"
                  className={`p-1 ${themeStyles.buttonBackground} ${themeStyles.textColor}`}
                >
                  {fullscreenTimebox === 'local' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className={`font-mono font-bold ${themeStyles.textColor} ${timeboxSize === 'large' ? 'text-6xl' : 'text-4xl'}`}>
              {currentTime.toLocaleTimeString()}
            </div>
            <div className={`text-sm ${themeStyles.textColor} opacity-70 mt-2`}>
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </div>
          </div>
        </div>

        {/* UTC Time */}
        <div className={`p-6 transition-all duration-300 ${fullscreenTimebox === 'utc' ? 'fixed inset-4 z-50 bg-black/95 backdrop-blur-md' : ''}`} style={fullscreenTimebox === 'utc' ? {} : getGlassStyle()}>
          <div className="text-center relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${themeStyles.textColor}`}>UTC Time</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => resizeTimebox(timeboxSize === 'normal' ? 'large' : 'normal')}
                  size="sm"
                  className={`p-1 ${themeStyles.buttonBackground} ${themeStyles.textColor}`}
                >
                  {timeboxSize === 'normal' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={() => toggleFullscreen('utc')}
                  size="sm"
                  className={`p-1 ${themeStyles.buttonBackground} ${themeStyles.textColor}`}
                >
                  {fullscreenTimebox === 'utc' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className={`font-mono font-bold ${themeStyles.textColor} ${timeboxSize === 'large' ? 'text-6xl' : 'text-4xl'}`}>
              {currentTime.toUTCString().split(' ')[4]}
            </div>
            <div className={`text-sm ${themeStyles.textColor} opacity-70 mt-2`}>
              Coordinated Universal Time
            </div>
          </div>
        </div>
      </div>

      {/* Timezone List */}
      <div className="mt-8 p-6" style={getGlassStyle()}>
        <h3 className={`text-xl font-semibold mb-4 ${themeStyles.textColor}`}>Popular Timezones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTimezones.map((tz) => (
            <div key={tz.name} className={`p-4 rounded-lg ${themeStyles.buttonBackground} border border-white/10 relative group`}>
              <div className={`font-semibold ${themeStyles.textColor}`}>{tz.name}</div>
              <div className={`text-sm ${themeStyles.textColor} opacity-70`}>
                {new Date().toLocaleTimeString('en-US', { timeZone: tz.value })}
              </div>
              <Button
                onClick={() => removeTimezone(tz.value)}
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500/20 hover:bg-red-500/40 text-red-400"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
