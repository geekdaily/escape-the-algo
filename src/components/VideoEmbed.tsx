'use client';

import { useEffect, useRef } from 'react';
import { Video } from '@/types';
import { updateVideoReason } from '@/lib/storage';
import styles from './VideoEmbed.module.css';

interface VideoEmbedProps {
  video: Video;
}

export default function VideoEmbed({ video }: VideoEmbedProps) {
  const iframeLoaded = useRef(false);

  // Track video as "played" after 5 seconds of viewing
  useEffect(() => {
    iframeLoaded.current = false;

    const timeoutId = setTimeout(() => {
      updateVideoReason(video.id, 'played');
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [video.id]);

  const handleIframeLoad = () => {
    iframeLoaded.current = true;
  };

  return (
    <div className={styles.container}>
      <iframe
        className={styles.iframe}
        src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1`}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={handleIframeLoad}
      />
      <div className={styles.info}>
        <h2 className={styles.title}>{video.title}</h2>
        <p className={styles.channel}>{video.channelTitle}</p>
      </div>
    </div>
  );
}
