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

    const { channelId } = await request.json()

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      )
    }

    // Search for live videos from the specific channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${YOUTUBE_API_KEY}&maxResults=1`
    
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (!searchResponse.ok) {
      console.error('YouTube API live search error:', searchData)
      if (searchData.error?.code === 403) {
        return NextResponse.json(
          { error: 'YouTube API quota exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to check live status' },
        { status: searchResponse.status }
      )
    }

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json(
        { liveStream: null },
        { status: 200 }
      )
    }

    const liveVideo = searchData.items[0]
    const videoId = liveVideo.id.videoId
    const snippet = liveVideo.snippet

    // Get additional video details including view count
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    
    const videoResponse = await fetch(videoUrl)
    const videoData = await videoResponse.json()

    let viewCount = null
    if (videoResponse.ok && videoData.items && videoData.items.length > 0) {
      viewCount = videoData.items[0].statistics?.viewCount
    }

    const liveStreamInfo = {
      videoId: videoId,
      title: snippet.title,
      description: snippet.description || 'No description available',
      thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
      publishedAt: snippet.publishedAt,
      viewCount: viewCount,
      embedUrl: `https://www.youtube.com/embed/${videoId}`
    }

    return NextResponse.json({ liveStream: liveStreamInfo })

  } catch (error) {
    console.error('Check live error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


