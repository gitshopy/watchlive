"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Radio, Eye, ExternalLink, X, Play } from "lucide-react"
import { toast } from "@/hooks/use-toast"

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

interface LiveStreamsProps {
  getGlassStyle: () => React.CSSProperties
  themeStyles: any
}

export default function LiveStreams({ getGlassStyle, themeStyles }: LiveStreamsProps) {
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [selectedCategory, setSelectedCategory] = useState('crypto')
  const [isLoadingStreams, setIsLoadingStreams] = useState(false)
  const [streamsError, setStreamsError] = useState<string | null>(null)
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'multiview'>('grid')
  const [selectedStreams, setSelectedStreams] = useState<LiveStream[]>([])

  const categories = ['crypto', 'stocks', 'gaming', 'music', 'news', 'sports']

  useEffect(() => {
    fetchLiveStreams()
  }, [selectedCategory])

  const fetchLiveStreams = async () => {
    setIsLoadingStreams(true)
    setStreamsError(null)
    
    try {
      const response = await fetch(`/api/live?category=${selectedCategory}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.streams) {
          setLiveStreams(data.streams)
        } else {
          throw new Error('Failed to fetch streams')
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error fetching live streams:', error)
      setStreamsError('Failed to fetch live streams. Please try again.')
      setLiveStreams(generateMockStreams())
    } finally {
      setIsLoadingStreams(false)
    }
  }

  const generateMockStreams = (): LiveStream[] => {
    return [
      {
        id: `mock-${selectedCategory}-1`,
        title: `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Live Stream`,
        streamer: `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}Streamer`,
        platform: 'twitch' as const,
        category: selectedCategory,
        viewers: Math.floor(Math.random() * 50000) + 1000,
        thumbnail: `https://picsum.photos/320/180?random=${Math.floor(Math.random() * 100)}`,
        url: `https://twitch.tv/${selectedCategory}streamer`,
        startedAt: new Date(Date.now() - Math.floor(Math.random() * 120) * 60 * 1000).toISOString(),
        isLive: true
      }
    ]
  }

  const watchLiveStream = (stream: LiveStream) => {
    setSelectedStream(stream)
    setIsPlayerOpen(true)
  }

  const closePlayer = () => {
    setSelectedStream(null)
    setIsPlayerOpen(false)
  }

  const getEmbedUrl = (stream: LiveStream): string => {
    switch (stream.platform) {
      case 'twitch':
        const twitchChannel = stream.url.split('/').pop() || stream.streamer.toLowerCase()
        const currentDomain = window.location.hostname || 'localhost'
        return `https://player.twitch.tv/?channel=${twitchChannel}&parent=${currentDomain}&autoplay=true&muted=false`
      case 'youtube':
        let videoId = stream.url
        if (videoId.includes('youtube.com/watch?v=')) {
          videoId = videoId.split('v=')[1]?.split('&')[0] || ''
        } else if (videoId.includes('youtu.be/')) {
          videoId = videoId.split('youtu.be/')[1]?.split('?')[0] || ''
        }
        
        if (videoId && videoId.length === 11) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`
        } else {
          return 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0'
        }
      case 'kick':
        const kickChannel = stream.url.split('/').pop() || stream.streamer.toLowerCase()
        return `https://player.kick.com/${kickChannel}?autoplay=1&muted=0`
      default:
        return stream.url
    }
  }

  const handleIframeError = (stream: LiveStream) => {
    if (stream.platform === 'twitch') {
      toast({
        title: "Twitch Embed Failed",
        description: "Twitch requires domain verification. Use the 'Watch on Twitch' button instead.",
        variant: "destructive",
        duration: 10000,
      })
    } else {
      toast({
        title: "Embedding Failed",
        description: `Could not load ${stream.platform} stream. Opening in new tab instead.`,
        variant: "destructive",
      })
      window.open(stream.url, '_blank')
      closePlayer()
    }
  }

  const addToMultiView = (stream: LiveStream) => {
    if (selectedStreams.length < 4 && !selectedStreams.find(s => s.id === stream.id)) {
      setSelectedStreams([...selectedStreams, stream])
      toast({
        title: "Added to Multi-View",
        description: `${stream.streamer} added to multi-view mode.`,
      })
    }
  }

  const removeFromMultiView = (streamId: string) => {
    setSelectedStreams(selectedStreams.filter(s => s.id !== streamId))
  }

  const clearMultiView = () => {
    setSelectedStreams([])
    setViewMode('grid')
  }

  const watchRandomStream = () => {
    if (liveStreams.length > 0) {
      const randomIndex = Math.floor(Math.random() * liveStreams.length)
      watchLiveStream(liveStreams[randomIndex])
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitch': return 'bg-purple-500'
      case 'youtube': return 'bg-red-500'
      case 'kick': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitch': return '🎮'
      case 'youtube': return '📺'
      case 'kick': return '🥊'
      default: return '📡'
    }
  }

  const formatDuration = (startedAt: string) => {
    const start = new Date(startedAt)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`
    }
    return `${diffMins}m`
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className={`text-4xl font-bold ${themeStyles.textColor} mb-4`}>Live Streams</h2>
        <p className={`text-lg ${themeStyles.textColor} opacity-70`}>
          Watch live streams from Twitch, YouTube, and Kick
        </p>
      </div>

      {/* English Content Notice */}
      <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className={`text-sm ${themeStyles.textColor} text-center`}>
          🌍 <strong>English Content Only:</strong> All streams are filtered to show English-language content for better user experience.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`px-6 py-3 ${selectedCategory === category ? 'bg-blue-600 hover:bg-blue-700' : themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button
          onClick={watchRandomStream}
          disabled={liveStreams.length === 0}
          className={`px-6 py-3 bg-green-600 hover:bg-green-700 text-white border-white/20 disabled:opacity-50`}
        >
          <Radio className="w-4 h-4 mr-2" />
          Auto-pick
        </Button>
        
        <Button
          onClick={() => setViewMode(viewMode === 'grid' ? 'multiview' : 'grid')}
          variant="outline"
          className={`px-6 py-3 ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
        >
          <Eye className="w-4 h-4 mr-2" />
          {viewMode === 'grid' ? 'Multi-View' : 'Grid View'}
        </Button>

        {viewMode === 'multiview' && selectedStreams.length > 0 && (
          <Button
            onClick={clearMultiView}
            variant="destructive"
            className="px-6 py-3"
          >
            <X className="w-4 h-4 mr-2" />
            Clear Multi-View
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoadingStreams && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${themeStyles.textColor} opacity-70`}>Loading live streams...</p>
        </div>
      )}

      {/* Error State */}
      {streamsError && (
        <div className="text-center py-12">
          <p className={`${themeStyles.textColor} text-red-400 mb-4`}>{streamsError}</p>
          <Button onClick={fetchLiveStreams} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white">
            Try Again
          </Button>
        </div>
      )}

      {/* Streams Grid */}
      {!isLoadingStreams && !streamsError && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {liveStreams.map((stream) => (
            <div
              key={stream.id}
              className={`rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${themeStyles.buttonBackground} border border-white/10`}
              onClick={() => watchLiveStream(stream)}
            >
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={stream.thumbnail}
                  alt={stream.title}
                  className="w-full h-48 object-cover"
                />
                {/* Live Indicator */}
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  LIVE
                </div>
                {/* Platform Badge */}
                <div className={`absolute top-2 right-2 ${getPlatformColor(stream.platform)} text-white text-xs px-2 py-1 rounded-full font-semibold`}>
                  {getPlatformIcon(stream.platform)}
                </div>
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="w-16 h-16 text-white" />
                </div>
                {/* Multi-View Add Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    addToMultiView(stream)
                  }}
                  size="sm"
                  className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>

              {/* Stream Info */}
              <div className="p-4">
                <h3 className={`font-semibold ${themeStyles.textColor} mb-2 line-clamp-2`}>
                  {stream.title}
                </h3>
                <p className={`text-sm ${themeStyles.textColor} opacity-70 mb-2`}>
                  {stream.streamer}
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span className={`${themeStyles.textColor} opacity-70`}>
                    👥 {stream.viewers.toLocaleString()}
                  </span>
                  <span className={`${themeStyles.textColor} opacity-70`}>
                    ⏱️ {formatDuration(stream.startedAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Multi-View Grid */}
      {!isLoadingStreams && !streamsError && viewMode === 'multiview' && (
        <div className="space-y-6">
          {selectedStreams.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className={`${themeStyles.textColor} opacity-70`}>No streams in multi-view</p>
              <p className={`text-sm ${themeStyles.textColor} opacity-50 mt-2`}>
                Add streams from the grid view to watch multiple streams simultaneously
              </p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${selectedStreams.length === 1 ? 'lg:grid-cols-1' : selectedStreams.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-6`}>
              {selectedStreams.map((stream) => (
                <div key={stream.id} className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`font-semibold ${themeStyles.textColor}`}>
                      {stream.streamer} - {stream.title}
                    </h3>
                    <Button
                      onClick={() => removeFromMultiView(stream.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <iframe
                      src={getEmbedUrl(stream)}
                      className="w-full h-64 rounded-lg"
                      frameBorder="0"
                      allowFullScreen
                      onError={() => handleIframeError(stream)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stream Player Modal */}
      {isPlayerOpen && selectedStream && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-6xl bg-gray-900 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <div>
                <h3 className={`text-xl font-semibold ${themeStyles.textColor}`}>
                  {selectedStream.title}
                </h3>
                <p className={`text-sm ${themeStyles.textColor} opacity-70`}>
                  {selectedStream.streamer} • {selectedStream.platform} • {selectedStream.viewers.toLocaleString()} viewers
                </p>
              </div>
              <Button
                onClick={closePlayer}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </Button>
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
            <div className="relative">
              <iframe
                src={getEmbedUrl(selectedStream)}
                className="w-full h-96 lg:h-[600px]"
                frameBorder="0"
                allowFullScreen
                onError={() => handleIframeError(selectedStream)}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  onClick={() => addToMultiView(selectedStream)}
                  disabled={!!selectedStreams.find(s => s.id === selectedStream.id)}
                  variant="outline"
                  className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border-blue-500/40"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Add to Multi-View
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(selectedStream.url, '_blank')}
                  variant="outline"
                  className="bg-gray-600/20 hover:bg-gray-600/40 text-gray-400 border-gray-500/40"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
                {selectedStream.platform === 'twitch' && (
                  <Button
                    onClick={() => window.open(selectedStream.url, '_blank')}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Watch on Twitch
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
