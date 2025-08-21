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
  Radio,
  Eye,
  ExternalLink,
  Maximize2,
  Minimize2,
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

interface LiveStream {
  id: string
  title: string
  streamer: string
  platform: 'twitch' | 'youtube' | 'kick'
  category: string
  viewers: number
  thumbnail: string
  url: string
  startedAt: string
  isLive: boolean
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
  const [clockMode, setClockMode] = useState<"world" | "alarm" | "timer" | "stopwatch" | "sleep" | "wheel" | "live">("world")

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
  const [wheelNames, setWheelNames] = useState<string[]>(["Ali", "Charles", "Diya", "Eric", "Fatima", "Gabriel", "Hanna"])
  const [newName, setNewName] = useState("")
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [spinRotation, setSpinRotation] = useState(0)
  const [wheelHistory, setWheelHistory] = useState<Array<{name: string, timestamp: Date}>>([])
  const [showWheelHistory, setShowWheelHistory] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Live streams state
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("crypto")
  const [isLoadingStreams, setIsLoadingStreams] = useState(false)
  const [streamsError, setStreamsError] = useState<string | null>(null)
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "multi">("grid")
  const [selectedStreams, setSelectedStreams] = useState<LiveStream[]>([])

  // Timezone management
  const [availableTimezones, setAvailableTimezones] = useState([
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

        // Check alarms
        checkAlarms()
      },
      timerRunning ? 1000 : stopwatchRunning ? 10 : 1000,
    )

    return () => clearInterval(timer)
  }, [timerRunning, timerTimeLeft, stopwatchRunning])

  // Check if any alarms should go off
  const checkAlarms = () => {
    const now = new Date()
    const currentTimeString = now.toTimeString().slice(0, 5)
    
    alarms.forEach((alarm) => {
      if (alarm.enabled && alarm.time === currentTimeString) {
        triggerAlarm(alarm)
      }
    })
  }

  // Trigger alarm with sound and notification
  const triggerAlarm = (alarm: any) => {
    // Show notification
    toast({ 
      title: "Alarm!", 
      description: `Time to wake up! ${alarm.label ? `(${alarm.label})` : ''}`,
      duration: 10000 // 10 seconds
    })

    // Play alarm sound
    playAlarmSound()

    // Show browser notification if permission granted
    if (Notification.permission === "granted") {
      new Notification("Alarm!", {
        body: `Time to wake up! ${alarm.label ? `(${alarm.label})` : ''}`,
        icon: "/favicon.ico"
      })
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission()
    }
  }

  // Play alarm sound
  const playAlarmSound = () => {
    try {
      // Create audio context for alarm sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 3)
    } catch (error) {
      console.log("Could not play alarm sound:", error)
    }
  }

  // Timer functions
  const startTimer = () => {
    if (timerMinutes > 0 || timerSeconds > 0) {
      setTimerTimeLeft(timerMinutes * 60 + timerSeconds)
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

  // Stopwatch functions
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
    if (sleepMode === "bedtime") {
      // Calculate bedtimes based on wake up time
      const wakeTime = new Date(`2000-01-01 ${wakeUpTime}:00`)
      const bedtimes = []
      
      // Calculate for 4-6 sleep cycles (6-9 hours)
      for (let cycles = 4; cycles <= 6; cycles++) {
        const sleepTime = new Date(wakeTime)
        sleepTime.setMinutes(sleepTime.getMinutes() - (cycles * 90 + 15)) // 90 min per cycle + 15 min to fall asleep
        
        const timeStr = sleepTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
        bedtimes.push(`${timeStr} (${cycles} cycles - ${cycles * 1.5}h sleep)`)
      }
      
      setSleepResults({ bedtimes, wakeupTimes: [], cycles: 0 })
    } else {
      // Calculate wake up times based on bedtime
      const bedTimeDate = new Date(`2000-01-01 ${bedTime}:00`)
      const wakeupTimes = []
      
      // Calculate for 4-6 sleep cycles
      for (let cycles = 4; cycles <= 6; cycles++) {
        const wakeTime = new Date(bedTimeDate)
        wakeTime.setMinutes(wakeTime.getMinutes() + (cycles * 90 + 15)) // 90 min per cycle + 15 min to fall asleep
        
        // Handle next day
        if (wakeTime.getDate() !== bedTimeDate.getDate()) {
          wakeTime.setDate(wakeTime.getDate() + 1)
        }
        
        const timeStr = wakeTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
        wakeupTimes.push(`${timeStr} (${cycles} cycles - ${cycles * 1.5}h sleep)`)
      }
      
      setSleepResults({ bedtimes: [], wakeupTimes, cycles: 0 })
    }
  }

  // Wheel functions
  const addName = () => {
    if (newName.trim() && !wheelNames.includes(newName.trim())) {
      setWheelNames([...wheelNames, newName.trim()])
      setNewName("")
    }
  }

  const removeName = (nameToRemove: string) => {
    setWheelNames(wheelNames.filter(name => name !== nameToRemove))
  }

  const spinWheel = () => {
    if (isSpinning || wheelNames.length === 0) return
    
    setIsSpinning(true)
    setSelectedName(null)
    
    // Generate random rotation (multiple full rotations + random final position)
    const randomRotation = 1440 + Math.random() * 1440 // 4-8 full rotations
    setSpinRotation(prev => prev + randomRotation)
    
    setTimeout(() => {
      // Calculate which name was selected
      const segmentAngle = 360 / wheelNames.length
      const finalAngle = (spinRotation + randomRotation) % 360
      const selectedIndex = Math.floor((360 - finalAngle) / segmentAngle) % wheelNames.length
      const selected = wheelNames[selectedIndex]
      
      setSelectedName(selected)
      setWheelHistory(prev => [{ name: selected, timestamp: new Date() }, ...prev.slice(0, 9)]) // Keep only last 10
      setIsSpinning(false)
    }, 3000)
  }

  const clearHistory = () => {
    setWheelHistory([])
  }

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

  const toggleTheme = () => {
    setIsDayMode(!isDayMode)
  }

  // Add missing alarm functions
  const addAlarm = () => {
    if (newAlarmTime && newAlarmLabel) {
      const newAlarm = {
        id: Date.now().toString(),
        time: newAlarmTime,
        label: newAlarmLabel,
        enabled: true,
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      }
      setAlarms((prev) => [...prev, newAlarm])
      setNewAlarmTime("07:00")
      setNewAlarmLabel("")
      toast({ title: "Alarm added", description: `Alarm set for ${newAlarmTime}` })
    }
  }

  const deleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id))
  }

  const toggleAlarm = (id: string) => {
    setAlarms((prev) => prev.map((alarm) => alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm))
  }

  // Fetch live streams by category
  const fetchLiveStreams = async (category: string) => {
    setIsLoadingStreams(true)
    setStreamsError(null)
    
    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch(`/api/live?category=${category}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch streams')
      }
      
      const data = await response.json()
      setLiveStreams(data.streams || [])
    } catch (error) {
      console.error('Error fetching streams:', error)
      setStreamsError('Failed to load live streams')
      
      // Fallback mock data for demonstration
      const mockStreams = generateMockStreams(category)
      setLiveStreams(mockStreams)
    } finally {
      setIsLoadingStreams(false)
    }
  }

  // Generate mock streams for demonstration
  const generateMockStreams = (category: string): LiveStream[] => {
    const platforms: ('twitch' | 'youtube' | 'kick')[] = ['twitch', 'youtube', 'kick']
    const mockData = {
      crypto: [
        { title: "Bitcoin Analysis Live", streamer: "CryptoGuru", viewers: 15420 },
        { title: "ETH Price Action", streamer: "DeFiMaster", viewers: 8920 },
        { title: "Altcoin Review", streamer: "CoinTrader", viewers: 5670 },
        { title: "NFT Market Update", streamer: "NFTCollector", viewers: 4320 },
        { title: "DeFi Protocols", streamer: "YieldFarmer", viewers: 3450 },
        { title: "Crypto News Hour", streamer: "CryptoNews", viewers: 6780 }
      ],
      stocks: [
        { title: "Market Open Analysis", streamer: "StockTrader", viewers: 12340 },
        { title: "S&P 500 Watch", streamer: "MarketGuru", viewers: 9870 },
        { title: "Tech Stocks Review", streamer: "TechInvestor", viewers: 7650 },
        { title: "Options Trading", streamer: "OptionsPro", viewers: 5430 },
        { title: "Dividend Stocks", streamer: "DividendKing", viewers: 4320 },
        { title: "Market Close", streamer: "ClosingBell", viewers: 8760 }
      ],
      gaming: [
        { title: "Valorant Ranked", streamer: "ProGamer", viewers: 45670 },
        { title: "League of Legends", streamer: "LoLMaster", viewers: 34560 },
        { title: "Fortnite Battle Royale", streamer: "FortnitePro", viewers: 23450 },
        { title: "Minecraft Survival", streamer: "BlockBuilder", viewers: 12340 },
        { title: "CS:GO Tournament", streamer: "CSGOCaster", viewers: 56780 },
        { title: "Among Us with Friends", streamer: "Imposter", viewers: 9870 }
      ],
      music: [
        { title: "Piano Concert Live", streamer: "PianoMaster", viewers: 2340 },
        { title: "Guitar Lessons", streamer: "GuitarTeacher", viewers: 1870 },
        { title: "Jazz Improvisation", streamer: "JazzArtist", viewers: 1230 },
        { title: "Classical Music", streamer: "ClassicalPro", viewers: 980 },
        { title: "Rock Band Practice", streamer: "RockBand", viewers: 3450 },
        { title: "Electronic Music", streamer: "EDMProducer", viewers: 5670 }
      ],
      news: [
        { title: "Breaking News", streamer: "NewsAnchor", viewers: 45670 },
        { title: "Political Analysis", streamer: "PoliticsPro", viewers: 23450 },
        { title: "Tech News Update", streamer: "TechReporter", viewers: 18760 },
        { title: "Sports Highlights", streamer: "SportsCaster", viewers: 34560 },
        { title: "Weather Report", streamer: "WeatherMan", viewers: 12340 },
        { title: "Business News", streamer: "BusinessReporter", viewers: 29870 }
      ]
    }

    const categoryData = mockData[category as keyof typeof mockData] || mockData.crypto
    
    return categoryData.map((stream, index) => ({
      id: `${category}-${index}`,
      title: stream.title,
      streamer: stream.streamer,
      platform: platforms[index % platforms.length],
      category,
      viewers: stream.viewers,
      thumbnail: `https://picsum.photos/320/180?random=${index}`,
      url: `https://example.com/stream/${stream.streamer.toLowerCase()}`,
      startedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      isLive: true
    }))
  }

  // Watch live stream
  const watchLiveStream = (stream: LiveStream) => {
    setSelectedStream(stream)
    setIsPlayerOpen(true)
    
    toast({
      title: "Opening Stream",
      description: `Opening ${stream.title} by ${stream.streamer}`,
    })
  }



  // Close player modal
  const closePlayer = () => {
    setIsPlayerOpen(false)
    setSelectedStream(null)
  }

  // Get embed URL for different platforms
  const getEmbedUrl = (stream: LiveStream): string => {
    try {
      switch (stream.platform) {
        case 'twitch':
          // Twitch embed format: https://player.twitch.tv/?channel=CHANNEL_NAME&parent=YOUR_DOMAIN
          const twitchChannel = stream.url.split('/').pop() || stream.streamer.toLowerCase()
          
          // Get the current domain for Twitch parent parameter
          // According to Twitch docs: parent must be the exact domain where the embed is hosted
          const currentDomain = window.location.hostname || 'localhost'
          
          // Twitch requires the parent domain to be exact and accessible
          // For development, we'll use localhost, but this may still fail due to Twitch restrictions
          return `https://player.twitch.tv/?channel=${twitchChannel}&parent=${currentDomain}&autoplay=true&muted=false`
        
        case 'youtube':
          // YouTube embed format: https://www.youtube.com/embed/VIDEO_ID
          let videoId = ''
          
          // Handle different YouTube URL formats
          if (stream.url.includes('youtube.com/watch?v=')) {
            videoId = stream.url.split('v=')[1]?.split('&')[0] || ''
          } else if (stream.url.includes('youtu.be/')) {
            videoId = stream.url.split('youtu.be/')[1]?.split('?')[0] || ''
          } else if (stream.url.includes('youtube.com/embed/')) {
            videoId = stream.url.split('youtube.com/embed/')[1]?.split('?')[0] || ''
          }
          
          // Validate video ID (should be 11 characters)
          if (videoId && videoId.length === 11) {
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
          } else {
            console.warn('Invalid YouTube video ID:', videoId)
            // Fallback to a working demo video
            return 'https://www.youtube.com/embed/jNQXAC9IVRw?autoplay=1&rel=0&modestbranding=1'
          }
        
        case 'kick':
          // Kick embed format: https://player.kick.com/CHANNEL_NAME
          // According to Kick docs: https://help.kick.com/en/articles/8010826-how-to-embed-your-kick-livestream
          const kickChannel = stream.url.split('/').pop() || stream.streamer.toLowerCase()
          return `https://player.kick.com/${kickChannel}?autoplay=1&muted=0`
        
        default:
          return stream.url
      }
    } catch (error) {
      console.error('Error generating embed URL:', error)
      // Fallback to a working demo
      return 'https://www.youtube.com/embed/jNQXAC9IVRw?autoplay=1&rel=0&modestbranding=1'
    }
  }



  // Handle iframe load error
  const handleIframeError = (stream: LiveStream) => {
    if (stream.platform === 'twitch') {
      toast({
        title: "Twitch Embed Failed",
        description: "Twitch requires domain verification. This is common in development. Use the 'Watch on Twitch' button instead.",
        variant: "destructive",
        duration: 10000,
      })
      
      // Log detailed error for debugging
      console.warn('Twitch embed failed. This is likely due to:', {
        reason: 'Domain verification required by Twitch',
        currentDomain: window.location.hostname,
        streamUrl: stream.url,
        embedUrl: getEmbedUrl(stream),
        solution: 'Use production domain or watch directly on Twitch'
      })
    } else {
      toast({
        title: "Embedding Failed",
        description: `Could not load ${stream.platform} stream. Opening in new tab instead.`,
        variant: "destructive",
      })
    }
    
    // Don't automatically close player for Twitch - let user choose
    if (stream.platform !== 'twitch') {
      window.open(stream.url, '_blank')
      closePlayer()
    }
  }

  // Handle iframe load success
  const handleIframeLoad = (stream: LiveStream) => {
    // Hide loading indicator when iframe loads
    const loadingIndicator = document.querySelector('.loading-indicator')
    if (loadingIndicator) {
      loadingIndicator.classList.add('opacity-0')
      setTimeout(() => loadingIndicator.remove(), 300)
    }
    
    // Log successful load
    console.log(`Successfully loaded ${stream.platform} stream:`, stream.title)
  }

  // Auto-pick random stream from category
  const autoPickStream = () => {
    if (liveStreams.length === 0) return
    
    const randomIndex = Math.floor(Math.random() * liveStreams.length)
    const randomStream = liveStreams[randomIndex]
    watchLiveStream(randomStream)
  }

  // Format viewer count
  const formatViewers = (viewers: number): string => {
    if (viewers >= 1000000) {
      return `${(viewers / 1000000).toFixed(1)}M`
    } else if (viewers >= 1000) {
      return `${(viewers / 1000).toFixed(1)}K`
    }
    return viewers.toString()
  }

  // Format stream duration
  const formatStreamDuration = (startedAt: string): string => {
    const start = new Date(startedAt)
    const now = new Date()
    const diff = now.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Get platform icon and color
  const getPlatformInfo = (platform: string) => {
    switch (platform) {
      case 'twitch':
        return { icon: '🎮', color: 'text-purple-400', bg: 'bg-purple-500/20' }
      case 'youtube':
        return { icon: '📺', color: 'text-red-400', bg: 'bg-red-500/20' }
      case 'kick':
        return { icon: '⚡', color: 'text-green-400', bg: 'bg-green-500/20' }
      default:
        return { icon: '📡', color: 'text-blue-400', bg: 'bg-blue-500/20' }
    }
  }

  // Fetch streams when category changes
  useEffect(() => {
    if (clockMode === "live") {
      fetchLiveStreams(selectedCategory)
    }
  }, [selectedCategory, clockMode])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isPlayerOpen) {
        closePlayer()
      }
    }

    if (isPlayerOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isPlayerOpen])

  // Add stream to multi-view
  const addToMultiView = (stream: LiveStream) => {
    if (selectedStreams.length >= 4) {
      toast({
        title: "Multi-view Full",
        description: "Maximum 4 streams allowed in multi-view mode.",
        variant: "destructive",
      })
      return
    }
    
    if (selectedStreams.find(s => s.id === stream.id)) {
      toast({
        title: "Stream Already Added",
        description: "This stream is already in multi-view mode.",
      })
      return
    }
    
    setSelectedStreams(prev => [...prev, stream])
    toast({
      title: "Added to Multi-view",
      description: `${stream.title} added to multi-view mode.`,
    })
  }

  // Remove stream from multi-view
  const removeFromMultiView = (streamId: string) => {
    setSelectedStreams(prev => prev.filter(s => s.id !== streamId))
  }

  // Clear all streams from multi-view
  const clearMultiView = () => {
    setSelectedStreams([])
  }

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
    <div className={`min-h-screen flex flex-col ${isDayMode ? 'bg-gradient-to-br from-blue-50 to-blue-100' : 'bg-gradient-to-br from-gray-900 to-gray-800'}`}>
      <div className="container mx-auto px-4 py-8 flex-grow">
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
            <Button
              onClick={() => setClockMode("sleep")}
              className={`${clockMode === "sleep" ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
            >
              <Bed className="w-4 h-4 mr-2" />
              Sleep Calculator
            </Button>
            <Button
              onClick={() => setClockMode("wheel")}
              className={`${clockMode === "wheel" ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
            >
              <Disc3 className="w-4 h-4 mr-2" />
              Wheel
            </Button>
            <Button
              onClick={() => setClockMode("live")}
              className={`${clockMode === "live" ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300" : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
            >
              <Radio className="w-4 h-4 mr-2" />
              Live Streams
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
              onClick={() => setSettingsOpen(true)}
              className={`p-2 rounded-full ${themeStyles.buttonBackground} transition-all duration-300`}
              aria-label="Open settings"
            >
              <Settings className="w-5 h-5" />
            </Button>

            <Button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${themeStyles.buttonBackground} transition-all duration-300`}
              aria-label="Toggle dark mode"
            >
              {isDayMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            
          </div>
        </div>

        {/* World Clock Component */}
        {clockMode === "world" && (
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
        )}

        {/* Alarm Component */}
        {clockMode === "alarm" && (
          <div className="max-w-2xl mx-auto w-full">
            <div className="p-6" style={getGlassStyle()}>
              <div className="text-center mb-6">
                <AlarmClock className={`w-8 h-8 mx-auto mb-3 ${themeStyles.textColor}`} />
                <h2 className={`text-3xl font-bold ${themeStyles.textColor}`}>Alarm Clock</h2>
              </div>

              <div className="space-y-6">
                {/* Set Alarm */}
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textColor}`}>Set New Alarm</h3>
                  <div className="flex flex-col gap-4 mb-4">
                    <input
                      type="time"
                      value={newAlarmTime}
                      onChange={(e) => setNewAlarmTime(e.target.value)}
                      className={`px-4 py-3 text-2xl font-mono rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder} text-center`}
                    />
                    <input
                      type="text"
                      placeholder="Alarm label (optional)"
                      value={newAlarmLabel}
                      onChange={(e) => setNewAlarmLabel(e.target.value)}
                      className={`px-4 py-3 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder} text-center`}
                    />
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${themeStyles.textColor}`}>Sound:</span>
                      <select 
                        className={`px-3 py-2 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
                        defaultValue="beep"
                      >
                        <option value="beep">Beep</option>
                        <option value="chime">Chime</option>
                        <option value="bell">Bell</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={addAlarm}
                      className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                    >
                      Set Alarm
                    </Button>
                    <Button
                      onClick={() => triggerAlarm({ time: "Test", label: "Test Alarm" })}
                      variant="outline"
                      className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                    >
                      Test Alarm
                    </Button>
                  </div>
                </div>

                {/* Active Alarms */}
                {alarms.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textColor}`}>Active Alarms</h3>
                    <div className="space-y-2">
                      {alarms.map((alarm, index) => (
                        <div key={index} className={`flex items-center justify-between p-3 rounded ${themeStyles.buttonBackground} border border-white/10`}>
                          <div className="flex flex-col">
                            <span className={`font-mono ${themeStyles.textColor}`}>{alarm.time}</span>
                            {alarm.label && (
                              <span className={`text-sm ${themeStyles.textColor} opacity-70`}>{alarm.label}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => toggleAlarm(alarm.id)}
                              size="sm"
                              className={`${alarm.enabled ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-gray-300'}`}
                            >
                              {alarm.enabled ? '✓' : '✗'}
                            </Button>
                            <Button
                              onClick={() => deleteAlarm(alarm.id)}
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timer Component */}
        {clockMode === "timer" && (
          <div className="max-w-2xl mx-auto w-full">
            <div className="p-6" style={getGlassStyle()}>
              <div className="text-center mb-6">
                <Timer className={`w-8 h-8 mx-auto mb-3 ${themeStyles.textColor}`} />
                <h2 className={`text-3xl font-bold ${themeStyles.textColor}`}>Timer</h2>
              </div>

              <div className="space-y-6">
                {/* Timer Display */}
                <div className="text-center">
                  <div className={`text-6xl font-mono font-bold mb-6 ${themeStyles.textColor}`}>
                    {formatTimerTime(timerTimeLeft)}
                  </div>
                </div>

                {/* Timer Input */}
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textColor}`}>Set Timer</h3>
                  <div className="flex justify-center items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 0)}
                        className={`w-20 px-3 py-2 text-center rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
                      />
                      <span className={`${themeStyles.textColor}`}>min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={timerSeconds}
                        onChange={(e) => setTimerSeconds(parseInt(e.target.value) || 0)}
                        className={`w-20 px-3 py-2 text-center rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
                      />
                      <span className={`${themeStyles.textColor}`}>sec</span>
                    </div>
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={startTimer}
                    disabled={timerRunning || (timerMinutes === 0 && timerSeconds === 0)}
                    className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 disabled:opacity-50`}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                  <Button
                    onClick={pauseTimer}
                    disabled={!timerRunning}
                    className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 disabled:opacity-50`}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
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
                    <h4 className={`text-lg font-semibold mb-2 ${themeStyles.textColor}`}>💡 Sleep Tips</h4>
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
                        Spin the Wheel!
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
                    <h3 className={`text-2xl font-bold ${themeStyles.textColor} mb-2`}>🎉 Winner!</h3>
                    <p className={`text-4xl font-bold text-green-400 animate-pulse`}>{selectedName}</p>
                  </div>
                )}
              </div>

              {/* Controls Panel */}
              <div className="space-y-6">
                {/* Add Name */}
                <div className="p-6 rounded-xl" style={getGlassStyle()}>
                  <h3 className={`text-lg font-semibold ${themeStyles.textColor} mb-4`}>Add Names</h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Enter a name..."
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

        {/* Live Streams Component */}
        {clockMode === "live" && (
          <div className="max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Radio className={`w-8 h-8 mr-3 ${themeStyles.textColor}`} />
                <h2 className={`text-3xl font-bold ${themeStyles.textColor}`}>Live Streams</h2>
              </div>
              <p className={`text-sm ${isDayMode ? themeStyles.textColor + "/70" : "text-gray-300"}`}>
                Watch live streams from Twitch, YouTube, and Kick across different categories
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['crypto', 'stocks', 'gaming', 'music', 'news', 'sports'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* English Content Notice */}
            <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className={`text-sm ${themeStyles.textColor} text-center`}>
                🌍 <strong>English Content Only:</strong> All streams are filtered to show English-language content for better user experience.
              </p>
            </div>

            {/* Auto-pick Button */}
            <div className="text-center mb-8">
              <Button
                onClick={autoPickStream}
                disabled={liveStreams.length === 0}
                className={`px-8 py-4 text-lg ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 disabled:opacity-50 hover:scale-105 transition-transform`}
              >
                <Eye className="w-5 h-5 mr-2" />
                Watch Live - Auto-pick from {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              </Button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className="flex gap-2 p-1 rounded-xl" style={{
                background: themeStyles.glassBackground,
                backdropFilter: `blur(${settings.blur}px)`,
                border: `1px solid ${themeStyles.borderColor}`,
              }}>
                <Button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300 shadow-lg"
                      : `${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 hover:bg-white/30`
                  }`}
                >
                  <Radio className="w-4 h-4 mr-2" />
                  Grid View
                </Button>
                <Button
                  onClick={() => setViewMode("multi")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    viewMode === "multi"
                      ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-300 shadow-lg"
                      : `${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 hover:bg-white/30`
                  }`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Multi-View ({selectedStreams.length}/4)
                </Button>
              </div>
            </div>

            {/* Multi-View Mode */}
            {viewMode === "multi" && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold ${themeStyles.textColor}`}>Multi-Stream View</h3>
                  {selectedStreams.length > 0 && (
                    <Button
                      onClick={clearMultiView}
                      variant="outline"
                      className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
                
                {selectedStreams.length === 0 ? (
                  <div className="text-center py-8 p-6 rounded-xl" style={getGlassStyle()}>
                    <Eye className={`w-16 h-16 mx-auto mb-4 opacity-50 ${themeStyles.textColor}`} />
                    <p className={`${themeStyles.textColor} opacity-70 mb-4`}>No streams selected for multi-view</p>
                    <p className={`text-sm ${themeStyles.textColor} opacity-50`}>Click the "+" button on any stream card to add it to multi-view mode</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedStreams.map((stream, index) => (
                      <div key={stream.id} className="relative">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <iframe
                            src={getEmbedUrl(stream)}
                            className="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay; encrypted-media; picture-in-picture"
                            title={stream.title}
                            onError={() => handleIframeError(stream)}
                            onLoad={() => handleIframeLoad(stream)}
                          />
                        </div>
                        <div className="absolute top-2 right-2">
                          <Button
                            onClick={() => removeFromMultiView(stream.id)}
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 p-0 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="mt-2 p-3 rounded-lg" style={getGlassStyle()}>
                          <h4 className={`font-semibold ${themeStyles.textColor} text-sm line-clamp-1`}>
                            {stream.title}
                          </h4>
                          <p className={`text-xs ${themeStyles.textColor} opacity-70`}>
                            {stream.streamer} • {formatViewers(stream.viewers)} viewers
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Streams Grid */}
            {viewMode === "grid" && (
              <div className="space-y-6">
                {isLoadingStreams ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className={`${themeStyles.textColor}`}>Loading live streams...</p>
                  </div>
                ) : streamsError ? (
                  <div className="text-center py-12">
                    <p className={`${themeStyles.textColor} text-red-400`}>{streamsError}</p>
                    <p className={`${themeStyles.textColor} opacity-70 mt-2`}>Showing demo data instead</p>
                  </div>
                ) : liveStreams.length === 0 ? (
                  <div className="text-center py-12">
                    <Radio className={`w-16 h-16 mx-auto mb-4 opacity-50 ${themeStyles.textColor}`} />
                    <p className={`${themeStyles.textColor} opacity-70`}>No live streams found for {selectedCategory}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveStreams.map((stream) => {
                      const platformInfo = getPlatformInfo(stream.platform)
                      const isInMultiView = selectedStreams.find(s => s.id === stream.id)
                      return (
                        <div
                          key={stream.id}
                          className="group cursor-pointer transition-all duration-300 hover:scale-105"
                          onClick={() => watchLiveStream(stream)}
                        >
                          <div className="relative overflow-hidden rounded-xl" style={getGlassStyle()}>
                            {/* Thumbnail */}
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={stream.thumbnail}
                                alt={stream.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              {/* Live indicator */}
                              <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                LIVE
                              </div>
                              {/* Platform badge */}
                              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full ${platformInfo.bg} ${platformInfo.color} text-xs font-semibold`}>
                                {platformInfo.icon} {stream.platform.toUpperCase()}
                              </div>
                              {/* Viewers */}
                              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-black/70 text-white text-xs font-semibold">
                                👁 {formatViewers(stream.viewers)}
                              </div>
                              {/* Duration */}
                              <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-black/70 text-white text-xs font-semibold">
                                ⏱ {formatStreamDuration(stream.startedAt)}
                              </div>
                              {/* Play overlay */}
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                                  <Play className="w-8 h-8 text-black ml-1" />
                                </div>
                              </div>
                              {/* Multi-view indicator */}
                              {isInMultiView && (
                                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full bg-cyan-500 text-white text-xs font-semibold">
                                  ✓ Multi-view
                                </div>
                              )}
                            </div>

                            {/* Stream Info */}
                            <div className="p-4">
                              <h3 className={`font-semibold text-lg mb-2 ${themeStyles.textColor} line-clamp-2 group-hover:text-cyan-400 transition-colors`}>
                                {stream.title}
                              </h3>
                              <p className={`text-sm ${themeStyles.textColor} opacity-70 mb-3`}>
                                {stream.streamer}
                              </p>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                  <Button
                                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      watchLiveStream(stream)
                                    }}
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Watch
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={`px-3 py-2 rounded-lg text-sm ${
                                      isInMultiView 
                                        ? 'bg-green-500/20 border-green-400/50 text-green-300' 
                                        : `${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (isInMultiView) {
                                        removeFromMultiView(stream.id)
                                      } else {
                                        addToMultiView(stream)
                                      }
                                    }}
                                  >
                                    {isInMultiView ? (
                                      <>
                                        <X className="w-4 h-4 mr-1" />
                                        Remove
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add
                                      </>
                                    )}
                                  </Button>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(stream.url, '_blank')
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Category Description */}
            <div className="mt-12 p-6 rounded-xl" style={getGlassStyle()}>
              <h3 className={`text-xl font-semibold mb-4 ${themeStyles.textColor} text-center`}>
                About {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Streams
              </h3>
              <div className={`text-sm ${isDayMode ? themeStyles.textColor + "/70" : "text-gray-300"} text-center space-y-2`}>
                {selectedCategory === "crypto" && (
                  <>
                    <p>• Live cryptocurrency analysis and trading</p>
                    <p>• Real-time market updates and price action</p>
                    <p>• DeFi protocol reviews and NFT discussions</p>
                  </>
                )}
                {selectedCategory === "stocks" && (
                  <>
                    <p>• Stock market analysis and trading strategies</p>
                    <p>• Real-time market data and company earnings</p>
                    <p>• Investment advice and portfolio management</p>
                  </>
                )}
                {selectedCategory === "gaming" && (
                  <>
                    <p>• Live gameplay from popular games</p>
                    <p>• Esports tournaments and competitive matches</p>
                    <p>• Gaming tutorials and community interaction</p>
                  </>
                )}
                {selectedCategory === "music" && (
                  <>
                    <p>• Live music performances and concerts</p>
                    <p>• Music lessons and instrument tutorials</p>
                    <p>• Studio sessions and music production</p>
                  </>
                )}
                {selectedCategory === "news" && (
                  <>
                    <p>• Breaking news and current events</p>
                    <p>• Political analysis and commentary</p>
                    <p>• Sports highlights and weather updates</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Embedded Player Modal */}
        {isPlayerOpen && selectedStream && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl" style={getGlassStyle()}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full ${getPlatformInfo(selectedStream.platform).bg} ${getPlatformInfo(selectedStream.platform).color} text-sm font-semibold`}>
                    {getPlatformInfo(selectedStream.platform).icon} {selectedStream.platform.toUpperCase()}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${themeStyles.textColor}`}>{selectedStream.title}</h3>
                    <p className={`text-sm ${themeStyles.textColor} opacity-70`}>by {selectedStream.streamer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                  <Button
                    onClick={closePlayer}
                    size="sm"
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Twitch Embed Notice */}
              {selectedStream.platform === 'twitch' && (
                <div className="px-4 py-2 bg-purple-500/10 border-b border-purple-500/20">
                  <p className={`text-xs ${themeStyles.textColor} opacity-80 text-center`}>
                    💡 <strong>Note:</strong> Twitch embeds may not work in development mode due to domain verification requirements. 
                    Use the "Watch on Twitch" button below if the embed fails to load.
                  </p>
                </div>
              )}

              {/* Player */}
              <div className="relative w-full aspect-video bg-black">
                <iframe
                  src={getEmbedUrl(selectedStream)}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                  title={selectedStream.title}
                  onError={() => handleIframeError(selectedStream)}
                  onLoad={() => handleIframeLoad(selectedStream)}
                />
                {/* Loading indicator */}
                <div className="loading-indicator absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-300">
                  <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className={`${themeStyles.textColor}`}>Loading {selectedStream.platform} stream...</p>
                    <p className={`text-sm ${themeStyles.textColor} opacity-70 mt-2`}>
                      {selectedStream.platform === 'youtube' && 'This may take a few seconds...'}
                      {selectedStream.platform === 'twitch' && 'Connecting to Twitch...'}
                      {selectedStream.platform === 'kick' && 'Connecting to Kick...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stream Info */}
              <div className="p-4 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${themeStyles.textColor} opacity-70`}>👁</span>
                      <span className={`font-semibold ${themeStyles.textColor}`}>{formatViewers(selectedStream.viewers)} viewers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${themeStyles.textColor} opacity-70`}>⏱</span>
                      <span className={`font-semibold ${themeStyles.textColor}`}>{formatStreamDuration(selectedStream.startedAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedStream.platform === 'twitch' && (
                      <Button
                        onClick={() => window.open(selectedStream.url, '_blank')}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Watch on Twitch
                      </Button>
                    )}
                    <Button
                      onClick={() => window.open(selectedStream.url, '_blank')}
                      variant="outline"
                      className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open on {selectedStream.platform}
                    </Button>
                    <Button
                      onClick={closePlayer}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white"
                    >
                      Close Player
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {settingsOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={getGlassStyle()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${themeStyles.textColor}`}>Settings</h2>
                  <Button
                    onClick={() => setSettingsOpen(false)}
                    size="sm"
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Glass Effect Settings */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textColor}`}>Glass Effect</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeStyles.textColor}`}>
                          Blur: {settings.blur}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={settings.blur}
                          onChange={(e) => setSettings(prev => ({ ...prev, blur: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeStyles.textColor}`}>
                          Refraction: {settings.refraction}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={settings.refraction}
                          onChange={(e) => setSettings(prev => ({ ...prev, refraction: parseFloat(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeStyles.textColor}`}>
                          Depth: {settings.depth}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={settings.depth}
                          onChange={(e) => setSettings(prev => ({ ...prev, depth: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeStyles.textColor}`}>
                          Border Radius: {settings.borderRadius}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={settings.borderRadius}
                          onChange={(e) => setSettings(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color Settings */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textColor}`}>Colors</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeStyles.textColor}`}>
                          Primary Color
                        </label>
                        <input
                          type="color"
                          value={inputColor}
                          onChange={(e) => setInputColor(e.target.value)}
                          className="w-full h-10 rounded border border-white/20"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${themeStyles.textColor}`}>
                          Color Opacity: {colorSettings.opacity}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={colorSettings.opacity}
                          onChange={(e) => setColorSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Theme Settings */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textColor}`}>Theme</h3>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={toggleTheme}
                        className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                      >
                        {isDayMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                        Switch to {isDayMode ? 'Dark' : 'Light'} Mode
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
