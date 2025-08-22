"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeftRight, Plus, X, Copy, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TimeZoneConverterProps {
  getGlassStyle: () => React.CSSProperties
  themeStyles: any
}

/** Try to get full IANA list; fallback to a solid subset */
function useAllTimeZones(): string[] {
  const fallback = [
    "Pacific/Honolulu", "America/Anchorage", "America/Los_Angeles", "America/Denver",
    "America/Chicago", "America/New_York", "America/Toronto", "America/Mexico_City",
    "America/Sao_Paulo", "Europe/London", "Europe/Dublin", "Europe/Berlin",
    "Europe/Paris", "Europe/Madrid", "Europe/Rome", "Europe/Amsterdam",
    "Europe/Athens", "Europe/Moscow", "Africa/Cairo", "Asia/Dubai",
    "Asia/Kolkata", "Asia/Dhaka", "Asia/Bangkok", "Asia/Jakarta",
    "Asia/Singapore", "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul",
    "Australia/Sydney", "Pacific/Auckland"
  ]
  const [zones, setZones] = useState<string[]>(fallback)
  useEffect(() => {
    try {
      // @ts-ignore - supported in modern browsers
      const supported: string[] | undefined = Intl.supportedValuesOf?.("timeZone")
      if (supported && supported.length) setZones(supported)
    } catch {/* ignore */}
  }, [])
  return zones
}

/** Format a Date in a given time zone */
function formatInTZ(date: Date, timeZone: string, hour12: boolean) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12,
  }).format(date)
}

/**
 * Convert a *wall-clock* datetime that belongs to `fromTZ` into the actual UTC instant
 * Approach: interpret the provided local Date's fields as if they were in `fromTZ`.
 */
function wallClockInTZ_toUTC(localDateLike: Date, fromTZ: string): Date {
  // localDateLike carries the year-month-day-hour-minute we want to interpret.
  const asIfInFromTZ = new Date(localDateLike.toLocaleString("en-US", { timeZone: fromTZ }))
  const diff = localDateLike.getTime() - asIfInFromTZ.getTime()
  return new Date(localDateLike.getTime() + diff)
}

/** Helper for <input type="datetime-local"> default value */
function toInputValue(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0")
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const h = pad(date.getHours())
  const min = pad(date.getMinutes())
  return `${y}-${m}-${d}T${h}:${min}`
}

/** Guess local TZ */
function getLocalTZ() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}

export default function TimeZoneConverter({ getGlassStyle, themeStyles }: TimeZoneConverterProps) {
  const allZones = useAllTimeZones()
  const localTZ = getLocalTZ()

  const [fromTZ, setFromTZ] = useState(localTZ)
  const [fromSearch, setFromSearch] = useState("")
  const [toSearch, setToSearch] = useState("")
  const [toZones, setToZones] = useState<string[]>(["Europe/London", "Asia/Tokyo"])
  const [dtLocal, setDtLocal] = useState<string>(toInputValue(new Date())) // the *wall-clock* datetime for FROM TZ
  const [hour12, setHour12] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  const filteredFrom = useMemo(() => {
    const q = fromSearch.toLowerCase()
    return allZones.filter(z => z.toLowerCase().includes(q)).slice(0, 50)
  }, [fromSearch, allZones])

  const filteredTo = useMemo(() => {
    const q = toSearch.toLowerCase()
    return allZones
      .filter(z => !toZones.includes(z))
      .filter(z => z.toLowerCase().includes(q))
      .slice(0, 50)
  }, [toSearch, allZones, toZones])

  const utcInstant = useMemo(() => {
    const d = new Date(dtLocal) // interprets as local zone wall-time
    return wallClockInTZ_toUTC(d, fromTZ)
  }, [dtLocal, fromTZ])

  const results = useMemo(() => {
    return toZones.map(z => ({
      zone: z,
      text: formatInTZ(utcInstant, z, hour12),
    }))
  }, [toZones, utcInstant, hour12])

  const addToZone = (z: string) => {
    setToZones(prev => prev.includes(z) ? prev : [...prev, z])
    setToSearch("")
  }

  const removeToZone = (z: string) => setToZones(prev => prev.filter(x => x !== z))

  const swapZones = () => {
    if (!toZones.length) return
    // Use the first target as the new from; keep others
    const newFrom = toZones[0]
    setToZones(prev => [fromTZ, ...prev.slice(1)])
    setFromTZ(newFrom)
  }

  const copyResult = async (text: string, zone: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(zone)
      setTimeout(() => setCopied(null), 1500)
      toast({ title: "Copied", description: text })
    } catch {
      toast({ title: "Copy failed", description: "Could not copy to clipboard", variant: "destructive" })
    }
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="p-6 space-y-8" style={getGlassStyle()}>
        {/* Header */}
        <div className="text-center">
          <h2 className={`text-3xl font-bold ${themeStyles.textColor}`}>Time Zone Converter</h2>
          <p className={`${themeStyles.textColor} opacity-70`}>Convert a date & time from one time zone to others</p>
        </div>

        {/* From row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* DateTime input (belongs to FROM TZ wall-clock) */}
          <div className="col-span-1 lg:col-span-1">
            <label className={`block text-sm mb-1 ${themeStyles.textColor} opacity-70`}>
              Date & Time (in From zone)
            </label>
            <input
              type="datetime-local"
              value={dtLocal}
              onChange={(e) => setDtLocal(e.target.value)}
              className={`w-full px-3 py-2 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
            />
            <div className={`mt-2 text-xs ${themeStyles.textColor} opacity-60`}>
              Converted using DST rules of the selected From time zone.
            </div>
          </div>

          {/* From TZ select with search */}
          <div className="col-span-1 lg:col-span-1">
            <label className={`block text-sm mb-1 ${themeStyles.textColor} opacity-70`}>From Time Zone</label>
            <input
              type="text"
              placeholder="Search time zone…"
              value={fromSearch}
              onChange={(e) => setFromSearch(e.target.value)}
              className={`w-full mb-2 px-3 py-2 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
            />
            <select
              value={fromTZ}
              onChange={(e) => setFromTZ(e.target.value)}
              className={`w-full px-3 py-2 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
            >
              {[fromTZ, ...filteredFrom.filter(z => z !== fromTZ)].map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
            <div className="mt-2">
              <Button
                onClick={swapZones}
                variant="outline"
                className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 gap-2`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                Swap with first “To”
              </Button>
            </div>
          </div>

          {/* Preferences */}
          <div className="col-span-1 lg:col-span-1">
            <label className={`block text-sm mb-1 ${themeStyles.textColor} opacity-70`}>Display</label>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setHour12(false)}
                variant="outline"
                className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 ${!hour12 ? "ring-2 ring-blue-500" : ""}`}
              >
                24-hour
              </Button>
              <Button
                onClick={() => setHour12(true)}
                variant="outline"
                className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 ${hour12 ? "ring-2 ring-blue-500" : ""}`}
              >
                12-hour
              </Button>
            </div>
          </div>
        </div>

        {/* To zones manager */}
        <div className="rounded-lg p-4 border border-white/10" style={getGlassStyle()}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-lg font-semibold ${themeStyles.textColor}`}>To Time Zones</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search & add…"
                value={toSearch}
                onChange={(e) => setToSearch(e.target.value)}
                className={`px-3 py-2 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
              />
              <select
                onChange={(e) => e.target.value && addToZone(e.target.value)}
                value=""
                className={`px-3 py-2 rounded ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
              >
                <option value="">Add zone…</option>
                {filteredTo.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <Button
                onClick={() => addToZone(localTZ)}
                variant="outline"
                className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Local
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map(r => (
              <div key={r.zone} className={`p-3 rounded-lg ${themeStyles.buttonBackground} border ${themeStyles.sidebarBorder} flex items-start justify-between gap-3`}>
                <div>
                  <div className={`font-semibold ${themeStyles.textColor}`}>{r.zone}</div>
                  <div className={`${themeStyles.textColor} opacity-80`}>{r.text}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                    onClick={() => copyResult(`${r.text} (${r.zone})`, r.zone)}
                  >
                    {copied === r.zone ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400"
                    onClick={() => removeToZone(r.zone)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className={`text-sm ${themeStyles.textColor} opacity-70`}>
          Tip: Use the first “To” zone as your counterpart (swap quickly with “From”).
        </div>
      </div>
    </div>
  )
}
