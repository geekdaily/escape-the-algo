export interface Video {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnailUrl: string;
}

export interface HistoryEntry {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  reason: ExclusionReason;
  timestamp: number;
}

export type ExclusionReason = 'offered' | 'played';

export interface ExcludedVideo {
  id: string;
  reason: ExclusionReason;
  timestamp: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
}

export interface YouTubeSearchParams {
  latitude: number;
  longitude: number;
  locationRadius: string;
  maxResults: number;
  excludedIds: string[];
}

export interface YouTubeSearchResponse {
  videos: Video[];
  error?: string;
}

export interface VideoSelectionResult {
  video: Video | null;
  error?: string;
  radiusUsed?: number;
}
