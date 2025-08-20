//@ts-nocheck
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
  Bed,
  Disc3,
  History,
  Trash2,
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
      { id: 1, timezone: "America/New_York", city: "نیویورک" },
      { id: 2, timezone: "Europe/London", city: "لندن" },
      { id: 3, timezone: "Asia/Tokyo", city: "توکیو" },
      { name: "Sydney", timezone: "Australia/Sydney", abbreviation: "AEDT" },
    ],
  })

  const [currentTime, setCurrentTime] = useState(new Date())

  const [isDayMode, setIsDayMode] = useState(true)

  const [fullscreenClock, setFullscreenClock] = useState<string | null>(null)

  const [clockMode, setClockMode] = useState<"world" | "alarm" | "timer" | "stopwatch" | "sleep" | "wheel">("world")

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

  // Sleep Calculator state
  const [sleepMode, setSleepMode] = useState<"bedtime" | "wakeup">("bedtime")
  const [wakeUpTime, setWakeUpTime] = useState("07:00")
  const [bedTime, setBedTime] = useState("23:00")
  const [sleepDuration, setSleepDuration] = useState(8) // hours
  const [sleepResults, setSleepResults] = useState<{
    bedtimes: string[]
    wakeupTimes: string[]
    cycles: number
  } | null>(null)

  // Wheel of Names state
  const [wheelNames, setWheelNames] = useState<string[]>(["علی", "چارلز", "دیا", "اریک", "فاطمه", "گابریل", "حنا"])
  const [newName, setNewName] = useState("")
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [spinRotation, setSpinRotation] = useState(0)
  const [wheelHistory, setWheelHistory] = useState<Array<{name: string, timestamp: Date}>>([])
  const [showWheelHistory, setShowWheelHistory] = useState(false)

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

  // Sleep Calculator functions
  const calculateSleepTimes = () => {
    const SLEEP_CYCLE_MINUTES = 90 // Average sleep cycle duration
    const FALL_ASLEEP_MINUTES = 15 // Time to fall asleep

    if (sleepMode === "bedtime") {
      // Calculate bedtimes based on wake-up time
      const [wakeHour, wakeMinute] = wakeUpTime.split(":").map(Number)
      const wakeDate = new Date()
      wakeDate.setHours(wakeHour, wakeMinute, 0, 0)
      
      const bedtimes: string[] = []
      const cycles = [6, 5, 4, 3] // Different sleep cycle options
      
      cycles.forEach(cycleCount => {
        const totalSleepMinutes = cycleCount * SLEEP_CYCLE_MINUTES
        const bedtimeDate = new Date(wakeDate.getTime() - (totalSleepMinutes + FALL_ASLEEP_MINUTES) * 60000)
        
        // Handle previous day
        if (bedtimeDate.getDate() !== wakeDate.getDate()) {
          bedtimeDate.setDate(bedtimeDate.getDate())
        }
        
        const bedtimeString = bedtimeDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
        bedtimes.push(`${bedtimeString} (${cycleCount} cycles)`)
      })
      
      setSleepResults({
        bedtimes,
        wakeupTimes: [],
        cycles: cycles.length
      })
    } else {
      // Calculate wake-up times based on bedtime
      const [bedHour, bedMinute] = bedTime.split(":").map(Number)
      const bedDate = new Date()
      bedDate.setHours(bedHour, bedMinute, 0, 0)
      
      const wakeupTimes: string[] = []
      const cycles = [3, 4, 5, 6] // Different sleep cycle options
      
      cycles.forEach(cycleCount => {
        const totalSleepMinutes = cycleCount * SLEEP_CYCLE_MINUTES
        const wakeupDate = new Date(bedDate.getTime() + (totalSleepMinutes + FALL_ASLEEP_MINUTES) * 60000)
        
        // Handle next day
        if (wakeupDate.getDate() !== bedDate.getDate()) {
          wakeupDate.setDate(wakeupDate.getDate())
        }
        
        const wakeupString = wakeupDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
        wakeupTimes.push(`${wakeupString} (${cycleCount} cycles)`)
      })
      
      setSleepResults({
        bedtimes: [],
        wakeupTimes,
        cycles: cycles.length
      })
    }
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

  // Custom timezone search state
  const [timezoneSearch, setTimezoneSearch] = useState("")
  const [showAddTimezone, setShowAddTimezone] = useState(false)
  const [customTimezones, setCustomTimezones] = useState<Array<{name: string, timezone: string, abbreviation: string}>>([])
  const [searchResults, setSearchResults] = useState<Array<{name: string, timezone: string, abbreviation: string}>>([])

  // Comprehensive timezone list for search
  const allTimezones = [
    // North America
    { name: "Anchorage", timezone: "America/Anchorage", abbreviation: "AKST" },
    { name: "Vancouver", timezone: "America/Vancouver", abbreviation: "PST" },
    { name: "Seattle", timezone: "America/Los_Angeles", abbreviation: "PST" },
    { name: "San Francisco", timezone: "America/Los_Angeles", abbreviation: "PST" },
    { name: "Las Vegas", timezone: "America/Los_Angeles", abbreviation: "PST" },
    { name: "Phoenix", timezone: "America/Phoenix", abbreviation: "MST" },
    { name: "Denver", timezone: "America/Denver", abbreviation: "MST" },
    { name: "Dallas", timezone: "America/Chicago", abbreviation: "CST" },
    { name: "Houston", timezone: "America/Chicago", abbreviation: "CST" },
    { name: "Mexico City", timezone: "America/Mexico_City", abbreviation: "CST" },
    { name: "Miami", timezone: "America/New_York", abbreviation: "EST" },
    { name: "Toronto", timezone: "America/Toronto", abbreviation: "EST" },
    { name: "Montreal", timezone: "America/Montreal", abbreviation: "EST" },
    { name: "Boston", timezone: "America/New_York", abbreviation: "EST" },
    { name: "Washington DC", timezone: "America/New_York", abbreviation: "EST" },
    { name: "Atlanta", timezone: "America/New_York", abbreviation: "EST" },
    
    // South America
    { name: "São Paulo", timezone: "America/Sao_Paulo", abbreviation: "BRT" },
    { name: "Rio de Janeiro", timezone: "America/Sao_Paulo", abbreviation: "BRT" },
    { name: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", abbreviation: "ART" },
    { name: "Santiago", timezone: "America/Santiago", abbreviation: "CLT" },
    { name: "Lima", timezone: "America/Lima", abbreviation: "PET" },
    { name: "Bogotá", timezone: "America/Bogota", abbreviation: "COT" },
    { name: "Caracas", timezone: "America/Caracas", abbreviation: "VET" },
    
    // Europe
    { name: "Reykjavik", timezone: "Atlantic/Reykjavik", abbreviation: "GMT" },
    { name: "Dublin", timezone: "Europe/Dublin", abbreviation: "GMT" },
    { name: "Edinburgh", timezone: "Europe/London", abbreviation: "GMT" },
    { name: "Amsterdam", timezone: "Europe/Amsterdam", abbreviation: "CET" },
    { name: "Brussels", timezone: "Europe/Brussels", abbreviation: "CET" },
    { name: "Copenhagen", timezone: "Europe/Copenhagen", abbreviation: "CET" },
    { name: "Stockholm", timezone: "Europe/Stockholm", abbreviation: "CET" },
    { name: "Oslo", timezone: "Europe/Oslo", abbreviation: "CET" },
    { name: "Helsinki", timezone: "Europe/Helsinki", abbreviation: "EET" },
    { name: "Warsaw", timezone: "Europe/Warsaw", abbreviation: "CET" },
    { name: "Prague", timezone: "Europe/Prague", abbreviation: "CET" },
    { name: "Vienna", timezone: "Europe/Vienna", abbreviation: "CET" },
    { name: "Zurich", timezone: "Europe/Zurich", abbreviation: "CET" },
    { name: "Rome", timezone: "Europe/Rome", abbreviation: "CET" },
    { name: "Madrid", timezone: "Europe/Madrid", abbreviation: "CET" },
    { name: "Barcelona", timezone: "Europe/Madrid", abbreviation: "CET" },
    { name: "Lisbon", timezone: "Europe/Lisbon", abbreviation: "WET" },
    { name: "Athens", timezone: "Europe/Athens", abbreviation: "EET" },
    { name: "Istanbul", timezone: "Europe/Istanbul", abbreviation: "TRT" },
    { name: "Kiev", timezone: "Europe/Kiev", abbreviation: "EET" },
    
    // Asia
    { name: "Riyadh", timezone: "Asia/Riyadh", abbreviation: "AST" },
    { name: "Tehran", timezone: "Asia/Tehran", abbreviation: "IRST" },
    { name: "Karachi", timezone: "Asia/Karachi", abbreviation: "PKT" },
    { name: "New Delhi", timezone: "Asia/Kolkata", abbreviation: "IST" },
    { name: "Bangalore", timezone: "Asia/Kolkata", abbreviation: "IST" },
    { name: "Colombo", timezone: "Asia/Colombo", abbreviation: "IST" },
    { name: "Dhaka", timezone: "Asia/Dhaka", abbreviation: "BST" },
    { name: "Kathmandu", timezone: "Asia/Kathmandu", abbreviation: "NPT" },
    { name: "Bangkok", timezone: "Asia/Bangkok", abbreviation: "ICT" },
    { name: "Ho Chi Minh City", timezone: "Asia/Ho_Chi_Minh", abbreviation: "ICT" },
    { name: "Jakarta", timezone: "Asia/Jakarta", abbreviation: "WIB" },
    { name: "Kuala Lumpur", timezone: "Asia/Kuala_Lumpur", abbreviation: "MYT" },
    { name: "Manila", timezone: "Asia/Manila", abbreviation: "PHT" },
    { name: "Taipei", timezone: "Asia/Taipei", abbreviation: "CST" },
    { name: "Hong Kong", timezone: "Asia/Hong_Kong", abbreviation: "HKT" },
    { name: "Shanghai", timezone: "Asia/Shanghai", abbreviation: "CST" },
    { name: "Beijing", timezone: "Asia/Shanghai", abbreviation: "CST" },
    { name: "Pyongyang", timezone: "Asia/Pyongyang", abbreviation: "KST" },
    { name: "Osaka", timezone: "Asia/Tokyo", abbreviation: "JST" },
    
    // Africa
    { name: "Cairo", timezone: "Africa/Cairo", abbreviation: "EET" },
    { name: "Lagos", timezone: "Africa/Lagos", abbreviation: "WAT" },
    { name: "Nairobi", timezone: "Africa/Nairobi", abbreviation: "EAT" },
    { name: "Cape Town", timezone: "Africa/Johannesburg", abbreviation: "SAST" },
    { name: "Johannesburg", timezone: "Africa/Johannesburg", abbreviation: "SAST" },
    { name: "Casablanca", timezone: "Africa/Casablanca", abbreviation: "WET" },
    
    // Oceania
    { name: "Perth", timezone: "Australia/Perth", abbreviation: "AWST" },
    { name: "Adelaide", timezone: "Australia/Adelaide", abbreviation: "ACDT" },
    { name: "Brisbane", timezone: "Australia/Brisbane", abbreviation: "AEST" },
    { name: "Auckland", timezone: "Pacific/Auckland", abbreviation: "NZDT" },
    { name: "Wellington", timezone: "Pacific/Auckland", abbreviation: "NZDT" },
    { name: "Fiji", timezone: "Pacific/Fiji", abbreviation: "FJT" },
    { name: "Honolulu", timezone: "Pacific/Honolulu", abbreviation: "HST" },
  ]

  useEffect(() => {
    setWorldClockSettings((prev) => ({
      ...prev,
      style: clockStyle,
      clockSize: clockSize,
      showSeconds: showSeconds,
      showDate: showDate,
    }))
  }, [clockStyle, clockSize, showSeconds, showDate])

  // Search functionality for timezones
  useEffect(() => {
    if (timezoneSearch.trim()) {
      const filtered = allTimezones.filter(tz => 
        tz.name.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
        tz.timezone.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
        tz.abbreviation.toLowerCase().includes(timezoneSearch.toLowerCase())
      ).slice(0, 8) // Limit to 8 results
      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }, [timezoneSearch])

  // Combine predefined and custom timezones
  const allAvailableTimezones = [...timezoneOptions, ...customTimezones]

  // Add custom timezone
  const addCustomTimezone = (timezone: {name: string, timezone: string, abbreviation: string}) => {
    // Check if timezone already exists
    const exists = allAvailableTimezones.some(tz => tz.timezone === timezone.timezone)
    if (!exists) {
      setCustomTimezones(prev => [...prev, timezone])
      toast({
        title: "Timezone Added!",
        description: `${timezone.name} has been added to your timezone list.`
      })
    } else {
      toast({
        title: "Timezone Already Exists",
        description: `${timezone.name} is already in your timezone list.`,
        variant: "destructive"
      })
    }
    setTimezoneSearch("")
    setShowAddTimezone(false)
  }

  // Wheel of Names functions
  const addName = () => {
    if (newName.trim() && !wheelNames.includes(newName.trim())) {
      setWheelNames(prev => [...prev, newName.trim()])
      setNewName("")
      toast({
        title: "Name Added!",
        description: `${newName.trim()} has been added to the wheel.`
      })
    } else if (wheelNames.includes(newName.trim())) {
      toast({
        title: "Name Already Exists",
        description: `${newName.trim()} is already on the wheel.`,
        variant: "destructive"
      })
    }
  }

  const removeName = (nameToRemove: string) => {
    setWheelNames(prev => prev.filter(name => name !== nameToRemove))
    toast({
      title: "Name Removed",
      description: `${nameToRemove} has been removed from the wheel.`
    })
  }

  const spinWheel = () => {
    if (wheelNames.length === 0) {
      toast({
        title: "No Names",
        description: "Add some names to the wheel first!",
        variant: "destructive"
      })
      return
    }

    setIsSpinning(true)
    setSelectedName(null)
    
    // Generate random rotation (multiple full spins + random position)
    const spins = 5 + Math.random() * 5 // 5-10 full rotations
    const finalPosition = Math.random() * 360
    const totalRotation = spinRotation + (spins * 360) + finalPosition
    
    setSpinRotation(totalRotation)
    
    // Calculate which name was selected
    setTimeout(() => {
      const segmentAngle = 360 / wheelNames.length
      const finalAngle = totalRotation % 360
      
      // Debug: Let's use a simple approach
      // Segments start at 0° and go clockwise. Index 0 is at 0°, index 1 at segmentAngle°, etc.
      // After rotation, find which original segment is now at the top (270° position)
      const targetAngle = (270 - finalAngle + 360) % 360
      let selectedIndex = Math.floor(targetAngle / segmentAngle)
      
      // Ensure index is within bounds
      selectedIndex = selectedIndex % wheelNames.length
      if (selectedIndex < 0) selectedIndex += wheelNames.length
      
      const winner = wheelNames[selectedIndex]
      
      setSelectedName(winner)
      setIsSpinning(false)
      setWheelHistory(prev => [{name: winner, timestamp: new Date()}, ...prev.slice(0, 9)]) // Keep last 10
      
      toast({
        title: "🎉 Winner Selected!",
        description: `${winner} has been chosen!`
      })
    }, 3000) // 3 second spin duration
  }

  const clearHistory = () => {
    setWheelHistory([])
    toast({
      title: "History Cleared",
      description: "Wheel history has been cleared."
    })
  }

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

      <div className="relative z-20 p-8">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-8 justify-end">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-right">
              ساعت جهانی
            </h1>
          </div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="relative z-30 flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setClockMode("world")}
            className={`${clockMode === "world" ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            <Clock className="w-4 h-4 ml-2" />
            ساعت جهانی
          </Button>
          <Button
            onClick={() => setClockMode("alarm")}
            className={`${clockMode === "alarm" ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            <AlarmClock className="w-4 h-4 ml-2" />
            زنگ هشدار
          </Button>
          <Button
            onClick={() => setClockMode("timer")}
            className={`${clockMode === "timer" ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            <Timer className="w-4 h-4 ml-2" />
            تایمر
          </Button>
          <Button
            onClick={() => setClockMode("stopwatch")}
            className={`${clockMode === "stopwatch" ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            <Stopwatch className="w-4 h-4 ml-2" />
            کرونومتر
          </Button>
          <Button
            onClick={() => setClockMode("sleep")}
            className={`${clockMode === "sleep" ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            <Bed className="w-4 h-4 ml-2" />
            محاسبه خواب
          </Button>
          <Button
            onClick={() => setClockMode("wheel")}
            className={`${clockMode === "wheel" ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            <Disc3 className="w-4 h-4 ml-2" />
            چرخ نام‌ها
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {clockMode === "world" && (
            <Button
              onClick={() => setLeftSidebarOpen(true)}
              className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
            >
              <Clock className="w-4 h-4 ml-2" />
              مناطق زمانی
            </Button>
          )}

          <Button
            onClick={() => setIsDayMode(!isDayMode)}
            className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            {isDayMode ? <Moon className="w-4 h-4 ml-2" /> : <Sun className="w-4 h-4 ml-2" />}
            {isDayMode ? "شب" : "روز"}
          </Button>

          <Button
            onClick={() => setSidebarOpen(true)}
            className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            <Settings className="w-4 h-4 ml-2" />
            تنظیمات
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
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddTimezone(!showAddTimezone)}
                className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 text-sm`}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
              <Button
                onClick={() => setLeftSidebarOpen(false)}
                className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Add Timezone Search */}
          {showAddTimezone && (
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10" style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}>
              <h3 className={`text-lg font-semibold ${themeStyles.textColor} mb-3`}>Add New Timezone</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cities or timezones..."
                  value={timezoneSearch}
                  onChange={(e) => setTimezoneSearch(e.target.value)}
                  className={`w-full p-3 rounded-lg ${themeStyles.buttonBackground} ${themeStyles.textColor} border border-white/20 placeholder-gray-400`}
                />
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg max-h-64 overflow-y-auto z-50">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => addCustomTimezone(result)}
                        className="w-full p-3 text-left hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                      >
                        <div className={`font-semibold ${themeStyles.textColor}`}>{result.name}</div>
                        <div className={`text-sm ${isDayMode ? themeStyles.textColor + "/70" : "text-gray-300"}`}>
                          {result.timezone} • {result.abbreviation}
                        </div>
                        <div className={`text-xs ${isDayMode ? themeStyles.textColor + "/50" : "text-gray-400"}`}>
                          {formatTimeForClock(new Date(), result.timezone, worldClockSettings.format24h, false)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {timezoneSearch && searchResults.length === 0 && (
                <div className={`text-center py-4 ${isDayMode ? themeStyles.textColor + "/60" : "text-gray-400"}`}>
                  No timezones found matching "{timezoneSearch}"
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            {allAvailableTimezones.map((timezone) => {
              const isSelected = worldClockSettings.selectedTimezones.some((tz) => tz.timezone === timezone.timezone)
              const isCustom = customTimezones.some((tz) => tz.timezone === timezone.timezone)
              
              return (
                <div 
                  key={timezone.timezone} 
                  className={`group relative p-4 rounded-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                    isSelected 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                  style={{
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1" onClick={() => toggleTimezone(timezone)}>
                      <div className={`font-bold text-lg ${themeStyles.textColor} group-hover:text-blue-300 transition-colors flex items-center gap-2`}>
                        {timezone.name}
                        {isCustom && (
                          <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full border border-purple-400/30">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className={`text-sm ${isDayMode ? themeStyles.textColor + "/70" : "text-gray-300"} font-mono`}>
                        {timezone.abbreviation}
                      </div>
                      <div className={`text-xs mt-1 ${isDayMode ? themeStyles.textColor + "/50" : "text-gray-400"}`}>
                        {formatTimeForClock(new Date(), timezone.timezone, worldClockSettings.format24h, false)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Remove custom timezone button */}
                      {isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setCustomTimezones(prev => prev.filter(tz => tz.timezone !== timezone.timezone))
                            // Also remove from selected if it was selected
                            setWorldClockSettings(prev => ({
                              ...prev,
                              selectedTimezones: prev.selectedTimezones.filter(tz => tz.timezone !== timezone.timezone)
                            }))
                            toast({
                              title: "Timezone Removed",
                              description: `${timezone.name} has been removed from your timezone list.`
                            })
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded p-1 text-xs border border-red-400/30"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      
                      {/* Modern Toggle Switch */}
                      <div className="relative" onClick={() => toggleTimezone(timezone)}>
                        <div 
                          className={`w-14 h-7 rounded-full transition-all duration-300 ${
                            isSelected 
                              ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 text-white overflow-hidden' 
                              : 'bg-gray-600/50 border border-gray-500/30'
                          }`}
                        >
                          <div 
                            className={`absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300 transform ${
                              isSelected 
                                ? 'translate-x-7 bg-white shadow-lg' 
                                : 'translate-x-0.5 bg-gray-300'
                            }`}
                            style={{
                              boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                          />
                        </div>
                        
                        {/* Animated ripple effect */}
                        {isSelected && (
                          <div 
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{
                              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                              animationDuration: '2s'
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                  )}
                </div>
              )
            })}
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
                    className={`w-full p-2 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
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
                    className={`w-full p-2 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
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
                <p className="text-xl mb-2">هیچ منطقه زمانی انتخاب نشده</p>
                <p>روی "مناطق زمانی" کلیک کنید تا ساعت اضافه کنید</p>
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
                        <h3 className={`font-bold mb-2 text-blue-400`}>
                          {timezone.name}
                        </h3>
                        {worldClockSettings.style === "digital" ? (
                          <>
                            <div className={`font-mono font-bold mb-1 text-3xl ${isDayMode ? 'text-gray-800' : 'text-white'} drop-shadow-lg`}>
                              {time}
                            </div>
                            {worldClockSettings.showDate && (
                              <div className={`text-sm font-mono tracking-wider ${isDayMode ? 'text-gray-600' : 'text-gray-300'} drop-shadow-md`}>
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
              <h2 className={`text-2xl font-bold mb-8 ${themeStyles.textColor}`}>چرخ نام‌ها</h2>
              <p className={`text-lg mb-6 ${themeStyles.textColor}/80`}>چرخ را بچرخانید تا یک نام به طور تصادفی انتخاب کنید!</p>

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
                  <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textColor}`}>اضافه کردن نام‌ها</h3>
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

        {clockMode === "sleep" && (
          <div className="max-w-2xl mx-auto w-full">
            <div className="mb-8" style={getGlassStyle()}>
              <div className="p-6">
                <div className="flex items-center justify-center mb-6">
                  <Bed className={`w-8 h-8 mr-3 ${themeStyles.textColor}`} />
                  <h2 className={`text-3xl font-bold ${themeStyles.textColor}`}>Sleep Calculator</h2>
                </div>
                
                <div className="text-center mb-6">
                  <p className={`text-sm ${isDayMode ? themeStyles.textColor + "/70" : "text-gray-300"} mb-4`}>
                    Calculate optimal sleep times based on 90-minute sleep cycles
                  </p>
                  
                  <div className="flex justify-center gap-4 mb-6">
                    <Button
                      onClick={() => setSleepMode("bedtime")}
                      className={`${sleepMode === "bedtime" ? "bg-blue-500/30 border-blue-400/50 text-blue-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                    >
                      Calculate Bedtime
                    </Button>
                    <Button
                      onClick={() => setSleepMode("wakeup")}
                      className={`${sleepMode === "wakeup" ? "bg-blue-500/30 border-blue-400/50 text-blue-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                    >
                      Calculate Wake-up Time
                    </Button>
                  </div>
                </div>

                {sleepMode === "bedtime" ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className={`text-xl font-semibold mb-4 ${themeStyles.textColor}`}>
                        What time do you want to wake up?
                      </h3>
                      <div className="flex justify-center items-center gap-4">
                        <input
                          type="time"
                          value={wakeUpTime}
                          onChange={(e) => setWakeUpTime(e.target.value)}
                          className={`px-4 py-3 text-2xl font-mono rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder} text-center`}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <Button
                        onClick={calculateSleepTimes}
                        className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 text-lg px-8 py-3`}
                      >
                        Calculate Bedtime
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className={`text-xl font-semibold mb-4 ${themeStyles.textColor}`}>
                        If you want to go to bed now...
                      </h3>
                      <div className="flex justify-center items-center gap-4">
                        <input
                          type="time"
                          value={bedTime}
                          onChange={(e) => setBedTime(e.target.value)}
                          className={`px-4 py-3 text-2xl font-mono rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder} text-center`}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <Button
                        onClick={calculateSleepTimes}
                        className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 text-lg px-8 py-3`}
                      >
                        Calculate Wake-up Time
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {sleepResults && (
              <div className="space-y-4">
                {sleepResults.bedtimes.length > 0 && (
                  <div className="p-6" style={getGlassStyle()}>
                    <h3 className={`text-xl font-semibold mb-4 ${themeStyles.textColor} text-center`}>
                      💤 Recommended Bedtimes
                    </h3>
                    <p className={`text-sm ${isDayMode ? themeStyles.textColor + "/70" : "text-gray-300"} mb-4 text-center`}>
                      To wake up at {wakeUpTime}, you should go to bed at:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sleepResults.bedtimes.map((bedtime, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg text-center ${themeStyles.buttonBackground} border ${themeStyles.sidebarBorder}`}
                        >
                          <div className={`text-2xl font-mono font-bold ${themeStyles.textColor} mb-1`}>
                            {bedtime.split(" (")[0]}
                          </div>
                          <div className={`text-sm ${isDayMode ? themeStyles.textColor + "/70" : "text-gray-300"}`}>
                            {bedtime.split(" (")[1]?.replace(")", "")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sleepResults.wakeupTimes.length > 0 && (
                  <div className="p-6" style={getGlassStyle()}>
                    <h3 className={`text-xl font-semibold mb-4 ${themeStyles.textColor} text-center`}>
                      ☀️ Recommended Wake-up Times
                    </h3>
                    <p className={`text-sm ${isDayMode ? themeStyles.textColor + "/70" : "text-gray-300"} mb-4 text-center`}>
                      If you go to bed at {bedTime}, you should wake up at:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sleepResults.wakeupTimes.map((wakeupTime, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg text-center ${themeStyles.buttonBackground} border ${themeStyles.sidebarBorder}`}
                        >
                          <div className={`text-2xl font-mono font-bold ${themeStyles.textColor} mb-1`}>
                            {wakeupTime.split(" (")[0]}
                          </div>
                          <div className={`text-sm ${isDayMode ? themeStyles.textColor + "/70" : "text-gray-300"}`}>
                            {wakeupTime.split(" (")[1]?.replace(")", "")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4" style={getGlassStyle()}>
                  <div className="text-center">
                    <h4 className={`text-lg font-semibold ${themeStyles.textColor}`}>💡 Sleep Tips</h4>
                    <div className={`text-sm ${isDayMode ? themeStyles.textColor + "/70" : "text-gray-300"} space-y-1`}>
                      <p>• Each sleep cycle lasts about 90 minutes</p>
                      <p>• Waking up at the end of a cycle helps you feel more refreshed</p>
                      <p>• It typically takes 15 minutes to fall asleep</p>
                      <p>• Most adults need 4-6 complete sleep cycles (6-9 hours)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {clockMode === "wheel" && (
          <div className="max-w-4xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Wheel Container */}
              <div className="lg:col-span-2">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <Disc3 className={`w-8 h-8 mr-3 ${themeStyles.textColor}`} />
                    <h2 className={`text-3xl font-bold ${themeStyles.textColor}`}>Wheel of Names</h2>
                  </div>
                  <p className={`text-sm ${isDayMode ? themeStyles.textColor + "/70" : "text-gray-300"}`}>
                    Spin the wheel to randomly select a name!
                  </p>
                </div>

                {/* Wheel SVG */}
                <div className="relative flex justify-center items-center mb-8">
                  <div className="relative">
                    {/* Pointer */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500 drop-shadow-lg"></div>
                    </div>
                    
                    {/* Wheel */}
                    <svg
                      width="400"
                      height="400"
                      className="drop-shadow-2xl"
                      style={{
                        transform: `rotate(${spinRotation}deg)`,
                        transition: isSpinning ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
                      }}
                    >
                      {wheelNames.map((name, index) => {
                        const segmentAngle = 360 / wheelNames.length
                        const startAngle = index * segmentAngle
                        const endAngle = (index + 1) * segmentAngle
                        
                        // Calculate path for segment
                        const centerX = 200
                        const centerY = 200
                        const radius = 180
                        const innerRadius = 40
                        
                        const startAngleRad = (startAngle * Math.PI) / 180
                        const endAngleRad = (endAngle * Math.PI) / 180
                        
                        const x1 = centerX + radius * Math.cos(startAngleRad)
                        const y1 = centerY + radius * Math.sin(startAngleRad)
                        const x2 = centerX + radius * Math.cos(endAngleRad)
                        const y2 = centerY + radius * Math.sin(endAngleRad)
                        
                        const x3 = centerX + innerRadius * Math.cos(endAngleRad)
                        const y3 = centerY + innerRadius * Math.sin(endAngleRad)
                        const x4 = centerX + innerRadius * Math.cos(startAngleRad)
                        const y4 = centerY + innerRadius * Math.sin(startAngleRad)
                        
                        const largeArcFlag = segmentAngle > 180 ? 1 : 0
                        
                        const pathData = [
                          `M ${x4} ${y4}`,
                          `L ${x1} ${y1}`,
                          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          `L ${x3} ${y3}`,
                          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                          'Z'
                        ].join(' ')
                        
                        // Colors for segments
                        const colors = [
                          '#ef4444', '#f97316', '#eab308', '#22c55e', 
                          '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
                        ]
                        const color = colors[index % colors.length]
                        
                        // Text position
                        const textAngle = startAngle + segmentAngle / 2
                        const textRadius = (radius + innerRadius) / 2
                        const textX = centerX + textRadius * Math.cos((textAngle * Math.PI) / 180)
                        const textY = centerY + textRadius * Math.sin((textAngle * Math.PI) / 180)
                        
                        return (
                          <g key={name}>
                            <path
                              d={pathData}
                              fill={color}
                              stroke="white"
                              strokeWidth="2"
                              className="drop-shadow-sm"
                            />
                            <text
                              x={textX}
                              y={textY}
                              fill="white"
                              fontSize="16"
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline="central"
                              transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                              className="drop-shadow-sm select-none"
                            >
                              {name}
                            </text>
                          </g>
                        )
                      })}
                      
                      {/* Center circle */}
                      <circle
                        cx="200"
                        cy="200"
                        r="40"
                        fill="white"
                        stroke="#374151"
                        strokeWidth="3"
                        className="drop-shadow-lg"
                      />
                      
                      {/* Center logo */}
                      <text
                        x="200"
                        y="200"
                        fill="#374151"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="select-none"
                      >
                        SPIN
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Spin Button */}
                <div className="text-center mb-8">
                  <Button
                    onClick={spinWheel}
                    disabled={isSpinning || wheelNames.length === 0}
                    className={`text-xl px-8 py-4 ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 disabled:opacity-50`}
                  >
                    {isSpinning ? (
                      <>
                        <div className="animate-spin w-6 h-6 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                        Spinning...
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6 mr-3" />
                        چرخاندن چرخ!
                      </>
                    )}
                  </Button>
                </div>

                {/* Winner Display */}
                {selectedName && (
                  <div className="text-center p-6 rounded-xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 mb-8" style={{
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}>
                    <h3 className={`text-2xl font-bold ${themeStyles.textColor} mb-2`}>🎉 برنده!</h3>
                    <p className={`text-4xl font-bold text-green-400 animate-pulse`}>{selectedName}</p>
                  </div>
                )}
              </div>

              {/* Controls Panel */}
              <div className="space-y-6">
                {/* Add Name */}
                <div className="p-6 rounded-xl" style={getGlassStyle()}>
                  <h3 className={`text-lg font-semibold ${themeStyles.textColor} mb-4`}>اضافه کردن نام‌ها</h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="یک نام وارد کنید..."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addName()}
                      className={`flex-1 px-3 py-2 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border border-white/20 placeholder-gray-400`}
                    />
                    <Button
                      onClick={addName}
                      className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Names List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {wheelNames.map((name, index) => (
                      <div
                        key={name}
                        className={`flex items-center justify-between p-2 rounded ${themeStyles.buttonBackground} border border-white/10`}
                      >
                        <span className={`${themeStyles.textColor}`}>{name}</span>
                        <button
                          onClick={() => removeName(name)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {wheelNames.length === 0 && (
                    <div className={`text-center py-4 ${isDayMode ? themeStyles.textColor + "/60" : "text-gray-400"}`}>
                      <Disc3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No names added yet</p>
                    </div>
                  )}
                </div>

                {/* History */}
                <div className="p-6 rounded-xl" style={getGlassStyle()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${themeStyles.textColor}`}>Recent Winners</h3>
                    {wheelHistory.length > 0 && (
                      <Button
                        onClick={clearHistory}
                        size="sm"
                        className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {wheelHistory.map((entry, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded ${themeStyles.buttonBackground} border border-white/10`}
                      >
                        <span className={`font-semibold ${themeStyles.textColor}`}>{entry.name}</span>
                        <span className={`text-xs ${isDayMode ? themeStyles.textColor + "/60" : "text-gray-400"}`}>
                          {entry.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {wheelHistory.length === 0 && (
                    <div className={`text-center py-4 ${isDayMode ? themeStyles.textColor + "/60" : "text-gray-400"}`}>
                      <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No spins yet</p>
                    </div>
                  )}
                </div>
              </div>
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
