"use client"

import { useCallback } from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Settings,
  Clock,
  X,
  Moon,
  Sun,
  AlarmClock,
  Timer,
  TimerIcon as Stopwatch,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface GlassSettings {
  blur: number
  refraction: number
  depth: number
  borderRadius: number
  borderOpacity: number
}

interface ColorSettings {
  opacity: number
  saturation: number
  brightness: number
}

interface GradientColorSettings {
  opacity: number
  saturation: number
  brightness: number
}

interface ColorRGB {
  r: number
  g: number
  b: number
}

interface GradientSettings {
  enabled: boolean
  startColor: string
  endColor: string
  direction: number
  type: "linear" | "radial"
  intensity: number
}

export default function Home() {
  const [settings, setSettings] = useState<GlassSettings>({
    blur: 20,
    refraction: 0.15,
    depth: 10,
    borderRadius: 20,
    borderOpacity: 0.3,
  })

  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    opacity: 0.15,
    saturation: 1.0,
    brightness: 1.0,
  })

  const [gradientColorSettings, setGradientColorSettings] = useState<GradientColorSettings>({
    opacity: 0.15,
    saturation: 1.0,
    brightness: 1.0,
  })

  const [inputColor, setInputColor] = useState("#EB8EFD")
  const [glassColors, setGlassColors] = useState<string[]>([
    "#FBECFF",
    "#F6D5FE",
    "#F0B1FE",
    "#EB8EFD",
    "#E76DFC",
    "#E327FC",
    "#BC12D1",
    "#910BA1",
    "#650571",
    "#3A0241",
    "#240129",
  ])

  const [gradientSettings, setGradientSettings] = useState<GradientSettings>({
    enabled: false,
    startColor: "#A5A0FF",
    endColor: "#8B85FF",
    direction: 145,
    type: "linear",
    intensity: 1.0,
  })

  const [backgroundSettings, setBackgroundSettings] = useState({
    imageUrl: "/tech-background.png",
    customUrl: "",
    opacity: 0.3,
    blur: 3,
  })

  const [worldClockSettings, setWorldClockSettings] = useState({
    enabled: true,
    style: "digital" as "digital" | "analog",
    showSeconds: true,
    format24h: false,
    showDate: true,
    clockSize: "medium" as "small" | "medium" | "large" | "xlarge",
    textColor: "#ffffff",
    accentColor: "#60a5fa",
    selectedTimezones: [
      { name: "New York", timezone: "America/New_York", abbreviation: "EST" },
      { name: "London", timezone: "Europe/London", abbreviation: "GMT" },
      { name: "Tokyo", timezone: "Asia/Tokyo", abbreviation: "JST" },
      { name: "Sydney", timezone: "Australia/Sydney", abbreviation: "AEDT" },
    ],
  })

  const [currentTime, setCurrentTime] = useState(new Date())

  const [isDayMode, setIsDayMode] = useState(true)

  const [fullscreenClock, setFullscreenClock] = useState<string | null>(null)

  const [clockMode, setClockMode] = useState<"world" | "alarm" | "timer" | "stopwatch">("world")

  // Alarm state
  const [alarms, setAlarms] = useState<
    Array<{
      id: string
      time: string
      label: string
      enabled: boolean
      days: string[]
    }>
  >([])
  const [newAlarmTime, setNewAlarmTime] = useState("07:00")
  const [newAlarmLabel, setNewAlarmLabel] = useState("")

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(5)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerTimeLeft, setTimerTimeLeft] = useState(0)

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [stopwatchRunning, setStopwatchRunning] = useState(false)
  const [stopwatchLaps, setStopwatchLaps] = useState<number[]>([])

  useEffect(() => {
    const timer = setInterval(
      () => {
        setCurrentTime(new Date())

        // Timer countdown
        if (timerRunning && timerTimeLeft > 0) {
          setTimerTimeLeft((prev) => {
            if (prev <= 1) {
              setTimerRunning(false)
              toast({ title: "Timer finished!", description: "Your timer has reached zero." })
              return 0
            }
            return prev - 1
          })
        }

        // Stopwatch increment
        if (stopwatchRunning) {
          setStopwatchTime((prev) => prev + 10)
        }
      },
      timerRunning ? 1000 : stopwatchRunning ? 10 : 1000,
    )

    return () => clearInterval(timer)
  }, [timerRunning, timerTimeLeft, stopwatchRunning])

  const timezoneOptions = [
    { name: "New York", timezone: "America/New_York", abbreviation: "EST" },
    { name: "Los Angeles", timezone: "America/Los_Angeles", abbreviation: "PST" },
    { name: "Chicago", timezone: "America/Chicago", abbreviation: "CST" },
    { name: "London", timezone: "Europe/London", abbreviation: "GMT" },
    { name: "Paris", timezone: "Europe/Paris", abbreviation: "CET" },
    { name: "Berlin", timezone: "Europe/Berlin", abbreviation: "CET" },
    { name: "Moscow", timezone: "Europe/Moscow", abbreviation: "MSK" },
    { name: "Dubai", timezone: "Asia/Dubai", abbreviation: "GST" },
    { name: "Mumbai", timezone: "Asia/Kolkata", abbreviation: "IST" },
    { name: "Singapore", timezone: "Asia/Singapore", abbreviation: "SGT" },
    { name: "Tokyo", timezone: "Asia/Tokyo", abbreviation: "JST" },
    { name: "Seoul", timezone: "Asia/Seoul", abbreviation: "KST" },
    { name: "Sydney", timezone: "Australia/Sydney", abbreviation: "AEDT" },
    { name: "Melbourne", timezone: "Australia/Melbourne", abbreviation: "AEDT" },
  ]

  const formatTimeForClock = (date: Date, timezone: string, format24h: boolean, showSeconds: boolean) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: format24h ? "2-digit" : "numeric",
      minute: "2-digit",
      ...(showSeconds && { second: "2-digit" }),
      ...(!format24h && { hour12: true }),
    }
    return new Intl.DateTimeFormat("en-US", options).format(date)
  }

  const formatDate = (date: Date, timezone: string) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }
    const formatted = new Intl.DateTimeFormat("en-US", options).format(date)
    // Convert "Tue, Aug 19, 2025" to "TUE - AUG 19, 2025"
    return formatted
      .replace(/,/g, "")
      .replace(/(\w+) (\w+) (\d+) (\d+)/, "$1 - $2 $3, $4")
      .toUpperCase()
  }

  const AnalogClock = ({ timezone, size }: { timezone: string; size: "small" | "medium" | "large" | "xlarge" }) => {
    const timeInZone = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }))

    const hours = timeInZone.getHours() % 12
    const minutes = timeInZone.getMinutes()
    const seconds = timeInZone.getSeconds()

    const hourAngle = hours * 30 + minutes * 0.5
    const minuteAngle = minutes * 6
    const secondAngle = seconds * 6

    const sizeMap = { small: 60, medium: 80, large: 100, xlarge: 120 }
    const clockSize = sizeMap[size]

    return (
      <div className="flex items-center justify-center">
        <svg width={clockSize} height={clockSize} className="transform -rotate-90">
          <circle
            cx={clockSize / 2}
            cy={clockSize / 2}
            r={clockSize / 2 - 4}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const angle = i * 30 * (Math.PI / 180)
            const x1 = clockSize / 2 + (clockSize / 2 - 12) * Math.cos(angle)
            const y1 = clockSize / 2 + (clockSize / 2 - 12) * Math.sin(angle)
            const x2 = clockSize / 2 + (clockSize / 2 - 8) * Math.cos(angle)
            const y2 = clockSize / 2 + (clockSize / 2 - 8) * Math.sin(angle)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          })}
          {/* Hour hand */}
          <line
            x1={clockSize / 2}
            y1={clockSize / 2}
            x2={clockSize / 2 + (clockSize / 4) * Math.cos((hourAngle * Math.PI) / 180)}
            y2={clockSize / 2 + (clockSize / 4) * Math.sin((hourAngle * Math.PI) / 180)}
            stroke={worldClockSettings.accentColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Minute hand */}
          <line
            x1={clockSize / 2}
            y1={clockSize / 2}
            x2={clockSize / 2 + (clockSize / 2.5) * Math.cos((minuteAngle * Math.PI) / 180)}
            y2={clockSize / 2 + (clockSize / 2.5) * Math.sin((minuteAngle * Math.PI) / 180)}
            stroke={worldClockSettings.textColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Second hand */}
          {worldClockSettings.showSeconds && (
            <line
              x1={clockSize / 2}
              y1={clockSize / 2}
              x2={clockSize / 2 + (clockSize / 2.2) * Math.cos((secondAngle * Math.PI) / 180)}
              y2={clockSize / 2 + (clockSize / 2.2) * Math.sin((secondAngle * Math.PI) / 180)}
              stroke="#ef4444"
              strokeWidth="1"
              strokeLinecap="round"
            />
          )}
          {/* Center dot */}
          <circle cx={clockSize / 2} cy={clockSize / 2} r="3" fill={worldClockSettings.accentColor} />
        </svg>
      </div>
    )
  }

  const hexToRgb = (hex: string): ColorRGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  const adjustColorForGlass = (color: string, intensity = 1.0, useGradientSettings = false): ColorRGB | null => {
    const rgb = hexToRgb(color)
    if (!rgb) return null

    const settings = useGradientSettings ? gradientColorSettings : colorSettings

    // Apply saturation and brightness adjustments
    const { r, g, b } = rgb

    // Convert to HSL for better saturation control
    const max = Math.max(r, g, b) / 255
    const min = Math.min(r, g, b) / 255
    const diff = max - min
    const sum = max + min
    const lightness = sum / 2

    let saturation = 0
    if (diff !== 0) {
      saturation = lightness > 0.5 ? diff / (2 - sum) : diff / sum
    }

    // Apply adjustments with intensity
    const newSaturation = Math.min(1, saturation * settings.saturation * intensity)
    const newLightness = Math.min(1, lightness * settings.brightness)

    // Convert back to RGB with intensity boost
    const adjustedR = Math.round(r * settings.brightness * intensity)
    const adjustedG = Math.round(g * settings.brightness * intensity)
    const adjustedB = Math.round(b * settings.brightness * intensity)

    return {
      r: Math.min(255, Math.max(0, adjustedR)),
      g: Math.min(255, Math.max(0, adjustedG)),
      b: Math.min(255, Math.max(0, adjustedB)),
    }
  }

  const generateGlassmorphicVariants = useCallback((baseColor: string) => {
    const rgb = hexToRgb(baseColor)
    if (!rgb) return []

    const variants = []

    for (let i = 0; i < 11; i++) {
      const factor = (i / 10) * 0.8 + 0.2 // Range from 0.2 to 1.0
      const glassOpacity = 0.05 + (i / 10) * 0.3 // Range from 0.05 to 0.35

      const newR = Math.round(rgb.r * factor + (255 - rgb.r) * (1 - factor) * 0.3)
      const newG = Math.round(rgb.g * factor + (255 - rgb.g) * (1 - factor) * 0.3)
      const newB = Math.round(rgb.b * factor + (255 - rgb.b) * (1 - factor) * 0.3)

      variants.push(
        rgbToHex(Math.min(255, Math.max(0, newR)), Math.min(255, Math.max(0, newG)), Math.min(255, Math.max(0, newB))),
      )
    }

    return variants
  }, [])

  const generateBaseCSS = () => {
    return `.glass-card {
  width: 240px;
  height: 360px;
  background: rgba(255, 255, 255, ${settings.refraction});
  backdrop-filter: blur(${settings.blur}px);
  -webkit-backdrop-filter: blur(${settings.blur}px);
  border-radius: ${settings.borderRadius}px;
  border: 1px solid rgba(255, 255, 255, ${settings.borderOpacity});
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1),
    inset 0 0 ${settings.depth * 2}px ${settings.depth}px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.8),
    transparent
  );
}

.glass-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.8),
    transparent,
    rgba(255, 255, 255, 0.3)
  );
}`
  }

  const generateColorCSS = () => {
    const adjustedColor = adjustColorForGlass(inputColor)
    if (!adjustedColor) return ""

    return `.glass-card-colored {
  width: 240px;
  height: 360px;
  background: rgba(${adjustedColor.r}, ${adjustedColor.g}, ${adjustedColor.b}, ${colorSettings.opacity});
  backdrop-filter: blur(${settings.blur}px);
  -webkit-backdrop-filter: blur(${settings.blur}px);
  border-radius: ${settings.borderRadius}px;
  border: 1px solid rgba(255, 255, 255, ${settings.borderOpacity});
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1),
    inset 0 0 ${settings.depth * 2}px ${settings.depth}px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.glass-card-colored::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.8),
    transparent
  );
}

.glass-card-colored::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.8),
    transparent,
    rgba(255, 255, 255, 0.3)
  );
}`
  }

  const generateGradientCSS = () => {
    const startRgb = adjustColorForGlass(gradientSettings.startColor, gradientSettings.intensity, true)
    const endRgb = adjustColorForGlass(gradientSettings.endColor, gradientSettings.intensity, true)

    if (!startRgb || !endRgb) return ""

    const gradientType =
      gradientSettings.type === "radial" ? "radial-gradient(circle" : `linear-gradient(${gradientSettings.direction}deg`

    return `.glass-card-gradient {
  width: 240px;
  height: 360px;
  background: ${gradientType}, rgba(${startRgb.r}, ${startRgb.g}, ${startRgb.b}, ${gradientColorSettings.opacity}) 0%, rgba(${endRgb.r}, ${endRgb.g}, ${endRgb.b}, ${gradientColorSettings.opacity}) 100%);
  backdrop-filter: blur(${settings.blur}px);
  -webkit-backdrop-filter: blur(${settings.blur}px);
  border-radius: ${settings.borderRadius}px;
  border: 1px solid rgba(255, 255, 255, ${settings.borderOpacity});
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1),
    inset 0 0 ${settings.depth * 2}px ${settings.depth}px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.glass-card-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.8),
    transparent
  );
}

.glass-card-gradient::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.8),
    transparent,
    rgba(255, 255, 255, 0.3)
  );
}`
  }

  const copyBaseCSS = async () => {
    try {
      await navigator.clipboard.writeText(generateBaseCSS())
      toast({
        title: "Base CSS Copied!",
        description: "The base glassmorphism CSS has been copied to your clipboard.",
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy CSS to clipboard.",
        variant: "destructive",
      })
    }
  }

  const copyColorCSS = async () => {
    try {
      await navigator.clipboard.writeText(generateColorCSS())
      toast({
        title: "Color CSS Copied!",
        description: "The colored glassmorphism CSS has been copied to your clipboard.",
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy CSS to clipboard.",
        variant: "destructive",
      })
    }
  }

  const copyGradientCSS = async () => {
    try {
      await navigator.clipboard.writeText(generateGradientCSS())
      toast({
        title: "Gradient CSS Copied!",
        description: "The gradient glassmorphism CSS has been copied to your clipboard.",
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy CSS to clipboard.",
        variant: "destructive",
      })
    }
  }

  const copyAllCSS = async () => {
    try {
      const combinedCSS = `/* Base Glassmorphic Card */\n${generateBaseCSS()}\n\n/* Colored Glassmorphic Card */\n${generateColorCSS()}\n\n/* Gradient Glassmorphic Card */\n${generateGradientCSS()}`
      await navigator.clipboard.writeText(combinedCSS)
      toast({
        title: "All CSS Copied!",
        description: "All glassmorphism CSS variants have been copied to your clipboard.",
      })
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy CSS to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleColorChange = (color: string) => {
    setInputColor(color)
    setGlassColors(generateGlassmorphicVariants(color))
  }

  const getThemeStyles = () => {
    if (isDayMode) {
      return {
        backgroundColor: "rgb(240, 248, 255)", // Light blue background
        textColor: "text-gray-800",
        glassBackground: "rgba(255, 255, 255, 0.25)",
        borderColor: "rgba(255, 255, 255, 0.4)",
        sidebarBackground: "bg-white/20",
        sidebarBorder: "border-white/30",
        buttonBackground: "bg-white/20 hover:bg-white/30",
      }
    } else {
      return {
        backgroundColor: "rgb(18, 16, 16)", // Dark background
        textColor: "text-gray-100",
        glassBackground: "rgba(255, 255, 255, 0.15)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        sidebarBackground: "bg-black/30",
        sidebarBorder: "border-white/20",
        buttonBackground: "bg-white/10 hover:bg-white/20",
      }
    }
  }

  const themeStyles = getThemeStyles()

  const getGlassStyle = () => {
    return {
      background: themeStyles.glassBackground,
      backdropFilter: `blur(${settings.blur}px)`,
      WebkitBackdropFilter: `blur(${settings.blur}px)`,
      borderRadius: `${settings.borderRadius}px`,
      border: `1px solid ${themeStyles.borderColor}`,
      boxShadow: `
        0 8px 32px rgba(0, 0, 0, ${isDayMode ? "0.1" : "0.3"}),
        inset 0 1px 0 rgba(255, 255, 255, 0.5),
        inset 0 -1px 0 rgba(255, 255, 255, 0.1),
        inset 0 0 ${settings.depth * 2}px ${settings.depth}px rgba(255, 255, 255, 0.05)
      `,
      position: "relative" as const,
      overflow: "hidden" as const,
    }
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)

  const availableTimezones = [
    { name: "New York", timezone: "America/New_York", abbreviation: "EST" },
    { name: "Los Angeles", timezone: "America/Los_Angeles", abbreviation: "PST" },
    { name: "Chicago", timezone: "America/Chicago", abbreviation: "CST" },
    { name: "London", timezone: "Europe/London", abbreviation: "GMT" },
    { name: "Paris", timezone: "Europe/Paris", abbreviation: "CET" },
    { name: "Berlin", timezone: "Europe/Berlin", abbreviation: "CET" },
    { name: "Tokyo", timezone: "Asia/Tokyo", abbreviation: "JST" },
    { name: "Sydney", timezone: "Australia/Sydney", abbreviation: "AEDT" },
    { name: "Dubai", timezone: "Asia/Dubai", abbreviation: "GST" },
    { name: "Mumbai", timezone: "Asia/Kolkata", abbreviation: "IST" },
  ]

  const toggleTimezone = (timezone: (typeof availableTimezones)[0]) => {
    setWorldClockSettings((prev) => ({
      ...prev,
      selectedTimezones: prev.selectedTimezones.some((tz) => tz.timezone === timezone.timezone)
        ? prev.selectedTimezones.filter((tz) => tz.timezone !== timezone.timezone)
        : [...prev.selectedTimezones, timezone],
    }))
  }

  const addAlarm = () => {
    if (newAlarmTime && newAlarmLabel) {
      const newAlarm = {
        id: Date.now().toString(),
        time: newAlarmTime,
        label: newAlarmLabel,
        enabled: true,
        days: [],
      }
      setAlarms((prev) => [...prev, newAlarm])
      setNewAlarmLabel("")
      toast({ title: "Alarm added", description: `Alarm set for ${newAlarmTime}` })
    }
  }

  const deleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id))
  }

  const toggleAlarm = (id: string) => {
    setAlarms((prev) => prev.map((alarm) => (alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm)))
  }

  const startTimer = () => {
    const totalSeconds = timerMinutes * 60 + timerSeconds
    if (totalSeconds > 0) {
      setTimerTimeLeft(totalSeconds)
      setTimerRunning(true)
    }
  }

  const pauseTimer = () => {
    setTimerRunning(false)
  }

  const resetTimer = () => {
    setTimerRunning(false)
    setTimerTimeLeft(0)
  }

  const startStopwatch = () => {
    setStopwatchRunning(true)
  }

  const pauseStopwatch = () => {
    setStopwatchRunning(false)
  }

  const resetStopwatch = () => {
    setStopwatchRunning(false)
    setStopwatchTime(0)
    setStopwatchLaps([])
  }

  const addLap = () => {
    setStopwatchLaps((prev) => [...prev, stopwatchTime])
  }

  const formatStopwatchTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const ms = Math.floor((milliseconds % 1000) / 10)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`
  }

  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Professional clock templates for different user types
  const professionalTemplates = {
    crypto: {
      name: "Crypto Trader",
      description: "24/7 global markets with high activity overlaps",
      timezones: [
        { name: "New York", timezone: "America/New_York", abbreviation: "EST" },
        { name: "London", timezone: "Europe/London", abbreviation: "GMT" },
        { name: "Hong Kong", timezone: "Asia/Hong_Kong", abbreviation: "HKT" },
        { name: "Singapore", timezone: "Asia/Singapore", abbreviation: "SGT" },
        { name: "Tokyo", timezone: "Asia/Tokyo", abbreviation: "JST" },
      ],
      settings: {
        style: "digital" as const,
        showSeconds: true,
        format24h: true,
        showDate: true,
        clockSize: "large" as const,
        textColor: "#fbbf24",
        accentColor: "#f59e0b",
      },
    },
    stock: {
      name: "Stock Trader",
      description: "Market hours focus with NYSE/NASDAQ timing",
      timezones: [
        { name: "New York", timezone: "America/New_York", abbreviation: "EST" },
        { name: "Toronto", timezone: "America/Toronto", abbreviation: "EST" },
        { name: "Chicago", timezone: "America/Chicago", abbreviation: "CST" },
        { name: "Los Angeles", timezone: "America/Los_Angeles", abbreviation: "PST" },
      ],
      settings: {
        style: "digital" as const,
        showSeconds: false,
        format24h: false,
        showDate: true,
        clockSize: "medium" as const,
        textColor: "#10b981",
        accentColor: "#059669",
      },
    },
    sales: {
      name: "Cold Caller",
      description: "Optimal calling times across business zones",
      timezones: [
        { name: "New York", timezone: "America/New_York", abbreviation: "EST" },
        { name: "Chicago", timezone: "America/Chicago", abbreviation: "CST" },
        { name: "Denver", timezone: "America/Denver", abbreviation: "MST" },
        { name: "Los Angeles", timezone: "America/Los_Angeles", abbreviation: "PST" },
        { name: "London", timezone: "Europe/London", abbreviation: "GMT" },
      ],
      settings: {
        style: "digital" as const,
        showSeconds: false,
        format24h: false,
        showDate: true,
        clockSize: "medium" as const,
        textColor: "#3b82f6",
        accentColor: "#2563eb",
      },
    },
  }

  // Function to get activity status for professional templates
  const getActivityStatus = (timezone: string, templateType: keyof typeof professionalTemplates) => {
    const now = new Date()
    const timeInZone = new Date(now.toLocaleString("en-US", { timeZone: timezone }))
    const hour = timeInZone.getHours()
    const day = timeInZone.getDay() // 0 = Sunday, 1 = Monday, etc.

    if (templateType === "crypto") {
      // High activity during market overlaps
      if ((hour >= 8 && hour <= 11) || (hour >= 19 && hour <= 23)) {
        return { status: "High Activity", color: "#f59e0b" }
      }
      return { status: "Active", color: "#10b981" }
    }

    if (templateType === "stock") {
      // Market hours 9:30 AM - 4:00 PM EST
      if (timezone === "America/New_York") {
        if (day >= 1 && day <= 5) {
          // Monday to Friday
          if (hour === 9 && timeInZone.getMinutes() >= 30) {
            return { status: "Market Open", color: "#10b981" }
          }
          if (hour >= 10 && hour <= 15) {
            return { status: "Market Open", color: "#10b981" }
          }
          if (hour === 16 && timeInZone.getMinutes() === 0) {
            return { status: "Market Close", color: "#ef4444" }
          }
        }
        return { status: "Market Closed", color: "#6b7280" }
      }
      return { status: "Follow NYSE", color: "#6b7280" }
    }

    if (templateType === "sales") {
      // Best calling times: Tue-Thu, 10-11:30 AM and 2-4 PM
      if (day >= 2 && day <= 4) {
        // Tuesday to Thursday
        if ((hour >= 10 && hour <= 11) || (hour >= 14 && hour <= 16)) {
          return { status: "Prime Time", color: "#3b82f6" }
        }
      }
      if (day >= 1 && day <= 5 && hour >= 9 && hour <= 17) {
        return { status: "Business Hours", color: "#10b981" }
      }
      return { status: "Off Hours", color: "#6b7280" }
    }

    return { status: "Active", color: "#6b7280" }
  }

  // Function to apply professional template
  const applyProfessionalTemplate = (templateKey: keyof typeof professionalTemplates) => {
    const template = professionalTemplates[templateKey]
    setWorldClockSettings((prev) => ({
      ...prev,
      ...template.settings,
      selectedTimezones: template.timezones,
    }))
  }

  const [clockStyle, setClockStyle] = useState(worldClockSettings.style)
  const [clockSize, setClockSize] = useState(worldClockSettings.clockSize)
  const [showSeconds, setShowSeconds] = useState(worldClockSettings.showSeconds)
  const [showDate, setShowDate] = useState(worldClockSettings.showDate)

  useEffect(() => {
    setWorldClockSettings((prev) => ({
      ...prev,
      style: clockStyle,
      clockSize: clockSize,
      showSeconds: showSeconds,
      showDate: showDate,
    }))
  }, [clockStyle, clockSize, showSeconds, showDate])

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat p-4 relative transition-colors duration-500"
      style={{
        backgroundColor: themeStyles.backgroundColor,
      }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
        style={{
          backgroundImage: backgroundSettings.imageUrl ? `url(${backgroundSettings.imageUrl})` : "none",
          opacity: backgroundSettings.opacity,
          filter: backgroundSettings.blur > 0 ? `blur(${backgroundSettings.blur}px)` : "none",
        }}
      />

      {/* Top Controls */}
      <div className="relative z-30 flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setClockMode("world")}
            className={`${clockMode === "world" ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            <Clock className="w-4 h-4 mr-2" />
            World Clock
          </Button>
          <Button
            onClick={() => setClockMode("alarm")}
            className={`${clockMode === "alarm" ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            <AlarmClock className="w-4 h-4 mr-2" />
            Alarm
          </Button>
          <Button
            onClick={() => setClockMode("timer")}
            className={`${clockMode === "timer" ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            <Timer className="w-4 h-4 mr-2" />
            Timer
          </Button>
          <Button
            onClick={() => setClockMode("stopwatch")}
            className={`${clockMode === "stopwatch" ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            <Stopwatch className="w-4 h-4 mr-2" />
            Stopwatch
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {clockMode === "world" && (
            <Button
              onClick={() => setLeftSidebarOpen(true)}
              className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
            >
              <Clock className="w-4 h-4 mr-2" />
              Timezones
            </Button>
          )}

          <Button
            onClick={() => setIsDayMode(!isDayMode)}
            className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            {isDayMode ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
            {isDayMode ? "Night" : "Day"}
          </Button>

          <Button
            onClick={() => setSidebarOpen(true)}
            className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Left Timezones Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 ${themeStyles.sidebarBackground} backdrop-blur-xl border-r ${themeStyles.sidebarBorder} transform transition-transform duration-300 ease-in-out z-40 ${
          leftSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${themeStyles.textColor}`}>Timezones</h2>
            <Button
              onClick={() => setLeftSidebarOpen(false)}
              className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {timezoneOptions.map((timezone) => (
              <div key={timezone.timezone} className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={worldClockSettings.selectedTimezones.some((tz) => tz.timezone === timezone.timezone)}
                  onChange={() => toggleTimezone(timezone)}
                  className="rounded"
                />
                <div>
                  <div className={`font-bold ${themeStyles.textColor}`}>{timezone.name}</div>
                  <div className={`text-sm ${isDayMode ? themeStyles.textColor + "/70" : "text-gray-300"}`}>
                    {timezone.abbreviation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Settings Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 ${themeStyles.sidebarBackground} backdrop-blur-xl border-l ${themeStyles.sidebarBorder} transform transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${themeStyles.textColor}`}>Settings</h2>
            <Button
              onClick={() => setSidebarOpen(false)}
              className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {clockMode === "world" && (
            <div className="space-y-4 mt-8">
              <h3 className={`text-lg font-semibold ${themeStyles.textColor}`}>Professional Templates</h3>
              <div className="space-y-3">
                {Object.entries(professionalTemplates).map(([key, template]) => (
                  <div key={key} className="space-y-2">
                    <button
                      onClick={() => applyProfessionalTemplate(key as keyof typeof professionalTemplates)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${themeStyles.buttonBackground} ${themeStyles.textColor} hover:scale-105`}
                      style={getGlassStyle()}
                    >
                      <div className="font-semibold">{template.name}</div>
                      <div className="text-sm opacity-75">{template.description}</div>
                      <div className="text-xs mt-1 opacity-60">
                        {template.timezones.length} timezones • {template.settings.style} style
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 mt-8">
            <h3 className={`text-lg font-semibold ${themeStyles.textColor}`}>Glass Settings</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${themeStyles.textColor} mb-2`}>
                  Blur: {settings.blur}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={settings.blur}
                  onChange={(e) => setSettings({ ...settings, blur: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${themeStyles.textColor} mb-2`}>
                  Border Radius: {settings.borderRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={settings.borderRadius}
                  onChange={(e) => setSettings({ ...settings, borderRadius: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${themeStyles.textColor} mb-2`}>
                  Depth: {settings.depth}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={settings.depth}
                  onChange={(e) => setSettings({ ...settings, depth: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <h3 className={`text-lg font-semibold ${themeStyles.textColor}`}>Color Preview</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${themeStyles.textColor} mb-2`}>Base Color</label>
                <input
                  type="color"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  className="w-full h-10 rounded border-0"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${themeStyles.textColor} mb-2`}>
                  Opacity: {Math.round(colorSettings.opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={colorSettings.opacity}
                  onChange={(e) => setColorSettings({ ...colorSettings, opacity: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${themeStyles.textColor} mb-2`}>
                  Saturation: {Math.round(colorSettings.saturation * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={colorSettings.saturation}
                  onChange={(e) => setColorSettings({ ...colorSettings, saturation: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {clockMode === "world" && (
            <div className="space-y-4 mt-8">
              <h3 className={`text-lg font-semibold ${themeStyles.textColor}`}>World Clock Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${themeStyles.textColor} mb-2`}>Clock Style</label>
                  <select
                    value={clockStyle}
                    onChange={(e) => setClockStyle(e.target.value as "digital" | "analog")}
                    className={`w-full p-2 rounded ${themeStyles.inputBackground} ${themeStyles.textColor} border ${themeStyles.borderColor}`}
                  >
                    <option value="digital">Digital</option>
                    <option value="analog">Analog</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${themeStyles.textColor} mb-2`}>Clock Size</label>
                  <select
                    value={clockSize}
                    onChange={(e) => setClockSize(e.target.value as "small" | "medium" | "large" | "extra-large")}
                    className={`w-full p-2 rounded ${themeStyles.inputBackground} ${themeStyles.textColor} border ${themeStyles.borderColor}`}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show-seconds"
                    checked={showSeconds}
                    onChange={(e) => setShowSeconds(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="show-seconds" className={`text-sm ${themeStyles.textColor}`}>
                    Show Seconds
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show-date"
                    checked={showDate}
                    onChange={(e) => setShowDate(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="show-date" className={`text-sm ${themeStyles.textColor}`}>
                    Show Date
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Additional Settings Content */}
          {/* ... existing settings content here ... */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)]">
        {clockMode === "world" && (
          <>
            {worldClockSettings.selectedTimezones.length === 0 ? (
              <div className={`text-center ${isDayMode ? themeStyles.textColor + "/60" : "text-gray-300"}`}>
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl mb-2">No timezones selected</p>
                <p>Click "Timezones" to add some clocks</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {worldClockSettings.selectedTimezones.map((timezone) => {
                  const time = formatTimeForClock(
                    new Date(),
                    timezone.timezone,
                    worldClockSettings.format24h,
                    worldClockSettings.showSeconds,
                  )

                  const date = worldClockSettings.showDate ? formatDate(new Date(), timezone.timezone) : ""

                  const currentTemplate = Object.entries(professionalTemplates).find(
                    ([_, template]) =>
                      template.timezones.some((tz) => tz.timezone === timezone.timezone) &&
                      template.settings.textColor === worldClockSettings.textColor,
                  )
                  const activityStatus = currentTemplate
                    ? getActivityStatus(timezone.timezone, currentTemplate[0] as keyof typeof professionalTemplates)
                    : null

                  const sizeClasses = {
                    small: "w-48 h-32 text-lg",
                    medium: "w-64 h-40 text-xl",
                    large: "w-80 h-48 text-2xl",
                    xlarge: "w-96 h-56 text-3xl",
                  }

                  return (
                    <div
                      key={timezone.timezone}
                      className={`${sizeClasses[worldClockSettings.clockSize]} flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 relative group`}
                      style={getGlassStyle()}
                    >
                      <button
                        onClick={() => setFullscreenClock(timezone.timezone)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 text-white rounded p-1 text-xs hover:bg-opacity-70"
                      >
                        ⛶
                      </button>

                      {activityStatus && (
                        <div
                          className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: activityStatus.color + "20",
                            color: activityStatus.color,
                            border: `1px solid ${activityStatus.color}40`,
                          }}
                        >
                          {activityStatus.status}
                        </div>
                      )}

                      <div className="text-center">
                        <h3 className="font-bold mb-2" style={{ color: worldClockSettings.accentColor }}>
                          {timezone.name}
                        </h3>
                        {worldClockSettings.style === "digital" ? (
                          <>
                            <div className="font-mono font-bold mb-1" style={{ color: worldClockSettings.textColor }}>
                              {time}
                            </div>
                            {worldClockSettings.showDate && (
                              <div
                                className="text-sm font-mono tracking-wider opacity-90"
                                style={{ color: worldClockSettings.textColor }}
                              >
                                {date}
                              </div>
                            )}
                          </>
                        ) : (
                          <AnalogClock timezone={timezone.timezone} size={worldClockSettings.clockSize} />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {clockMode === "alarm" && (
          <div className="max-w-2xl mx-auto w-full">
            <div className="mb-8" style={getGlassStyle()}>
              <div className="p-6">
                <h2 className={`text-2xl font-bold mb-4 ${themeStyles.textColor}`}>Add New Alarm</h2>
                <div className="flex gap-4 mb-4">
                  <input
                    type="time"
                    value={newAlarmTime}
                    onChange={(e) => setNewAlarmTime(e.target.value)}
                    className={`px-3 py-2 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
                  />
                  <input
                    type="text"
                    placeholder="Alarm label"
                    value={newAlarmLabel}
                    onChange={(e) => setNewAlarmLabel(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
                  />
                  <Button
                    onClick={addAlarm}
                    className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {alarms.map((alarm) => (
                <div key={alarm.id} className="p-4" style={getGlassStyle()}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-mono font-bold ${themeStyles.textColor}`}>{alarm.time}</div>
                      <div className={`text-sm ${isDayMode ? themeStyles.textColor + "/70" : "text-gray-300"}`}>
                        {alarm.label}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={alarm.enabled}
                        onChange={() => toggleAlarm(alarm.id)}
                        className="rounded"
                      />
                      <Button
                        onClick={() => deleteAlarm(alarm.id)}
                        size="sm"
                        className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {alarms.length === 0 && (
                <div className={`text-center py-8 ${isDayMode ? themeStyles.textColor + "/60" : "text-gray-300"}`}>
                  <AlarmClock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No alarms set</p>
                </div>
              )}
            </div>
          </div>
        )}

        {clockMode === "timer" && (
          <div className="max-w-lg mx-auto w-full text-center">
            <div className="p-8" style={getGlassStyle()}>
              <h2 className={`text-2xl font-bold mb-8 ${themeStyles.textColor}`}>Timer</h2>

              {!timerRunning && timerTimeLeft === 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setTimerMinutes(Math.max(0, timerMinutes - 1))}
                        size="sm"
                        className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className={`text-4xl font-mono font-bold ${themeStyles.textColor} min-w-[3ch]`}>
                        {timerMinutes.toString().padStart(2, "0")}
                      </span>
                      <Button
                        onClick={() => setTimerMinutes(timerMinutes + 1)}
                        size="sm"
                        className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className={`text-4xl font-mono font-bold ${themeStyles.textColor}`}>:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setTimerSeconds(Math.max(0, timerSeconds - 1))}
                        size="sm"
                        className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className={`text-4xl font-mono font-bold ${themeStyles.textColor} min-w-[3ch]`}>
                        {timerSeconds.toString().padStart(2, "0")}
                      </span>
                      <Button
                        onClick={() => setTimerSeconds(Math.min(59, timerSeconds + 1))}
                        size="sm"
                        className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={startTimer}
                    className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Timer
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`text-6xl font-mono font-bold ${themeStyles.textColor}`}>
                    {formatTimerTime(timerTimeLeft)}
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={timerRunning ? pauseTimer : startTimer}
                      className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                    >
                      {timerRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {timerRunning ? "Pause" : "Resume"}
                    </Button>
                    <Button
                      onClick={resetTimer}
                      className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {clockMode === "stopwatch" && (
          <div className="max-w-lg mx-auto w-full text-center">
            <div className="p-8" style={getGlassStyle()}>
              <h2 className={`text-2xl font-bold mb-8 ${themeStyles.textColor}`}>Stopwatch</h2>

              <div className={`text-6xl font-mono font-bold mb-8 ${themeStyles.textColor}`}>
                {formatStopwatchTime(stopwatchTime)}
              </div>

              <div className="flex justify-center gap-4 mb-6">
                <Button
                  onClick={stopwatchRunning ? pauseStopwatch : startStopwatch}
                  className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                >
                  {stopwatchRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {stopwatchRunning ? "Pause" : "Start"}
                </Button>
                <Button
                  onClick={addLap}
                  disabled={!stopwatchRunning}
                  className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 disabled:opacity-50`}
                >
                  Lap
                </Button>
                <Button
                  onClick={resetStopwatch}
                  className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              {stopwatchLaps.length > 0 && (
                <div className="max-h-40 overflow-y-auto">
                  <h3 className={`text-lg font-semibold mb-2 ${themeStyles.textColor}`}>Laps</h3>
                  <div className="space-y-1">
                    {stopwatchLaps.map((lap, index) => (
                      <div key={index} className={`flex justify-between text-sm ${themeStyles.textColor}`}>
                        <span>Lap {index + 1}</span>
                        <span className="font-mono">{formatStopwatchTime(lap)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Clock Overlay */}
      {fullscreenClock && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="p-8" style={getGlassStyle()}>
            <h2 className={`text-4xl font-bold mb-4 ${themeStyles.textColor}`}>
              {formatTimeForClock(
                new Date(),
                fullscreenClock,
                worldClockSettings.format24h,
                worldClockSettings.showSeconds,
              )}
            </h2>
            <Button
              onClick={() => setFullscreenClock(null)}
              className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
