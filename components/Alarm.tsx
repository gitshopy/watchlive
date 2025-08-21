"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlarmClock, Trash2, Play, Pause } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AlarmProps {
  getGlassStyle: () => React.CSSProperties
  themeStyles: any
}

interface Alarm {
  id: string
  time: string
  label: string
  enabled: boolean
  sound: string
}

export default function Alarm({ getGlassStyle, themeStyles }: AlarmProps) {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [newAlarmTime, setNewAlarmTime] = useState('')
  const [newAlarmLabel, setNewAlarmLabel] = useState('')
  const [newAlarmSound, setNewAlarmSound] = useState('beep')

  const addAlarm = () => {
    if (newAlarmTime) {
      const newAlarm: Alarm = {
        id: Date.now().toString(),
        time: newAlarmTime,
        label: newAlarmLabel,
        enabled: true,
        sound: newAlarmSound
      }
      setAlarms([...alarms, newAlarm])
      setNewAlarmTime('')
      setNewAlarmLabel('')
      toast({
        title: "Alarm Added",
        description: `Alarm set for ${newAlarmTime}`,
      })
    }
  }

  const removeAlarm = (id: string) => {
    setAlarms(alarms.filter(alarm => alarm.id !== id))
    toast({
      title: "Alarm Removed",
      description: "Alarm has been removed.",
    })
  }

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(alarm => 
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ))
  }

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

  return (
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
                  value={newAlarmSound}
                  onChange={(e) => setNewAlarmSound(e.target.value)}
                  className={`px-3 py-2 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
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
                disabled={!newAlarmTime}
                className={`px-6 py-3 ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 disabled:opacity-50`}
              >
                Set Alarm
              </Button>
              <Button
                onClick={playAlarmSound}
                variant="outline"
                className={`px-6 py-3 ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
              >
                Test Sound
              </Button>
            </div>
          </div>

          {/* Alarms List */}
          {alarms.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textColor}`}>Your Alarms</h3>
              <div className="space-y-3">
                {alarms.map((alarm) => (
                  <div key={alarm.id} className={`p-4 rounded-lg ${themeStyles.buttonBackground} border border-white/10 flex items-center justify-between`}>
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-mono font-bold ${themeStyles.textColor}`}>
                        {alarm.time}
                      </div>
                      {alarm.label && (
                        <div className={`text-sm ${themeStyles.textColor} opacity-70`}>
                          {alarm.label}
                        </div>
                      )}
                      <div className={`text-xs px-2 py-1 rounded ${alarm.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {alarm.enabled ? 'Active' : 'Disabled'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleAlarm(alarm.id)}
                        size="sm"
                        className={`p-2 ${themeStyles.buttonBackground} ${themeStyles.textColor}`}
                      >
                        {alarm.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={() => removeAlarm(alarm.id)}
                        size="sm"
                        variant="destructive"
                        className="p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alarms.length === 0 && (
            <div className="text-center py-8">
              <AlarmClock className={`w-16 h-16 mx-auto mb-4 opacity-50 ${themeStyles.textColor}`} />
              <p className={`${themeStyles.textColor} opacity-70`}>No alarms set</p>
              <p className={`text-sm ${themeStyles.textColor} opacity-50 mt-2`}>Set your first alarm above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
