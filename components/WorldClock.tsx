"use client"

import { useState, useEffect } from "react"
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

interface CustomTimezone {
  name: string
  timezone: string
  abbreviation: string
}

// Detect dark mode by reading the <html> class ("dark") and reacting to changes
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const root = document.documentElement
    const update = () => setIsDark(root.classList.contains("dark"))
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])
  return isDark
}

export default function WorldClock({ currentTime, getGlassStyle, themeStyles }: WorldClockProps) {
  const isDark = useIsDarkMode()

  const [availableTimezones, setAvailableTimezones] = useState<Timezone[]>([
    { name: "New York", value: "America/New_York" },
    { name: "London", value: "Europe/London" },
    { name: "Tokyo", value: "Asia/Tokyo" },
    { name: "Sydney", value: "Australia/Sydney" },
    { name: "Paris", value: "Europe/Paris" },
    { name: "Berlin", value: "Europe/Berlin" },
    { name: "Moscow", value: "Europe/Moscow" },
    { name: "Dubai", value: "Asia/Dubai" },
    { name: "Los Angeles", value: "America/Los_Angeles" },
    { name: "Singapore", value: "Asia/Singapore" },
  ])
  const [customTimezones, setCustomTimezones] = useState<CustomTimezone[]>([])
  const [newTimezone, setNewTimezone] = useState("")
  const [newTimezoneName, setNewTimezoneName] = useState("")
  const [timezoneSearch, setTimezoneSearch] = useState("")
  const [showAddTimezone, setShowAddTimezone] = useState(false)

  const [fullscreenTimebox, setFullscreenTimebox] = useState<string | null>(null)
  const [timeboxSize, setTimeboxSize] = useState<"normal" | "large">("normal")

  const addTimezone = () => {
    if (
      newTimezone &&
      newTimezoneName &&
      !availableTimezones.find((tz) => tz.value === newTimezone)
    ) {
      setAvailableTimezones([
        ...availableTimezones,
        { name: newTimezoneName, value: newTimezone },
      ])
      setNewTimezone("")
      setNewTimezoneName("")
      toast({
        title: "Timezone Added",
        description: `${newTimezoneName} has been added to your timezone list.`,
      })
    }
  }

  // Add custom timezone
  const addCustomTimezone = (timezone: {
    name: string
    timezone: string
    abbreviation: string
  }) => {
    const allAvailableTimezones = [
      ...availableTimezones.map((tz) => ({
        name: tz.name,
        timezone: tz.value,
        abbreviation: "",
      })),
      ...customTimezones,
    ]

    const exists = allAvailableTimezones.some(
      (tz) => tz.timezone === timezone.timezone
    )

    if (!exists) {
      setCustomTimezones((prev) => [...prev, timezone])
      toast({
        title: "Timezone Added!",
        description: `${timezone.name} has been added to your timezone list.`,
      })
    } else {
      toast({
        title: "Timezone Already Exists",
        description: `${timezone.name} is already in your timezone list.`,
        variant: "destructive",
      })
    }
    setTimezoneSearch("")
    setShowAddTimezone(false)
  }

  const removeTimezone = (timezoneValue: string) => {
    setAvailableTimezones(
      availableTimezones.filter((tz) => tz.value !== timezoneValue)
    )
    setCustomTimezones(
      customTimezones.filter((tz) => tz.timezone !== timezoneValue)
    )
    toast({
      title: "Timezone Removed",
      description: "Timezone has been removed from your list.",
    })
  }

  const toggleFullscreen = (timeboxId: string) => {
    setFullscreenTimebox((prev) => (prev === timeboxId ? null : timeboxId))
  }

  const resizeTimebox = () => {
    setTimeboxSize(timeboxSize === "normal" ? "large" : "normal")
  }

  const renderTimebox = (
    id: string,
    title: string,
    time: string,
    subtitle: string
  ) => {
    const isFullscreen = fullscreenTimebox === id

    // When fullscreen, force a solid bg based on theme and invert text for contrast
    const fullscreenBgClass = isFullscreen ? (isDark ? "bg-black" : "bg-white") : ""
    const fullscreenTextColor = isFullscreen ? (isDark ? "text-white" : "text-black") : themeStyles.textColor

    return (
      <div
        className={`transition-all duration-300 p-6 ${
          isFullscreen
            ? `fixed inset-0 z-50 ${fullscreenBgClass} backdrop-blur-md flex items-center justify-center`
            : ""
        }`}
        style={isFullscreen ? {} : getGlassStyle()}
      >
        <div className="text-center relative w-full">
          <div
            className={`flex justify-between items-center mb-4 ${
              isFullscreen ? "absolute top-4 left-4 right-4" : ""
            }`}
          >
            <h3 className={`text-lg font-semibold ${fullscreenTextColor}`}>
              {title}
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={resizeTimebox}
                size="sm"
                className={`p-1 ${themeStyles.buttonBackground} ${fullscreenTextColor}`}
              >
                {timeboxSize === "normal" ? (
                  <Maximize2 className={`w-4 h-4 ${fullscreenTextColor}`} />
                ) : (
                  <Minimize2 className={`w-4 h-4 ${fullscreenTextColor}`} />
                )}
              </Button>
              <Button
                onClick={() => toggleFullscreen(id)}
                size="sm"
                className={`p-1 ${themeStyles.buttonBackground} ${fullscreenTextColor}`}
              >
                {isFullscreen ? (
                  <Minimize2 className={`w-4 h-4 ${fullscreenTextColor}`} />
                ) : (
                  <Maximize2 className={`w-4 h-4 ${fullscreenTextColor}`} />
                )}
              </Button>
            </div>
          </div>

          <div
            className={`font-mono font-bold ${fullscreenTextColor} ${
              isFullscreen
                ? "text-[10rem] leading-none"
                : timeboxSize === "large"
                ? "text-6xl"
                : "text-4xl"
            }`}
          >
            {time}
          </div>

          <div className={`text-sm ${fullscreenTextColor} opacity-70 mt-2`}>
            {subtitle}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Add New Timezone */}
      <div className="mb-6 p-4" style={getGlassStyle()}>
        <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textColor}`}>
          Add New Timezone
        </h3>
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

      {/* Timeboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderTimebox(
          "current",
          "Current Time",
          currentTime.toLocaleTimeString(),
          currentTime.toLocaleDateString()
        )}
        {renderTimebox(
          "local",
          "Local Time",
          currentTime.toLocaleTimeString(),
          Intl.DateTimeFormat().resolvedOptions().timeZone
        )}
        {renderTimebox(
          "utc",
          "UTC Time",
          currentTime.toUTCString().split(" ")[4],
          "Coordinated Universal Time"
        )}
      </div>

      {/* Timezone List */}
      <div className="mt-8 p-6" style={getGlassStyle()}>
        <h3 className={`text-xl font-semibold mb-4 ${themeStyles.textColor}`}>
          Popular Timezones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...availableTimezones, ...customTimezones].map((tz) => (
            <div
              key={tz.name}
              className={`p-4 rounded-lg ${themeStyles.buttonBackground} border border-white/10 relative group`}
            >
              <div className={`font-semibold ${themeStyles.textColor}`}>
                {tz.name}
              </div>
              <div className={`text-sm ${themeStyles.textColor} opacity-70`}>
                {new Date().toLocaleTimeString("en-US", {
                  timeZone: "value" in tz ? tz.value : tz.timezone,
                })}
              </div>
              <Button
                onClick={() =>
                  removeTimezone("value" in tz ? tz.value : tz.timezone)
                }
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
