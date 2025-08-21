"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Timer as TimerIcon, Play, Pause, RotateCcw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TimerProps {
  getGlassStyle: () => React.CSSProperties
  themeStyles: any
}

export default function Timer({ getGlassStyle, themeStyles }: TimerProps) {
  const [timerTimeLeft, setTimerTimeLeft] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerInput, setTimerInput] = useState('')
  const [timerInputMinutes, setTimerInputMinutes] = useState('')
  const [timerInputSeconds, setTimerInputSeconds] = useState('')

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerRunning && timerTimeLeft > 0) {
      interval = setInterval(() => {
        setTimerTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false)
            toast({ title: "Timer finished!", description: "Your timer has reached zero." })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning, timerTimeLeft])

  const startTimer = () => {
    if (timerTimeLeft > 0) {
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

  const setTimer = () => {
    const minutes = parseInt(timerInputMinutes) || 0
    const seconds = parseInt(timerInputSeconds) || 0
    const totalSeconds = minutes * 60 + seconds
    
    if (totalSeconds > 0) {
      setTimerTimeLeft(totalSeconds)
      setTimerInputMinutes('')
      setTimerInputSeconds('')
      toast({
        title: "Timer Set",
        description: `Timer set for ${minutes}m ${seconds}s`,
      })
    }
  }

  const quickSetTimer = (minutes: number) => {
    setTimerTimeLeft(minutes * 60)
    toast({
      title: "Timer Set",
      description: `Quick timer set for ${minutes} minutes`,
    })
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="p-6" style={getGlassStyle()}>
        <div className="text-center mb-6">
          <TimerIcon className={`w-8 h-8 mx-auto mb-3 ${themeStyles.textColor}`} />
          <h2 className={`text-3xl font-bold ${themeStyles.textColor}`}>Timer</h2>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className={`text-8xl font-mono font-bold ${themeStyles.textColor} mb-4`}>
            {formatTime(timerTimeLeft)}
          </div>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={startTimer}
              disabled={timerTimeLeft === 0 || timerRunning}
              className={`px-8 py-4 text-lg ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 disabled:opacity-50`}
            >
              <Play className="w-5 h-5 mr-2" />
              Start
            </Button>
            <Button
              onClick={pauseTimer}
              disabled={!timerRunning}
              variant="outline"
              className={`px-8 py-4 text-lg ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 disabled:opacity-50`}
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
            <Button
              onClick={resetTimer}
              variant="outline"
              className={`px-8 py-4 text-lg ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Set Timer */}
        <div className="text-center mb-8">
          <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textColor}`}>Set Timer</h3>
          <div className="flex gap-4 justify-center items-center mb-4">
            <div className="flex flex-col items-center">
              <label className={`text-sm ${themeStyles.textColor} mb-2`}>Minutes</label>
              <input
                type="number"
                min="0"
                max="999"
                value={timerInputMinutes}
                onChange={(e) => setTimerInputMinutes(e.target.value)}
                className={`w-20 px-3 py-2 text-center rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
                placeholder="0"
              />
            </div>
            <div className={`text-2xl ${themeStyles.textColor}`}>:</div>
            <div className="flex flex-col items-center">
              <label className={`text-sm ${themeStyles.textColor} mb-2`}>Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={timerInputSeconds}
                onChange={(e) => setTimerInputSeconds(e.target.value)}
                className={`w-20 px-3 py-2 text-center rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
                placeholder="0"
              />
            </div>
          </div>
          <Button
            onClick={setTimer}
            disabled={(!timerInputMinutes && !timerInputSeconds)}
            className={`px-6 py-3 ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 disabled:opacity-50`}
          >
            Set Timer
          </Button>
        </div>

        {/* Quick Set Buttons */}
        <div className="text-center">
          <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textColor}`}>Quick Set</h3>
          <div className="grid grid-cols-3 gap-3">
            {[1, 5, 10, 15, 20, 30].map((minutes) => (
              <Button
                key={minutes}
                onClick={() => quickSetTimer(minutes)}
                variant="outline"
                className={`py-3 ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
              >
                {minutes}m
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
