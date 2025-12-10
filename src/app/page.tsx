'use client';

import { useState, useEffect, useCallback } from 'react';
import { Video, GeoLocation } from '@/types';
import { addExcludedVideo, getExcludedVideoIds } from '@/lib/storage';
import { selectRandomVideo, getNextRadius, formatRadius } from '@/lib/videoSelection';
import LoadingAnimation from '@/components/LoadingAnimation';
import VideoEmbed from '@/components/VideoEmbed';

type AppState = 'loading' | 'video' | 'error' | 'timeout' | 'nothing-found';

export default function Home() {
  const [state, setState] = useState<AppState>('loading');
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loadingStartTime, setLoadingStartTime] = useState<number>(Date.now());
  const [errorMessage, setErrorMessage] = useState<string>('');

  const findVideo = useCallback(async (geo: GeoLocation, additionalExcluded: string[] = []) => {
    const startTime = Date.now();
    setLoadingStartTime(startTime);
    setState('loading');

    const excludedIds = [...getExcludedVideoIds(), ...additionalExcluded];
    let radius = 10;

    while (radius !== null && radius <= 1000) {
      try {
        const params = new URLSearchParams({
          latitude: geo.latitude.toString(),
          longitude: geo.longitude.toString(),
          locationRadius: formatRadius(radius),
          maxResults: '10',
          excludedIds: excludedIds.join(','),
        });

        const response = await fetch(`/api/youtube-search?${params}`);
        const data = await response.json();

        if (data.error) {
          console.error('Search error:', data.error);
          setErrorMessage(data.error);
          setState('error');
          return;
        }

        if (data.videos.length > 0) {
          const video = selectRandomVideo(data.videos);
          if (video) {
            // Ensure minimum loading time
            const elapsed = Date.now() - startTime;
            const minWait = Math.max(0, 2000 - elapsed);

            setTimeout(() => {
              addExcludedVideo(video.id, 'offered');
              setCurrentVideo(video);
              setState('video');
            }, minWait);

            return;
          }
        }

        // No videos found, expand radius
        const nextRadius = getNextRadius(radius);
        if (nextRadius === null) {
          break;
        }
        radius = nextRadius;
      } catch (error) {
        console.error('Fetch error:', error);
        setErrorMessage('Failed to connect to the server');
        setState('error');
        return;
      }
    }

    // Nothing found even at max radius
    setState('nothing-found');
  }, []);

  const handleShowAnother = useCallback(() => {
    if (location && currentVideo) {
      findVideo(location, [currentVideo.id]);
    } else if (location) {
      findVideo(location);
    }
  }, [location, currentVideo, findVideo]);

  const handleTimeout = useCallback(() => {
    setState('timeout');
  }, []);

  const handleRetry = useCallback(() => {
    if (location) {
      findVideo(location);
    } else {
      // Re-fetch location and try again
      setState('loading');
      fetch('/api/geolocation')
        .then((res) => res.json())
        .then((geo: GeoLocation) => {
          setLocation(geo);
          findVideo(geo);
        })
        .catch(() => {
          setErrorMessage('Failed to get your location');
          setState('error');
        });
    }
  }, [location, findVideo]);

  // Initial load
  useEffect(() => {
    fetch('/api/geolocation')
      .then((res) => res.json())
      .then((geo: GeoLocation) => {
        setLocation(geo);
        findVideo(geo);
      })
      .catch(() => {
        setErrorMessage('Failed to get your location');
        setState('error');
      });
  }, [findVideo]);

  return (
    <div className="container">
      <main className="main">
        <h1 className="headline">Escape The Algorithm</h1>

        {location && (
          <p className="location-info">
            Looking near {location.city || 'your location'}
            {location.region ? `, ${location.region}` : ''}
          </p>
        )}

        <div className="video-area">
          {state === 'loading' && (
            <LoadingAnimation onTimeout={handleTimeout} />
          )}

          {state === 'video' && currentVideo && (
            <VideoEmbed video={currentVideo} />
          )}

          {state === 'timeout' && (
            <div className="error-message">
              <h2>That was harder than I expected...</h2>
              <p>The search took longer than usual. Want to give it another shot?</p>
              <button className="show-another" onClick={handleRetry}>
                Try again?
              </button>
            </div>
          )}

          {state === 'nothing-found' && (
            <div className="error-message">
              <h2>I guess there&apos;s nothing interesting going on around you.</h2>
              <p>We searched up to 1000 miles and couldn&apos;t find any new videos.</p>
              <button className="show-another" onClick={handleRetry}>
                Try again anyway?
              </button>
            </div>
          )}

          {state === 'error' && (
            <div className="error-message">
              <h2>Something went wrong</h2>
              <p>{errorMessage || 'An unexpected error occurred.'}</p>
              <button className="show-another" onClick={handleRetry}>
                Try again
              </button>
            </div>
          )}
        </div>

        {state === 'video' && currentVideo && (
          <div className="actions">
            <button className="show-another" onClick={handleShowAnother}>
              Show me another
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-links">
          <a href="/about">About</a>
          <a
            href="https://github.com/geekdaily/escape-the-algo"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
        <p className="tagline">
          made with ❤️ by{' '}
          <a href="https://geekdaily.org/" target="_blank" rel="noopener noreferrer">
            geek!daily
          </a>
        </p>
      </footer>
    </div>
  );
}
