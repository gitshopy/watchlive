"use client";

import { cn } from "@/lib/utils";
import {
  Clock,
  Radio,
  AlarmClock,
  Timer as TimerIcon,
  Flag,
  Bed,
  Search,
  RotateCcw,
  Hourglass,
} from "lucide-react";

interface NavigationProps {
  currentFeature: string;
  onFeatureChange: (feature: string) => void;
  themeStyles: {
    textColor: string;
    buttonBackground: string;
    sidebarBorder: string;
  };
}

export default function Navigation({ currentFeature, onFeatureChange, themeStyles }: NavigationProps) {
  const links = [
    { id: 'world-clock', label: "World Clock", icon: Clock },
    { id: 'live-streams', label: "Live Streams", icon: Radio },
    { id: 'alarm', label: "Alarm", icon: AlarmClock },
    { id: 'timer', label: "Timer", icon: TimerIcon },
    { id: 'stopwatch', label: "Stopwatch", icon: Flag },
    { id: 'sleep-calculator', label: "Sleep Calculator", icon: Bed },
    { id: 'pomodoro', label: "Pomodoro Timer", icon: Hourglass },
    { id: 'find-channel-id', label: "Find Channel ID", icon: Search },

  ];

  return (
    <nav className="flex items-center gap-2 overflow-x-auto p-2 bg-neutral-900 border-b border-neutral-800">
      {links.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onFeatureChange(id)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer",
            currentFeature === id
              ? "bg-blue-600 text-white"
              : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
          )}
        >
          <Icon className="w-4 h-4" />
          <span className="whitespace-nowrap text-sm font-medium">
            {label}
          </span>
        </button>
      ))}
    </nav>
  );
}
