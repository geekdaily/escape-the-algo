'use client';

import { useEffect, useRef } from 'react';
import { Video } from '@/types';
import { updateVideoReason } from '@/lib/storage';
import styles from './VideoEmbed.module.css';

interface VideoEmbedProps {
  video: Video;
}

export default function VideoEmbed({ video }: VideoEmbedProps) {
  const hasTrackedPlay = useRef(false);

  useEffect(() => {
    // Reset tracking when video changes
    hasTrackedPlay.current = false;
  }, [video.id]);

  const handleIframeLoad = () => {
    // We can't directly detect play events from YouTube iframe without the API
    // So we'll mark as "played" after a brief delay when the user is viewing it
    // A more sophisticated implementation would use the YouTube IFrame API
    if (!hasTrackedPlay.current) {
      hasTrackedPlay.current = true;
      // Mark as played after 5 seconds of viewing
      const timeoutId = setTimeout(() => {
        updateVideoReason(video.id, 'played');
      }, 5000);
      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <div className={styles.container}>
      <iframe
        className={styles.iframe}
        src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={handleIframeLoad}
      />
      <div className={styles.info}>
        <h2 className={styles.title}>{video.title}</h2>
        <p className={styles.channel}>{video.channelTitle}</p>
      </div>
    </div>
  );
}
