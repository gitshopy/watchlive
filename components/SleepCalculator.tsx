"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Clock, Bed } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SleepCalculatorProps {
  getGlassStyle: () => React.CSSProperties
  themeStyles: any
}

interface SleepResults {
  bedtimes: string[]
  wakeupTimes: string[]
  cycles: number
}

export default function SleepCalculator({ getGlassStyle, themeStyles }: SleepCalculatorProps) {
  const [sleepMode, setSleepMode] = useState<"bedtime" | "wakeup">("bedtime")
  const [wakeUpTime, setWakeUpTime] = useState("07:00")
  const [bedTime, setBedTime] = useState("22:00")
  const [sleepResults, setSleepResults] = useState<SleepResults>({
    bedtimes: [],
    wakeupTimes: [],
    cycles: 0
  })

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

      toast({
        title: "Sleep Times Calculated",
        description: `Found ${bedtimes.length} optimal bedtimes for ${wakeUpTime} wake-up`,
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

      toast({
        title: "Wake-up Times Calculated",
        description: `Found ${wakeupTimes.length} optimal wake-up times for ${bedTime} bedtime`,
      })
    }
  }

  const clearResults = () => {
    setSleepResults({
      bedtimes: [],
      wakeupTimes: [],
      cycles: 0
    })
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="p-6" style={getGlassStyle()}>
        <div className="text-center mb-8">
          <Moon className={`w-8 h-8 mx-auto mb-3 ${themeStyles.textColor}`} />
          <h2 className={`text-3xl font-bold ${themeStyles.textColor} mb-2`}>Sleep Calculator</h2>
          <p className={`text-lg ${themeStyles.textColor} opacity-70`}>
            Calculate optimal sleep and wake times based on 90-minute sleep cycles
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex justify-center mb-8">
          <div className={`p-1 rounded-lg ${themeStyles.buttonBackground} border ${themeStyles.sidebarBorder}`}>
            <Button
              onClick={() => setSleepMode("bedtime")}
              variant={sleepMode === "bedtime" ? "default" : "ghost"}
              className={`px-6 py-3 ${
                sleepMode === "bedtime"
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : `${themeStyles.buttonBackground} ${themeStyles.textColor}`
              }`}
            >
              <Bed className="w-4 h-4 mr-2" />
              Find Bedtime
            </Button>
            <Button
              onClick={() => setSleepMode("wakeup")}
              variant={sleepMode === "wakeup" ? "default" : "ghost"}
              className={`px-6 py-3 ${
                sleepMode === "wakeup"
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : `${themeStyles.buttonBackground} ${themeStyles.textColor}`
              }`}
            >
              <Sun className="w-4 h-4 mr-2" />
              Find Wake-up Time
            </Button>
          </div>
        </div>

        {/* Input Section */}
        <div className="max-w-md mx-auto mb-8">
          {sleepMode === "bedtime" ? (
            <div className="text-center">
              <label className={`block text-lg font-semibold mb-4 ${themeStyles.textColor}`}>
                What time do you want to wake up?
              </label>
              <input
                type="time"
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
                className={`w-full px-4 py-3 text-2xl font-mono rounded-lg ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder} text-center`}
              />
            </div>
          ) : (
            <div className="text-center">
              <label className={`block text-lg font-semibold mb-4 ${themeStyles.textColor}`}>
                What time are you going to bed?
              </label>
              <input
                type="time"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
                className={`w-full px-4 py-3 text-2xl font-mono rounded-lg ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder} text-center`}
              />
            </div>
          )}
        </div>

        {/* Calculate Button */}
        <div className="text-center mb-8">
          <div className="flex gap-4 justify-center">
            <Button
              onClick={calculateSleepTimes}
              className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Clock className="w-5 h-5 mr-2" />
              Calculate Sleep Times
            </Button>
            {(sleepResults.bedtimes.length > 0 || sleepResults.wakeupTimes.length > 0) && (
              <Button
                onClick={clearResults}
                variant="outline"
                className={`px-8 py-4 text-lg ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
              >
                Clear Results
              </Button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {sleepResults.bedtimes.length > 0 && (
          <div className="mb-8">
            <h3 className={`text-2xl font-semibold mb-6 ${themeStyles.textColor} text-center`}>
              Optimal Bedtimes for {wakeUpTime} Wake-up
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sleepResults.bedtimes.map((bedtime, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${themeStyles.buttonBackground} border border-white/10 text-center`}
                >
                  <div className={`text-xl font-mono font-bold ${themeStyles.textColor} mb-2`}>
                    {bedtime.split(' (')[0]}
                  </div>
                  <div className={`text-sm ${themeStyles.textColor} opacity-70`}>
                    {bedtime.split(' (')[1]?.replace(')', '')}
                  </div>
                  <div className={`text-xs ${themeStyles.textColor} opacity-60 mt-2`}>
                    {6 - index} cycles • {(6 - index) * 1.5} hours sleep
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sleepResults.wakeupTimes.length > 0 && (
          <div className="mb-8">
            <h3 className={`text-2xl font-semibold mb-6 ${themeStyles.textColor} text-center`}>
              Optimal Wake-up Times for {bedTime} Bedtime
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sleepResults.wakeupTimes.map((wakeupTime, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${themeStyles.buttonBackground} border border-white/10 text-center`}
                >
                  <div className={`text-xl font-mono font-bold ${themeStyles.textColor} mb-2`}>
                    {wakeupTime.split(' (')[0]}
                  </div>
                  <div className={`text-sm ${themeStyles.textColor} opacity-70`}>
                    {wakeupTime.split(' (')[1]?.replace(')', '')}
                  </div>
                  <div className={`text-xs ${themeStyles.textColor} opacity-60 mt-2`}>
                    {3 + index} cycles • {(3 + index) * 1.5} hours sleep
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className={`p-6 rounded-lg ${themeStyles.buttonBackground} border border-white/10`}>
          <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textColor} text-center`}>
            💡 How Sleep Cycles Work
          </h3>
          <div className="space-y-3 text-sm">
            <p className={`${themeStyles.textColor} opacity-80`}>
              <strong>Sleep Cycles:</strong> Your sleep occurs in cycles of approximately 90 minutes each. 
              Waking up at the end of a cycle helps you feel more refreshed.
            </p>
            <p className={`${themeStyles.textColor} opacity-80`}>
              <strong>Fall Asleep Time:</strong> The calculator includes 15 minutes for you to fall asleep.
            </p>
            <p className={`${themeStyles.textColor} opacity-80`}>
              <strong>Recommended Sleep:</strong> Most adults need 4-6 complete sleep cycles (6-9 hours) per night.
            </p>
            <p className={`${themeStyles.textColor} opacity-80`}>
              <strong>Best Practice:</strong> Try to maintain consistent sleep and wake times, even on weekends.
            </p>
          </div>
        </div>

        {/* Empty State */}
        {sleepResults.bedtimes.length === 0 && sleepResults.wakeupTimes.length === 0 && (
          <div className="text-center py-8">
            <Moon className={`w-16 h-16 mx-auto mb-4 opacity-50 ${themeStyles.textColor}`} />
            <p className={`${themeStyles.textColor} opacity-70`}>No sleep times calculated yet</p>
            <p className={`text-sm ${themeStyles.textColor} opacity-50 mt-2`}>
              Set your preferred time and click "Calculate Sleep Times" to get started
            </p>
          </div>
        )}
      </div>
    </div>
  )
}




