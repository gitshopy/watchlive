"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Flag } from "lucide-react"

interface StopwatchProps {
  getGlassStyle: () => React.CSSProperties
  themeStyles: any
}

export default function Stopwatch({ getGlassStyle, themeStyles }: StopwatchProps) {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10)
      }, 10)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const startStopwatch = () => {
    setIsRunning(true)
  }

  const pauseStopwatch = () => {
    setIsRunning(false)
  }

  const resetStopwatch = () => {
    setIsRunning(false)
    setTime(0)
    setLaps([])
  }

  const lapStopwatch = () => {
    if (isRunning) {
      setLaps(prevLaps => [...prevLaps, time])
    }
  }

  const formatTime = (timeInMs: number): string => {
    const minutes = Math.floor(timeInMs / 60000)
    const seconds = Math.floor((timeInMs % 60000) / 1000)
    const milliseconds = Math.floor((timeInMs % 1000) / 10)
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
  }

  const formatLapTime = (lapTime: number, previousLapTime: number = 0): string => {
    const lapDuration = lapTime - previousLapTime
    return formatTime(lapDuration)
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="p-6" style={getGlassStyle()}>
        <div className="text-center mb-8">
          <h2 className={`text-4xl font-bold ${themeStyles.textColor} mb-6`}>Stopwatch</h2>
          
          {/* Time Display */}
          <div className={`text-8xl font-mono font-bold ${themeStyles.textColor} mb-8`}>
            {formatTime(time)}
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center mb-8">
            {!isRunning ? (
              <Button
                onClick={startStopwatch}
                className={`px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white border-white/20`}
              >
                <Play className="w-5 h-5 mr-2" />
                Start
              </Button>
            ) : (
              <Button
                onClick={pauseStopwatch}
                className={`px-8 py-4 text-lg bg-yellow-600 hover:bg-yellow-700 text-white border-white/20`}
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
            )}
            
            <Button
              onClick={resetStopwatch}
              variant="outline"
              className={`px-8 py-4 text-lg ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
            
            <Button
              onClick={lapStopwatch}
              disabled={!isRunning}
              variant="outline"
              className={`px-8 py-4 text-lg ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 disabled:opacity-50`}
            >
              <Flag className="w-5 h-5 mr-2" />
              Lap
            </Button>
          </div>
        </div>

        {/* Laps */}
        {laps.length > 0 && (
          <div>
            <h3 className={`text-xl font-semibold mb-4 ${themeStyles.textColor} text-center`}>Laps</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {laps.map((lap, index) => (
                <div key={index} className={`p-3 rounded-lg ${themeStyles.buttonBackground} border border-white/10 flex justify-between items-center`}>
                  <span className={`font-semibold ${themeStyles.textColor}`}>Lap {index + 1}</span>
                  <div className="flex gap-4">
                    <span className={`text-sm ${themeStyles.textColor} opacity-70`}>
                      Split: {formatLapTime(lap, index > 0 ? laps[index - 1] : 0)}
                    </span>
                    <span className={`font-mono ${themeStyles.textColor}`}>
                      Total: {formatTime(lap)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {laps.length === 0 && (
          <div className="text-center py-8">
            <Flag className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className={`${themeStyles.textColor} opacity-70`}>No laps recorded</p>
            <p className={`text-sm ${themeStyles.textColor} opacity-50 mt-2`}>
              Start the stopwatch and use the Lap button to record split times
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
