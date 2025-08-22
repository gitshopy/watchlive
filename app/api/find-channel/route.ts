import { NextRequest, NextResponse } from 'next/server'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export async function POST(request: NextRequest) {
  try {
    if (!YOUTUBE_API_KEY) {
      return NextResponse.json(
        { error: 'YouTube API key not configured' },
        { status: 500 }
      )
    }

    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Clean username (remove @ if present)
    const cleanUsername = username.replace(/^@/, '')

    // First, search for the channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(cleanUsername)}&key=${YOUTUBE_API_KEY}&maxResults=1`
    
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (!searchResponse.ok) {
      console.error('YouTube API search error:', searchData)
      if (searchData.error?.code === 403) {
        return NextResponse.json(
          { error: 'YouTube API quota exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to search for channel' },
        { status: searchResponse.status }
      )
    }

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    const channelId = searchData.items[0].id.channelId
    const channelSnippet = searchData.items[0].snippet

    // Get detailed channel information
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
    
    const channelResponse = await fetch(channelUrl)
    const channelData = await channelResponse.json()

    if (!channelResponse.ok) {
      console.error('YouTube API channel error:', channelData)
      return NextResponse.json(
        { error: 'Failed to get channel details' },
        { status: channelResponse.status }
      )
    }

    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json(
        { error: 'Channel details not found' },
        { status: 404 }
      )
    }

    const channelInfo = channelData.items[0]
    const statistics = channelInfo.statistics || {}

    const channelInfoResponse = {
      channelId: channelId,
      channelTitle: channelSnippet.channelTitle,
      description: channelSnippet.description || 'No description available',
      thumbnail: channelSnippet.thumbnails?.high?.url || channelSnippet.thumbnails?.medium?.url || channelSnippet.thumbnails?.default?.url,
      subscriberCount: statistics.subscriberCount,
      viewCount: statistics.viewCount,
      videoCount: statistics.videoCount
    }

    return NextResponse.json({ channelInfo: channelInfoResponse })

  } catch (error) {
    console.error('Find channel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



