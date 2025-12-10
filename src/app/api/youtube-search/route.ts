import { NextRequest, NextResponse } from 'next/server';
import { Video, YouTubeSearchResponse } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const locationRadius = searchParams.get('locationRadius') || '10mi';
  const maxResults = searchParams.get('maxResults') || '10';
  const excludedIds = searchParams.get('excludedIds')?.split(',').filter(Boolean) || [];

  if (!latitude || !longitude) {
    return NextResponse.json(
      { videos: [], error: 'Missing latitude or longitude' } as YouTubeSearchResponse,
      { status: 400 }
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { videos: [], error: 'YouTube API key not configured' } as YouTubeSearchResponse,
      { status: 500 }
    );
  }

  try {
    // Search for videos near the location
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('location', `${latitude},${longitude}`);
    searchUrl.searchParams.set('locationRadius', locationRadius);
    searchUrl.searchParams.set('order', 'date');
    searchUrl.searchParams.set('maxResults', maxResults);
    searchUrl.searchParams.set('videoEmbeddable', 'true');
    searchUrl.searchParams.set('key', apiKey);

    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    if (data.error) {
      console.error('YouTube API error:', data.error);
      return NextResponse.json(
        { videos: [], error: data.error.message } as YouTubeSearchResponse,
        { status: 500 }
      );
    }

    // Transform the response into our Video format
    const videos: Video[] = (data.items || [])
      .filter((item: any) => !excludedIds.includes(item.id.videoId))
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      }));

    return NextResponse.json({ videos } as YouTubeSearchResponse);
  } catch (error) {
    console.error('YouTube search error:', error);
    return NextResponse.json(
      { videos: [], error: 'Failed to search YouTube' } as YouTubeSearchResponse,
      { status: 500 }
    );
  }
}
