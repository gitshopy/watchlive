"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, X, Search, Clock, Globe, Settings } from "lucide-react"
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

// Comprehensive world timezone data
const WORLD_TIMEZONES = [
  // North America
  { name: "New York", timezone: "America/New_York", country: "USA", flag: "🇺🇸" },
  { name: "Los Angeles", timezone: "America/Los_Angeles", country: "USA", flag: "🇺🇸" },
  { name: "Chicago", timezone: "America/Chicago", country: "USA", flag: "🇺🇸" },
  { name: "Toronto", timezone: "America/Toronto", country: "Canada", flag: "🇨🇦" },
  { name: "Vancouver", timezone: "America/Vancouver", country: "Canada", flag: "🇨🇦" },
  { name: "Mexico City", timezone: "America/Mexico_City", country: "Mexico", flag: "🇲🇽" },
  
  // Europe
  { name: "London", timezone: "Europe/London", country: "UK", flag: "🇬🇧" },
  { name: "Paris", timezone: "Europe/Paris", country: "France", flag: "🇫🇷" },
  { name: "Berlin", timezone: "Europe/Berlin", country: "Germany", flag: "🇩🇪" },
  { name: "Rome", timezone: "Europe/Rome", country: "Italy", flag: "🇮🇹" },
  { name: "Madrid", timezone: "Europe/Madrid", country: "Spain", flag: "🇪🇸" },
  { name: "Amsterdam", timezone: "Europe/Amsterdam", country: "Netherlands", flag: "🇳🇱" },
  { name: "Moscow", timezone: "Europe/Moscow", country: "Russia", flag: "🇷🇺" },
  { name: "Vienna", timezone: "Europe/Vienna", country: "Austria", flag: "🇦🇹" },
  { name: "Prague", timezone: "Europe/Prague", country: "Czech Republic", flag: "🇨🇿" },
  { name: "Warsaw", timezone: "Europe/Warsaw", country: "Poland", flag: "🇵🇱" },
  { name: "Budapest", timezone: "Europe/Budapest", country: "Hungary", flag: "🇭🇺" },
  { name: "Bucharest", timezone: "Europe/Bucharest", country: "Romania", flag: "🇷🇴" },
  { name: "Sofia", timezone: "Europe/Sofia", country: "Bulgaria", flag: "🇧🇬" },
  { name: "Belgrade", timezone: "Europe/Belgrade", country: "Serbia", flag: "🇷🇸" },
  { name: "Zagreb", timezone: "Europe/Zagreb", country: "Croatia", flag: "🇭🇷" },
  { name: "Ljubljana", timezone: "Europe/Ljubljana", country: "Slovenia", flag: "🇸🇮" },
  { name: "Bratislava", timezone: "Europe/Bratislava", country: "Slovakia", flag: "🇸🇰" },
  { name: "Vilnius", timezone: "Europe/Vilnius", country: "Lithuania", flag: "🇱🇹" },
  { name: "Riga", timezone: "Europe/Riga", country: "Latvia", flag: "🇱🇻" },
  { name: "Tallinn", timezone: "Europe/Tallinn", country: "Estonia", flag: "🇪🇪" },
  { name: "Helsinki", timezone: "Europe/Helsinki", country: "Finland", flag: "🇫🇮" },
  { name: "Stockholm", timezone: "Europe/Stockholm", country: "Sweden", flag: "🇸🇪" },
  { name: "Oslo", timezone: "Europe/Oslo", country: "Norway", flag: "🇳🇴" },
  { name: "Copenhagen", timezone: "Europe/Copenhagen", country: "Denmark", flag: "🇩🇰" },
  { name: "Reykjavik", timezone: "Atlantic/Reykjavik", country: "Iceland", flag: "🇮🇸" },
  { name: "Dublin", timezone: "Europe/Dublin", country: "Ireland", flag: "🇮🇪" },
  { name: "Edinburgh", timezone: "Europe/London", country: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { name: "Cardiff", timezone: "Europe/London", country: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { name: "Belfast", timezone: "Europe/London", country: "Northern Ireland", flag: "🏴󠁧󠁢󠁮󠁩󠁲󠁿" },
  { name: "Brussels", timezone: "Europe/Brussels", country: "Belgium", flag: "🇧🇪" },
  { name: "Luxembourg", timezone: "Europe/Luxembourg", country: "Luxembourg", flag: "🇱🇺" },
  { name: "Bern", timezone: "Europe/Zurich", country: "Switzerland", flag: "🇨🇭" },
  { name: "Zurich", timezone: "Europe/Zurich", country: "Switzerland", flag: "🇨🇭" },
  { name: "Geneva", timezone: "Europe/Zurich", country: "Switzerland", flag: "🇨🇭" },
  { name: "Monaco", timezone: "Europe/Monaco", country: "Monaco", flag: "🇲🇨" },
  { name: "Vatican City", timezone: "Europe/Rome", country: "Vatican", flag: "🇻🇦" },
  { name: "San Marino", timezone: "Europe/Rome", country: "San Marino", flag: "🇸🇲" },
  { name: "Andorra", timezone: "Europe/Madrid", country: "Andorra", flag: "🇦🇩" },
  { name: "Gibraltar", timezone: "Europe/Gibraltar", country: "Gibraltar", flag: "🇬🇮" },
  { name: "Malta", timezone: "Europe/Malta", country: "Malta", flag: "🇲🇹" },
  { name: "Cyprus", timezone: "Asia/Nicosia", country: "Cyprus", flag: "🇨🇾" },
  { name: "Greece", timezone: "Europe/Athens", country: "Greece", flag: "🇬🇷" },
  { name: "Albania", timezone: "Europe/Tirane", country: "Albania", flag: "🇦🇱" },
  { name: "North Macedonia", timezone: "Europe/Skopje", country: "North Macedonia", flag: "🇲🇰" },
  { name: "Kosovo", timezone: "Europe/Belgrade", country: "Kosovo", flag: "🇽🇰" },
  { name: "Montenegro", timezone: "Europe/Podgorica", country: "Montenegro", flag: "🇲🇪" },
  { name: "Bosnia", timezone: "Europe/Sarajevo", country: "Bosnia", flag: "🇧🇦" },
  { name: "Moldova", timezone: "Europe/Chisinau", country: "Moldova", flag: "🇲🇩" },
  { name: "Ukraine", timezone: "Europe/Kiev", country: "Ukraine", flag: "🇺🇦" },
  { name: "Belarus", timezone: "Europe/Minsk", country: "Belarus", flag: "🇧🇾" },
  { name: "Latvia", timezone: "Europe/Riga", country: "Latvia", flag: "🇱🇻" },
  { name: "Estonia", timezone: "Europe/Tallinn", country: "Estonia", flag: "🇪🇪" },
  
  // Asia
  { name: "Tokyo", timezone: "Asia/Tokyo", country: "Japan", flag: "🇯🇵" },
  { name: "Beijing", timezone: "Asia/Shanghai", country: "China", flag: "🇨🇳" },
  { name: "Seoul", timezone: "Asia/Seoul", country: "South Korea", flag: "🇰🇷" },
  { name: "Singapore", timezone: "Asia/Singapore", country: "Singapore", flag: "🇸🇬" },
  { name: "Dubai", timezone: "Asia/Dubai", country: "UAE", flag: "🇦🇪" },
  { name: "Mumbai", timezone: "Asia/Kolkata", country: "India", flag: "🇮🇳" },
  { name: "Jakarta", timezone: "Asia/Jakarta", country: "Indonesia", flag: "🇮🇩" },
  { name: "Bangkok", timezone: "Asia/Bangkok", country: "Thailand", flag: "🇹🇭" },
  { name: "Manila", timezone: "Asia/Manila", country: "Philippines", flag: "🇵🇭" },
  { name: "Kuala Lumpur", timezone: "Asia/Kuala_Lumpur", country: "Malaysia", flag: "🇲🇾" },
  { name: "Hanoi", timezone: "Asia/Ho_Chi_Minh", country: "Vietnam", flag: "🇻🇳" },
  { name: "Phnom Penh", timezone: "Asia/Phnom_Penh", country: "Cambodia", flag: "🇰🇭" },
  { name: "Yangon", timezone: "Asia/Yangon", country: "Myanmar", flag: "🇲🇲" },
  { name: "Vientiane", timezone: "Asia/Vientiane", country: "Laos", flag: "🇱🇦" },
  { name: "Dhaka", timezone: "Asia/Dhaka", country: "Bangladesh", flag: "🇧🇩" },
  { name: "Kathmandu", timezone: "Asia/Kathmandu", country: "Nepal", flag: "🇳🇵" },
  { name: "Colombo", timezone: "Asia/Colombo", country: "Sri Lanka", flag: "🇱🇰" },
  { name: "Male", timezone: "Indian/Maldives", country: "Maldives", flag: "🇲🇻" },
  { name: "Thimphu", timezone: "Asia/Thimphu", country: "Bhutan", flag: "🇧🇹" },
  { name: "Ulaanbaatar", timezone: "Asia/Ulaanbaatar", country: "Mongolia", flag: "🇲🇳" },
  { name: "Pyongyang", timezone: "Asia/Pyongyang", country: "North Korea", flag: "🇰🇵" },
  { name: "Astana", timezone: "Asia/Almaty", country: "Kazakhstan", flag: "🇰🇿" },
  { name: "Tashkent", timezone: "Asia/Tashkent", country: "Uzbekistan", flag: "🇺🇿" },
  { name: "Bishkek", timezone: "Asia/Bishkek", country: "Kyrgyzstan", flag: "🇰🇬" },
  { name: "Dushanbe", timezone: "Asia/Dushanbe", country: "Tajikistan", flag: "🇹🇯" },
  { name: "Ashgabat", timezone: "Asia/Ashgabat", country: "Turkmenistan", flag: "🇹🇲" },
  { name: "Tehran", timezone: "Asia/Tehran", country: "Iran", flag: "🇮🇷" },
  { name: "Baghdad", timezone: "Asia/Baghdad", country: "Iraq", flag: "🇮🇶" },
  { name: "Riyadh", timezone: "Asia/Riyadh", country: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Kuwait City", timezone: "Asia/Kuwait", country: "Kuwait", flag: "🇰🇼" },
  { name: "Doha", timezone: "Asia/Qatar", country: "Qatar", flag: "🇶🇦" },
  { name: "Manama", timezone: "Asia/Bahrain", country: "Bahrain", flag: "🇧🇭" },
  { name: "Muscat", timezone: "Asia/Muscat", country: "Oman", flag: "🇴🇲" },
  { name: "Sanaa", timezone: "Asia/Aden", country: "Yemen", flag: "🇾🇪" },
  { name: "Amman", timezone: "Asia/Amman", country: "Jordan", flag: "🇯🇴" },
  { name: "Beirut", timezone: "Asia/Beirut", country: "Lebanon", flag: "🇱🇧" },
  { name: "Damascus", timezone: "Asia/Damascus", country: "Syria", flag: "🇸🇾" },
  { name: "Jerusalem", timezone: "Asia/Jerusalem", country: "Israel", flag: "🇮🇱" },
  { name: "Gaza", timezone: "Asia/Gaza", country: "Palestine", flag: "🇵🇸" },
  { name: "Ankara", timezone: "Europe/Istanbul", country: "Turkey", flag: "🇹🇷" },
  { name: "Baku", timezone: "Asia/Baku", country: "Azerbaijan", flag: "🇦🇿" },
  { name: "Yerevan", timezone: "Asia/Yerevan", country: "Armenia", flag: "🇦🇲" },
  { name: "Tbilisi", timezone: "Asia/Tbilisi", country: "Georgia", flag: "🇬🇪" },
  
  // Australia & Oceania
  { name: "Sydney", timezone: "Australia/Sydney", country: "Australia", flag: "🇦🇺" },
  { name: "Melbourne", timezone: "Australia/Melbourne", country: "Australia", flag: "🇦🇺" },
  { name: "Auckland", timezone: "Pacific/Auckland", country: "New Zealand", flag: "🇳🇿" },
  
  // South America
  { name: "São Paulo", timezone: "America/Sao_Paulo", country: "Brazil", flag: "🇧🇷" },
  { name: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", country: "Argentina", flag: "🇦🇷" },
  { name: "Lima", timezone: "America/Lima", country: "Peru", flag: "🇵🇪" },
  
  // Africa
  { name: "Cairo", timezone: "Africa/Cairo", country: "Egypt", flag: "🇪🇬" },
  { name: "Johannesburg", timezone: "Africa/Johannesburg", country: "South Africa", flag: "🇿🇦" },
  { name: "Lagos", timezone: "Africa/Lagos", country: "Nigeria", flag: "🇳🇬" },
  { name: "Nairobi", timezone: "Africa/Nairobi", country: "Kenya", flag: "🇰🇪" }
]

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
