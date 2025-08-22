"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, Play, ExternalLink, Copy, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface FindChannelIdProps {
  getGlassStyle: () => React.CSSProperties
  themeStyles: any
}

interface ChannelInfo {
  channelId: string
  channelTitle: string
  description: string
  thumbnail: string
  subscriberCount?: string
  viewCount?: string
  videoCount?: string
}

interface LiveStreamInfo {
  videoId: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  viewCount?: string
  embedUrl: string
}

export default function FindChannelId({ getGlassStyle, themeStyles }: FindChannelIdProps) {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null)
  const [liveStreamInfo, setLiveStreamInfo] = useState<LiveStreamInfo | null>(null)
  const [copiedId, setCopiedId] = useState(false)
  const [error, setError] = useState("")

  const findChannel = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username or channel name",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setError("")
    setChannelInfo(null)
    setLiveStreamInfo(null)

    try {
      const response = await fetch('/api/find-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to find channel')

      if (data.channelInfo) {
        setChannelInfo(data.channelInfo)
        if (data.channelInfo.channelId) await checkLiveStream(data.channelInfo.channelId)
      } else {
        setError("Channel not found. Please check the username and try again.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkLiveStream = async (channelId: string) => {
    try {
      const response = await fetch('/api/check-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId })
      })

      const data = await response.json()
      if (response.ok && data.liveStream) {
        setLiveStreamInfo(data.liveStream)
        toast({
          title: "Live Stream Found!",
          description: `${data.liveStream.title} is currently live`,
        })
      } else {
        setLiveStreamInfo(null)
        toast({
          title: "No Live Stream",
          description: "This channel is not currently live streaming",
        })
      }
    } catch (err) {
      console.error('Error checking live stream:', err)
    }
  }

  const copyChannelId = async () => {
    if (channelInfo?.channelId) {
      try {
        await navigator.clipboard.writeText(channelInfo.channelId)
        setCopiedId(true)
        toast({ title: "Copied!", description: "Channel ID copied to clipboard" })
        setTimeout(() => setCopiedId(false), 2000)
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive"
        })
      }
    }
  }

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseInt(num) : num
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="p-6" style={getGlassStyle()}>
        {/* Header */}
        <div className="text-center mb-8">
          <Search className={`w-8 h-8 mx-auto mb-3 ${themeStyles.textColor}`} />
          <h2 className={`text-3xl font-bold ${themeStyles.textColor} mb-2`}>Find Channel ID</h2>
          <p className={`text-lg ${themeStyles.textColor} opacity-70`}>
            Find YouTube channel IDs and check if channels are currently live streaming
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter username or channel name (e.g., @NASA, NASA)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && findChannel()}
              className={`flex-1 px-4 py-3 rounded-lg ${themeStyles.buttonBackground} ${themeStyles.textColor} border ${themeStyles.sidebarBorder}`}
            />
            <Button
              onClick={findChannel}
              disabled={isLoading}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Channel Info */}
        {channelInfo && (
          <div className="mb-8">
            <h3 className={`text-2xl font-semibold mb-6 ${themeStyles.textColor} text-center`}>
              Channel Found
            </h3>
            <div className={`p-6 rounded-lg ${themeStyles.buttonBackground} border border-white/10`}>
              <div className="flex items-start gap-6">
                {channelInfo.thumbnail && (
                  <img src={channelInfo.thumbnail} alt={channelInfo.channelTitle}
                       className="w-24 h-24 rounded-full object-cover" />
                )}
                <div className="flex-1">
                  <h4 className={`text-xl font-bold ${themeStyles.textColor} mb-2`}>
                    {channelInfo.channelTitle}
                  </h4>
                  <p className={`text-sm ${themeStyles.textColor} opacity-80 mb-4`}>
                    {channelInfo.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {channelInfo.subscriberCount && <span className={`${themeStyles.textColor} opacity-70`}>
                      📊 {formatNumber(channelInfo.subscriberCount)} subscribers</span>}
                    {channelInfo.videoCount && <span className={`${themeStyles.textColor} opacity-70`}>
                      🎥 {formatNumber(channelInfo.videoCount)} videos</span>}
                    {channelInfo.viewCount && <span className={`${themeStyles.textColor} opacity-70`}>
                      👁️ {formatNumber(channelInfo.viewCount)} total views</span>}
                  </div>
                </div>
              </div>

              {/* Channel ID */}
              <div className="mt-6 p-4 bg-black/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-sm font-semibold ${themeStyles.textColor} opacity-70`}>
                      Channel ID:
                    </span>
                    <div className={`font-mono text-lg ${themeStyles.textColor} mt-1`}>
                      {channelInfo.channelId}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={copyChannelId} variant="outline" size="sm"
                            className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}>
                      {copiedId ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copiedId ? 'Copied!' : 'Copy ID'}
                    </Button>
                    <Button onClick={() => checkLiveStream(channelInfo.channelId)} variant="outline" size="sm"
                            className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}>
                      <Play className="w-4 h-4" />
                      Check Live
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Stream */}
        {liveStreamInfo && (
          <div className="mb-8">
            <h3 className={`text-2xl font-semibold mb-6 ${themeStyles.textColor} text-center flex items-center justify-center gap-2`}>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              Currently Live Streaming
            </h3>
            <div className={`p-6 rounded-lg ${themeStyles.buttonBackground} border border-white/10`}>
              <div className="flex flex-col gap-6">

                {/* Info */}
                <div className="flex items-start gap-6">
                  <img src={liveStreamInfo.thumbnail} alt={liveStreamInfo.title}
                       className="w-48 h-27 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className={`text-xl font-bold ${themeStyles.textColor} mb-2`}>
                      {liveStreamInfo.title}
                    </h4>
                    <p className={`text-sm ${themeStyles.textColor} opacity-80 mb-4`}>
                      {liveStreamInfo.description}
                    </p>
                    <span className={`${themeStyles.textColor} opacity-70`}>
                      📅 {formatDate(liveStreamInfo.publishedAt)}
                    </span>
                  </div>
                </div>

                {/* Embedded Player */}
                <div>
                  <iframe
                    className="w-full aspect-video rounded-xl border border-white/20"
                    src={liveStreamInfo.embedUrl}
                    title={liveStreamInfo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => window.open(liveStreamInfo.embedUrl, '_blank')}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" /> Watch in Popup
                  </Button>
                  <Button
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${liveStreamInfo.videoId}`, '_blank')}
                    variant="outline"
                    className={`px-6 py-2 ${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20`}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> Open on YouTube
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Examples */}
        <div className={`p-6 rounded-lg ${themeStyles.buttonBackground} border border-white/10`}>
          <h3 className={`text-lg font-semibold mb-4 ${themeStyles.textColor} text-center`}>
            🔍 Try These Examples
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['@NASA', '@TEDxTalks', '@GoogleDevelopers', '@Microsoft', '@Apple', '@Tesla', '@SpaceX', '@Netflix'].map((example) => (
              <Button key={example} onClick={() => setUsername(example)} variant="outline" size="sm"
                      className={`${themeStyles.buttonBackground} ${themeStyles.textColor} border-white/20 hover:bg-white/10`}>
                {example}
              </Button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
