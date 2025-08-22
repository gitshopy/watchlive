"use client";
import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  MoreVertical,
  X,
  Clock,
  CheckSquare,
  Volume2,
  Palette,
  Bell,
  Puzzle,
  Info,
  ExternalLink,
  Lock,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

type TimerMode = "pomodoro" | "short-break" | "long-break";

interface Settings {
  timer: {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    longBreakInterval: number;
  };
  task: {
    autoCheckTasks: boolean;
    checkToBottom: boolean;
  };
  sound: {
    alarmSound: string;
    alarmVolume: number;
    alarmRepeat: number;
    tickingSound: string;
    tickingVolume: number;
  };
  theme: {
    colorTheme: string;
    hourFormat: string;
    darkModeWhenRunning: boolean;
  };
  notification: {
    reminder: string;
    reminderMinutes: number;
    mobileAlarm: boolean;
  };
  integration: {
    todoist: boolean;
    webhook: boolean;
  };
}

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [sessionCount, setSessionCount] = useState(1);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [settings, setSettings] = useState<Settings>({
    timer: {
      pomodoro: 25,
      shortBreak: 5,
      longBreak: 15,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      longBreakInterval: 4,
    },
    task: {
      autoCheckTasks: false,
      checkToBottom: true,
    },
    sound: {
      alarmSound: "Kitchen",
      alarmVolume: 50,
      alarmRepeat: 1,
      tickingSound: "None",
      tickingVolume: 50,
    },
    theme: {
      colorTheme: "reddish-brown",
      hourFormat: "24-hour",
      darkModeWhenRunning: false,
    },
    notification: {
      reminder: "Last",
      reminderMinutes: 0,
      mobileAlarm: false,
    },
    integration: {
      todoist: false,
      webhook: false,
    },
  });

  const timerSettings = {
    pomodoro: settings.timer.pomodoro * 60,
    "short-break": settings.timer.shortBreak * 60,
    "long-break": settings.timer.longBreak * 60,
  };

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      if (mode === "pomodoro") {
        setMode("short-break");
        setTimeLeft(timerSettings["short-break"]);
        setSessionCount((prev) => prev + 1);
        setIsRunning(settings.timer.autoStartBreaks);
      } else if (mode === "short-break") {
        if (sessionCount % settings.timer.longBreakInterval === 0) {
          setMode("long-break");
          setTimeLeft(timerSettings["long-break"]);
        } else {
          setMode("pomodoro");
          setTimeLeft(timerSettings.pomodoro);
        }
        setIsRunning(settings.timer.autoStartPomodoros);
      } else {
        setMode("pomodoro");
        setTimeLeft(timerSettings.pomodoro);
        setIsRunning(settings.timer.autoStartPomodoros);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode, sessionCount, timerSettings, settings.timer]);

  // Fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(timerSettings[newMode]);
    setIsRunning(false);
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerSettings[mode]);
  };

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskText("");
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const getModeLabel = (mode: TimerMode) =>
    mode === "pomodoro" ? "Pomodoro" : mode === "short-break" ? "Short Break" : "Long Break";

  const getSessionMessage = () =>
    mode === "pomodoro"
      ? "Time to focus!"
      : mode === "short-break"
      ? "Take a short break!"
      : "Take a long break!";

  const updateSetting = (section: keyof Settings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = () => {
    setShowSettings(false);
    setTimeLeft(timerSettings[mode]);
    setIsRunning(false);
  };

  // Fullscreen layout
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col items-center justify-center p-8 overflow-hidden">
        {/* Header with session info */}
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">#{sessionCount}</div>
            <div className="text-lg text-neutral-300 font-medium">{getModeLabel(mode)}</div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={resetTimer}
              className="text-neutral-300 hover:text-white transition-all duration-200 p-3 rounded-full hover:bg-white/10"
            >
              <RotateCcw size={24} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="text-neutral-300 hover:text-white transition-all duration-200 p-3 rounded-full hover:bg-white/10"
            >
              <Minimize2 size={24} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="text-neutral-300 hover:text-white transition-all duration-200 p-3 rounded-full hover:bg-white/10"
            >
              <MoreVertical size={24} />
            </button>
          </div>
        </div>

        {/* Main timer display */}
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl">
          {/* Mode indicator */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <div className={`w-3 h-3 rounded-full ${
                mode === "pomodoro" ? "bg-red-500" : 
                mode === "short-break" ? "bg-green-500" : "bg-blue-500"
              }`}></div>
              <span className="text-white text-xl font-medium">{getModeLabel(mode)}</span>
            </div>
          </div>

          {/* Timer */}
          <div className="text-center mb-12">
            <div className="font-mono text-white mb-8 transition-all duration-500 ease-out">
              <div className="text-[12rem] leading-none font-light tracking-wider">
                {formatTime(timeLeft)}
              </div>
            </div>
            
            {/* Session message */}
            <div className="text-2xl text-neutral-300 font-medium mb-8">
              {getSessionMessage()}
            </div>

            {/* Start/Pause button */}
            <button
              onClick={toggleTimer}
              className={`px-16 py-6 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isRunning 
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25" 
                  : "bg-white hover:bg-neutral-100 text-neutral-800 shadow-lg shadow-white/25"
              }`}
            >
              {isRunning ? "PAUSE" : "START"}
            </button>
          </div>

          {/* Progress indicator */}
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between text-sm text-neutral-400 mb-2">
              <span>Session Progress</span>
              <span>{Math.ceil((timerSettings[mode] - timeLeft) / timerSettings[mode] * 100)}%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${((timerSettings[mode] - timeLeft) / timerSettings[mode]) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-8 left-8 right-8 text-center">
          <div className="text-neutral-400 text-lg">
            Press <kbd className="px-2 py-1 bg-neutral-700 rounded text-sm">ESC</kbd> to exit fullscreen
          </div>
        </div>
      </div>
    );
  }

  // Normal layout
  return (
    <>
      <div className="max-w-md mx-auto space-y-6">
        {/* Timer Panel */}
        <div className="bg-neutral-800/70 border border-neutral-700 rounded-lg p-6">
          {/* Mode Selection */}
          <div className="flex gap-2 mb-6">
            {(["pomodoro", "short-break", "long-break"] as TimerMode[]).map(
              (timerMode) => (
                <button
                  key={timerMode}
                  onClick={() => handleModeChange(timerMode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === timerMode
                      ? "bg-neutral-700 text-white"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-700/50"
                  }`}
                >
                  {getModeLabel(timerMode)}
                </button>
              )
            )}
          </div>

          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className="font-mono text-white mb-4 transition-all duration-300 text-6xl">
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={toggleTimer}
              className="bg-white text-neutral-800 px-8 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
            >
              {isRunning ? "PAUSE" : "START"}
            </button>
          </div>

          {/* Session Info */}
          <div className="text-center">
            <div className="text-sm text-neutral-400 mb-1">#{sessionCount}</div>
            <div className="text-white font-medium">{getSessionMessage()}</div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={resetTimer}
              className="text-neutral-400 hover:text-white transition-colors p-2"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="text-neutral-400 hover:text-white transition-colors p-2"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="text-neutral-400 hover:text-white transition-colors p-2"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-neutral-800/70 border border-neutral-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Tasks</h3>
            <button className="text-neutral-400 hover:text-white">
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Add Task */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTask()}
                placeholder="What are you working on?"
                className="flex-1 bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-500"
              />
              <button
                onClick={addTask}
                className="bg-neutral-600 hover:bg-neutral-500 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-neutral-700 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-4 h-4 text-blue-600 bg-neutral-600 border-neutral-500 rounded focus:ring-blue-500"
                />
                <span
                  className={`flex-1 ${
                    task.completed
                      ? "text-neutral-400 line-through"
                      : "text-white"
                  }`}
                >
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-neutral-400 hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-neutral-400 py-8">
                <div className="text-4xl mb-2">📝</div>
                <div>No tasks yet</div>
                <div className="text-sm">Add a task to get started</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">SETTINGS</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Settings Content */}
            <div className="p-6 space-y-8">
              {/* --- Keep all your existing settings sections here --- */}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
