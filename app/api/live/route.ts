import { NextRequest, NextResponse } from 'next/server'

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

// API Configuration
const API_CONFIG = {
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    baseUrl: 'https://api.twitch.tv/helix'
  },
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY,
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    categories: {
      crypto: ['27', '28'], // Science & Technology
      stocks: ['25', '26'], // News & Politics, People & Blogs
      gaming: ['20'], // Gaming
      music: ['10'], // Music
      news: ['25', '26'] // News & Politics, People & Blogs
    }
  },
  kick: {
    clientId: process.env.KICK_CLIENT_ID,
    clientSecret: process.env.KICK_CLIENT_SECRET,
    baseUrl: 'https://kick.com/api/v1',
    categories: {
      crypto: ['cryptocurrency', 'finance'],
      stocks: ['finance', 'business'],
      gaming: ['gaming', 'esports'],
      music: ['music', 'creative'],
      news: ['news', 'politics'],
      sports: ['sports', 'esports', 'gaming']
    }
  }
}

// Twitch API Functions
async function fetchTwitchStreams(category: string): Promise<LiveStream[]> {
  if (!API_CONFIG.twitch.clientId || !API_CONFIG.twitch.clientSecret) {
    console.warn('Twitch API credentials not configured')
    return []
  }

  try {
    // Get access token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: API_CONFIG.twitch.clientId,
        client_secret: API_CONFIG.twitch.clientSecret,
        grant_type: 'client_credentials',
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenData.access_token) {
      throw new Error('Failed to get Twitch access token')
    }

    // Use popular games/categories that are more likely to have live streams
    const categoryGames = {
      crypto: ['509658', '509660', '509661'], // Just Chatting, Politics, Science & Technology
      stocks: ['509658', '509660', '509661'], // Just Chatting, Politics, Science & Technology  
      gaming: ['32982', '516575', '509658', '509660'], // GTA V, Minecraft, Just Chatting, Politics
      music: ['509658', '26936', '509660'], // Just Chatting, Music, Politics
      news: ['509658', '509660', '509661'], // Just Chatting, Politics, Science & Technology
      sports: ['509658', '509660', '509661'] // Just Chatting, Politics, Science & Technology
    }
    
    const gameIds = categoryGames[category as keyof typeof categoryGames] || ['509658'] // Default to Just Chatting
    const streams: LiveStream[] = []

    // First try to get streams by game ID
    for (const gameId of gameIds.slice(0, 3)) { // Try 3 games
      const streamsResponse = await fetch(`${API_CONFIG.twitch.baseUrl}/streams?game_id=${gameId}&first=10&language=en`, {
        headers: {
          'Client-ID': API_CONFIG.twitch.clientId,
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      })

      if (streamsResponse.ok) {
        const streamsData = await streamsResponse.json()
        if (streamsData.data && streamsData.data.length > 0) {
          const twitchStreams = streamsData.data.map((stream: any) => ({
            id: `twitch-${stream.id}`,
            title: stream.title,
            streamer: stream.user_name,
            platform: 'twitch' as const,
            category,
            viewers: stream.viewer_count,
            thumbnail: stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
            url: `https://twitch.tv/${stream.user_login}`,
            startedAt: stream.started_at,
            isLive: true
          }))
          streams.push(...twitchStreams)
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // If we don't have enough streams, try to get popular live streams
    if (streams.length < 3) {
      const popularStreamsResponse = await fetch(`${API_CONFIG.twitch.baseUrl}/streams?first=20&language=en`, {
        headers: {
          'Client-ID': API_CONFIG.twitch.clientId,
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      })

      if (popularStreamsResponse.ok) {
        const popularData = await popularStreamsResponse.json()
        if (popularData.data && popularData.data.length > 0) {
          const popularStreams = popularData.data.slice(0, 10 - streams.length).map((stream: any) => ({
            id: `twitch-${stream.id}`,
            title: stream.title,
            streamer: stream.user_name,
            platform: 'twitch' as const,
            category,
            viewers: stream.viewer_count,
            thumbnail: stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
            url: `https://twitch.tv/${stream.user_login}`,
            startedAt: stream.started_at,
            isLive: true
          }))
          streams.push(...popularStreams)
        }
      }
    }

    return streams.slice(0, 10) // Return up to 10 streams
  } catch (error) {
    console.error('Error fetching Twitch streams:', error)
    return []
  }
}

// YouTube API Functions
async function fetchYouTubeStreams(category: string): Promise<LiveStream[]> {
  if (!API_CONFIG.youtube.apiKey) {
    console.warn('YouTube API key not configured')
    return []
  }

  try {
    // Use keyword-based search instead of category IDs for more relevant results
    const categoryKeywords = {
      crypto: ['cryptocurrency', 'bitcoin', 'ethereum', 'crypto trading', 'blockchain', 'crypto news'],
      stocks: ['stock market', 'trading', 'investing', 'finance', 'stocks', 'market analysis'],
      gaming: ['gaming', 'esports', 'gameplay', 'streaming', 'live gaming', 'game stream'],
      music: ['music', 'live music', 'concert', 'performance', 'live performance', 'music stream'],
      news: ['news', 'breaking news', 'live news', 'current events', 'live coverage', 'news stream'],
      sports: ['sports', 'live sports', 'basketball', 'football', 'baseball', 'tennis', 'esports', 'sports stream']
    }
    
    const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || ['live']
    const streams: LiveStream[] = []

    for (const keyword of keywords.slice(0, 3)) { // Try 3 keywords
      const response = await fetch(
        `${API_CONFIG.youtube.baseUrl}/search?part=snippet&eventType=live&type=video&q=${encodeURIComponent(keyword)}&maxResults=5&key=${API_CONFIG.youtube.apiKey}&relevanceLanguage=en`
      )

      if (response.ok) {
        const data = await response.json()
        if (data.items && data.items.length > 0) {
          const youtubeStreams = data.items.map((item: any) => ({
            id: `youtube-${item.id.videoId}`,
            title: item.snippet.title,
            streamer: item.snippet.channelTitle,
            platform: 'youtube' as const,
            category,
            viewers: Math.floor(Math.random() * 50000) + 1000, // YouTube doesn't provide live viewer count in search
            thumbnail: item.snippet.thumbnails.medium.url,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            startedAt: item.snippet.publishedAt,
            isLive: true
          }))
          streams.push(...youtubeStreams)
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // If we don't have enough streams, try to get general live streams
    if (streams.length < 3) {
      const generalResponse = await fetch(
        `${API_CONFIG.youtube.baseUrl}/search?part=snippet&eventType=live&type=video&q=live&maxResults=10&key=${API_CONFIG.youtube.apiKey}&relevanceLanguage=en`
      )

      if (generalResponse.ok) {
        const generalData = await generalResponse.json()
        if (generalData.items && generalData.items.length > 0) {
          const generalStreams = generalData.items.slice(0, 10 - streams.length).map((item: any) => ({
            id: `youtube-${item.id.videoId}`,
            title: item.snippet.title,
            streamer: item.snippet.channelTitle,
            platform: 'youtube' as const,
            category,
            viewers: Math.floor(Math.random() * 50000) + 1000,
            thumbnail: item.snippet.thumbnails.medium.url,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            startedAt: item.snippet.publishedAt,
            isLive: true
          }))
          streams.push(...generalStreams)
        }
      }
    }

    return streams.slice(0, 10) // Return up to 10 streams
  } catch (error) {
    console.error('Error fetching YouTube streams:', error)
    return []
  }
}

// Kick API Functions (if available)
async function fetchKickStreams(category: string): Promise<LiveStream[]> {
  if (!API_CONFIG.kick.clientId || !API_CONFIG.kick.clientSecret) {
    console.warn('Kick API credentials not configured')
    return []
  }

  try {
    // Get access token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: API_CONFIG.kick.clientId,
        client_secret: API_CONFIG.kick.clientSecret,
        grant_type: 'client_credentials',
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenData.access_token) {
      throw new Error('Failed to get Kick access token')
    }

    // Use popular games/categories that are more likely to have live streams
    const categoryGames = {
      crypto: ['cryptocurrency', 'finance'],
      stocks: ['finance', 'business'],
      gaming: ['gaming', 'esports'],
      music: ['music', 'creative'],
      news: ['news', 'politics'],
      sports: ['sports', 'esports', 'gaming']
    }
    
    const gameIds = categoryGames[category as keyof typeof categoryGames] || ['cryptocurrency'] // Default to Crypto
    const streams: LiveStream[] = []

    // First try to get streams by game ID
    for (const gameId of gameIds.slice(0, 3)) { // Try 3 games
      const streamsResponse = await fetch(`${API_CONFIG.kick.baseUrl}/streams?category=${gameId}&limit=6`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      })

      if (streamsResponse.ok) {
        const streamsData = await streamsResponse.json()
        if (streamsData.streams && streamsData.streams.length > 0) {
          const kickStreams = streamsData.streams.map((stream: any) => ({
            id: `kick-${stream.id}`,
            title: stream.title,
            streamer: stream.user.username,
            platform: 'kick' as const,
            category,
            viewers: stream.viewers,
            thumbnail: stream.thumbnail,
            url: `https://kick.com/${stream.user.username}`,
            startedAt: stream.started_at,
            isLive: true
          }))
          streams.push(...kickStreams)
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // If we don't have enough streams, try to get popular live streams
    if (streams.length < 3) {
      const popularStreamsResponse = await fetch(`${API_CONFIG.kick.baseUrl}/streams?limit=10`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      })

      if (popularStreamsResponse.ok) {
        const popularData = await popularStreamsResponse.json()
        if (popularData.streams && popularData.streams.length > 0) {
          const popularStreams = popularData.streams.slice(0, 10 - streams.length).map((stream: any) => ({
            id: `kick-${stream.id}`,
            title: stream.title,
            streamer: stream.user.username,
            platform: 'kick' as const,
            category,
            viewers: stream.viewers,
            thumbnail: stream.thumbnail,
            url: `https://kick.com/${stream.user.username}`,
            startedAt: stream.started_at,
            isLive: true
          }))
          streams.push(...popularStreams)
        }
      }
    }

    return streams.slice(0, 10) // Return up to 10 streams
  } catch (error) {
    console.error('Error fetching Kick streams:', error)
  }

  return []
}

// Main API function
async function fetchLiveStreams(category: string): Promise<LiveStream[]> {
  try {
    // Fetch from all platforms in parallel
    const [twitchStreams, youtubeStreams, kickStreams] = await Promise.allSettled([
      fetchTwitchStreams(category),
      fetchYouTubeStreams(category),
      fetchKickStreams(category)
    ])

    // Combine all successful results
    const allStreams: LiveStream[] = []
    
    if (twitchStreams.status === 'fulfilled') {
      allStreams.push(...twitchStreams.value)
    }
    
    if (youtubeStreams.status === 'fulfilled') {
      allStreams.push(...youtubeStreams.value)
    }
    
    if (kickStreams.status === 'fulfilled') {
      allStreams.push(...kickStreams.value)
    }

    // Sort by viewer count and limit total results
    return allStreams
      .sort((a, b) => b.viewers - a.viewers)
      .slice(0, 12)

  } catch (error) {
    console.error('Error fetching live streams:', error)
    return []
  }
}

// Mock data for demonstration (fallback)
const mockStreams: Record<string, LiveStream[]> = {
  crypto: [
    {
      id: "crypto-1",
      title: "Bitcoin Analysis Live - Price Action & Technical Analysis",
      streamer: "CryptoGuru",
      platform: "twitch",
      category: "crypto",
      viewers: 15420,
      thumbnail: "https://picsum.photos/320/180?random=1",
      url: "https://twitch.tv/cryptoguru",
      startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "crypto-2",
      title: "ETH Price Action & DeFi Protocols Review",
      streamer: "DeFiMaster",
      platform: "youtube",
      category: "crypto",
      viewers: 8920,
      thumbnail: "https://picsum.photos/320/180?random=2",
      url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      startedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "crypto-3",
      title: "Altcoin Review - Top Picks for 2024",
      streamer: "CoinTrader",
      platform: "kick",
      category: "crypto",
      viewers: 5670,
      thumbnail: "https://picsum.photos/320/180?random=3",
      url: "https://kick.com/cointrader",
      startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "crypto-4",
      title: "NFT Market Update - Floor Prices & Trends",
      streamer: "NFTCollector",
      platform: "twitch",
      category: "crypto",
      viewers: 4320,
      thumbnail: "https://picsum.photos/320/180?random=4",
      url: "https://twitch.tv/nftcollector",
      startedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "crypto-5",
      title: "DeFi Yield Farming Strategies",
      streamer: "YieldFarmer",
      platform: "youtube",
      category: "crypto",
      viewers: 3450,
      thumbnail: "https://picsum.photos/320/180?random=5",
      url: "https://www.youtube.com/watch?v=8UFIYGkROII",
      startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "crypto-6",
      title: "Crypto News Hour - Latest Updates",
      streamer: "CryptoNews",
      platform: "kick",
      category: "crypto",
      viewers: 6780,
      thumbnail: "https://picsum.photos/320/180?random=6",
      url: "https://kick.com/cryptonews",
      startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      isLive: true
    }
  ],
  stocks: [
    {
      id: "stocks-1",
      title: "Market Open Analysis - S&P 500 & NASDAQ",
      streamer: "StockTrader",
      platform: "twitch",
      category: "stocks",
      viewers: 12340,
      thumbnail: "https://picsum.photos/320/180?random=7",
      url: "https://twitch.tv/stocktrader",
      startedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "stocks-2",
      title: "S&P 500 Watch - Technical Analysis",
      streamer: "MarketGuru",
      platform: "youtube",
      category: "stocks",
      viewers: 9870,
      thumbnail: "https://picsum.photos/320/180?random=8",
      url: "https://www.youtube.com/watch?v=QjA5faZF1A8",
      startedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "stocks-3",
      title: "Tech Stocks Review - Apple, Google, Microsoft",
      streamer: "TechInvestor",
      platform: "kick",
      category: "stocks",
      viewers: 7650,
      thumbnail: "https://picsum.photos/320/180?random=9",
      url: "https://kick.com/techinvestor",
      startedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "stocks-4",
      title: "Options Trading Strategies",
      streamer: "OptionsPro",
      platform: "twitch",
      category: "stocks",
      viewers: 5430,
      thumbnail: "https://picsum.photos/320/180?random=10",
      url: "https://twitch.tv/optionspro",
      startedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "stocks-5",
      title: "Dividend Stocks Portfolio Review",
      streamer: "DividendKing",
      platform: "youtube",
      category: "stocks",
      viewers: 4320,
      thumbnail: "https://picsum.photos/320/180?random=11",
      url: "https://www.youtube.com/watch?v=YQHsXMglC9A",
      startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "stocks-6",
      title: "Market Close - Daily Recap & Tomorrow's Outlook",
      streamer: "ClosingBell",
      platform: "kick",
      category: "stocks",
      viewers: 8760,
      thumbnail: "https://picsum.photos/320/180?random=12",
      url: "https://kick.com/closingbell",
      startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isLive: true
    }
  ],
  gaming: [
    {
      id: "gaming-1",
      title: "Valorant Ranked - Immortal to Radiant Push",
      streamer: "ProGamer",
      platform: "twitch",
      category: "gaming",
      viewers: 45670,
      thumbnail: "https://picsum.photos/320/180?random=13",
      url: "https://twitch.tv/progamer",
      startedAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "gaming-2",
      title: "League of Legends - Challenger Ranked Games",
      streamer: "LoLMaster",
      platform: "youtube",
      category: "gaming",
      viewers: 34560,
      thumbnail: "https://picsum.photos/320/180?random=14",
      url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
      startedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "gaming-3",
      title: "Fortnite Battle Royale - Arena Mode",
      streamer: "FortnitePro",
      platform: "kick",
      category: "gaming",
      viewers: 23450,
      thumbnail: "https://picsum.photos/320/180?random=15",
      url: "https://kick.com/fortnitepro",
      startedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "gaming-4",
      title: "Minecraft Survival - Building Mega Base",
      streamer: "BlockBuilder",
      platform: "twitch",
      category: "gaming",
      viewers: 12340,
      thumbnail: "https://picsum.photos/320/180?random=16",
      url: "https://twitch.tv/blockbuilder",
      startedAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "gaming-5",
      title: "CS:GO Tournament - Major Championship",
      streamer: "CSGOCaster",
      platform: "youtube",
      category: "gaming",
      viewers: 56780,
      thumbnail: "https://picsum.photos/320/180?random=17",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      startedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "gaming-6",
      title: "Among Us with Friends - 10 Player Game",
      streamer: "Imposter",
      platform: "kick",
      category: "gaming",
      viewers: 9870,
      thumbnail: "https://picsum.photos/320/180?random=18",
      url: "https://kick.com/imposter",
      startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      isLive: true
    }
  ],
  music: [
    {
      id: "music-1",
      title: "Piano Concert Live - Classical Masterpieces",
      streamer: "PianoMaster",
      platform: "twitch",
      category: "music",
      viewers: 2340,
      thumbnail: "https://picsum.photos/320/180?random=19",
      url: "https://twitch.tv/pianomaster",
      startedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "music-2",
      title: "Guitar Lessons - Advanced Techniques",
      streamer: "GuitarTeacher",
      platform: "youtube",
      category: "music",
      viewers: 1870,
      thumbnail: "https://picsum.photos/320/180?random=20",
      url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "music-3",
      title: "Jazz Improvisation - Live Performance",
      streamer: "JazzArtist",
      platform: "kick",
      category: "music",
      viewers: 1230,
      thumbnail: "https://picsum.photos/320/180?random=21",
      url: "https://kick.com/jazzartist",
      startedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "music-4",
      title: "Classical Music - Symphony Orchestra",
      streamer: "ClassicalPro",
      platform: "twitch",
      category: "music",
      viewers: 980,
      thumbnail: "https://picsum.photos/320/180?random=22",
      url: "https://twitch.tv/classicalpro",
      startedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "music-5",
      title: "Rock Band Practice - Original Songs",
      streamer: "RockBand",
      platform: "youtube",
      category: "music",
      viewers: 3450,
      thumbnail: "https://picsum.photos/320/180?random=23",
      url: "https://www.youtube.com/watch?v=8UFIYGkROII",
      startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "music-6",
      title: "Electronic Music - Live DJ Set",
      streamer: "EDMProducer",
      platform: "kick",
      category: "music",
      viewers: 5670,
      thumbnail: "https://picsum.photos/320/180?random=24",
      url: "https://kick.com/edmproducer",
      startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isLive: true
    }
  ],
  news: [
    {
      id: "news-1",
      title: "Breaking News - Latest Updates",
      streamer: "NewsAnchor",
      platform: "twitch",
      category: "news",
      viewers: 45670,
      thumbnail: "https://picsum.photos/320/180?random=25",
      url: "https://twitch.tv/newsanchor",
      startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "news-2",
      title: "Political Analysis - Current Events",
      streamer: "PoliticsPro",
      platform: "youtube",
      category: "news",
      viewers: 23450,
      thumbnail: "https://picsum.photos/320/180?random=26",
      url: "https://www.youtube.com/watch?v=QjA5faZF1A8",
      startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "news-3",
      title: "Tech News Update - Latest in Technology",
      streamer: "TechReporter",
      platform: "kick",
      category: "news",
      viewers: 18760,
      thumbnail: "https://picsum.photos/320/180?random=27",
      url: "https://kick.com/techreporter",
      startedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "news-4",
      title: "Sports Highlights - Game Recaps",
      streamer: "SportsCaster",
      platform: "twitch",
      category: "news",
      viewers: 34560,
      thumbnail: "https://picsum.photos/320/180?random=28",
      url: "https://twitch.tv/sportscaster",
      startedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "news-5",
      title: "Weather Report - National Forecast",
      streamer: "WeatherMan",
      platform: "youtube",
      category: "news",
      viewers: 12340,
      thumbnail: "https://picsum.photos/320/180?random=29",
      url: "https://www.youtube.com/watch?v=YQHsXMglC9A",
      startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "news-6",
      title: "Business News - Market Updates",
      streamer: "BusinessReporter",
      platform: "kick",
      category: "news",
      viewers: 29870,
      thumbnail: "https://picsum.photos/320/180?random=30",
      url: "https://kick.com/businessreporter",
      startedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      isLive: true
    }
  ],
  sports: [
    {
      id: "sports-1",
      title: "NBA Live - Lakers vs Warriors",
      streamer: "NBAStreamer",
      platform: "twitch",
      category: "sports",
      viewers: 56780,
      thumbnail: "https://picsum.photos/320/180?random=31",
      url: "https://twitch.tv/nbastreamer",
      startedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "sports-2",
      title: "NFL Highlights - Week 10",
      streamer: "NFLViewer",
      platform: "youtube",
      category: "sports",
      viewers: 45670,
      thumbnail: "https://picsum.photos/320/180?random=32",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      startedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "sports-3",
      title: "MLB Game - Dodgers vs Padres",
      streamer: "MLBViewer",
      platform: "kick",
      category: "sports",
      viewers: 34560,
      thumbnail: "https://picsum.photos/320/180?random=33",
      url: "https://kick.com/mlbviewer",
      startedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "sports-4",
      title: "Tennis - ATP Finals",
      streamer: "TennisFan",
      platform: "twitch",
      category: "sports",
      viewers: 23450,
      thumbnail: "https://picsum.photos/320/180?random=34",
      url: "https://twitch.tv/tennisfan",
      startedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "sports-5",
      title: "ESports - Dota 2 Pro Circuit",
      streamer: "ESportsGuru",
      platform: "youtube",
      category: "sports",
      viewers: 18760,
      thumbnail: "https://picsum.photos/320/180?random=35",
      url: "https://www.youtube.com/watch?v=YQHsXMglC9A",
      startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      isLive: true
    },
    {
      id: "sports-6",
      title: "WWE Raw - Latest Episode",
      streamer: "WWEViewer",
      platform: "kick",
      category: "sports",
      viewers: 12340,
      thumbnail: "https://picsum.photos/320/180?random=36",
      url: "https://kick.com/wweviewer",
      startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isLive: true
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'crypto'
    
    // Validate category
    const validCategories = ['crypto', 'stocks', 'gaming', 'music', 'news', 'sports']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }
    
    // Try to fetch real streams first
    let streams = await fetchLiveStreams(category)
    let source = 'mock'
    
    // If no real streams found, fall back to mock data
    if (streams.length === 0) {
      console.log('No real streams found, using mock data')
      streams = mockStreams[category] || []
      source = 'mock'
    } else {
      // Check if we have real API data by looking at stream IDs
      const hasRealData = streams.some(stream => 
        stream.id.includes('twitch-') || 
        stream.id.includes('youtube-') || 
        stream.id.includes('kick-')
      )
      source = hasRealData ? 'real' : 'mock'
      
      if (source === 'real') {
        console.log(`Successfully fetched ${streams.length} real streams from APIs`)
      }
    }
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return NextResponse.json({
      success: true,
      category,
      streams,
      total: streams.length,
      timestamp: new Date().toISOString(),
      source: source
    })
    
  } catch (error) {
    console.error('Error fetching live streams:', error)
    
    // Fallback to mock data on error
    const category = new URL(request.url).searchParams.get('category') || 'crypto'
    const streams = mockStreams[category] || []
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch live streams',
      category,
      streams, // Fallback mock data
      total: streams.length,
      timestamp: new Date().toISOString(),
      source: 'mock'
    })
  }
}
