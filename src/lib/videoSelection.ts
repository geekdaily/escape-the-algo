import { Video } from '@/types';

export function selectRandomVideo(videos: Video[]): Video | null {
  if (videos.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * videos.length);
  return videos[randomIndex];
}

export function getNextRadius(currentRadius: number): number | null {
  if (currentRadius >= 1000) {
    return null; // Give up
  }

  if (currentRadius < 100) {
    return currentRadius + 5;
  }

  return currentRadius + 25;
}

export function formatRadius(miles: number): string {
  return `${miles}mi`;
}
