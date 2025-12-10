'use client';

import { useEffect, useRef } from 'react';
import styles from './LoadingAnimation.module.css';

interface LoadingAnimationProps {
  onTimeout?: () => void;
  minDuration?: number;
  maxDuration?: number;
}

export default function LoadingAnimation({
  onTimeout,
  minDuration = 2000,
  maxDuration = 15000,
}: LoadingAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle system for the "escaping algorithm" effect
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      hue: number;
      life: number;
      maxLife: number;
    }

    const particles: Particle[] = [];
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Grid lines that represent "the algorithm"
    interface GridLine {
      start: { x: number; y: number };
      end: { x: number; y: number };
      progress: number;
      breaking: boolean;
      breakPoint: number;
      hue: number;
    }

    const gridLines: GridLine[] = [];

    // Create initial grid
    const gridSpacing = 40;
    for (let x = 0; x < width; x += gridSpacing) {
      gridLines.push({
        start: { x, y: 0 },
        end: { x, y: height },
        progress: 1,
        breaking: false,
        breakPoint: Math.random(),
        hue: 200 + Math.random() * 40,
      });
    }
    for (let y = 0; y < height; y += gridSpacing) {
      gridLines.push({
        start: { x: 0, y },
        end: { x: width, y },
        progress: 1,
        breaking: false,
        breakPoint: Math.random(),
        hue: 200 + Math.random() * 40,
      });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.016;
      ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Randomly break grid lines
      if (Math.random() < 0.05) {
        const randomLine = gridLines[Math.floor(Math.random() * gridLines.length)];
        if (!randomLine.breaking) {
          randomLine.breaking = true;
        }
      }

      // Draw and update grid lines
      gridLines.forEach((line) => {
        if (line.breaking) {
          line.progress -= 0.02;
          // Spawn particles at break point
          if (Math.random() < 0.3) {
            const breakX = line.start.x + (line.end.x - line.start.x) * line.breakPoint;
            const breakY = line.start.y + (line.end.y - line.start.y) * line.breakPoint;
            particles.push({
              x: breakX,
              y: breakY,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              size: Math.random() * 3 + 1,
              hue: line.hue,
              life: 1,
              maxLife: 1,
            });
          }
        }

        if (line.progress > 0) {
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${line.hue}, 70%, 50%, ${line.progress * 0.5})`;
          ctx.lineWidth = 1;

          if (line.breaking) {
            // Draw broken line
            const midX = line.start.x + (line.end.x - line.start.x) * line.breakPoint;
            const midY = line.start.y + (line.end.y - line.start.y) * line.breakPoint;

            ctx.moveTo(line.start.x, line.start.y);
            ctx.lineTo(
              midX - (midX - line.start.x) * (1 - line.progress),
              midY - (midY - line.start.y) * (1 - line.progress)
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(
              midX + (line.end.x - midX) * (1 - line.progress),
              midY + (line.end.y - midY) * (1 - line.progress)
            );
            ctx.lineTo(line.end.x, line.end.y);
            ctx.stroke();
          } else {
            ctx.moveTo(line.start.x, line.start.y);
            ctx.lineTo(line.end.x, line.end.y);
            ctx.stroke();
          }
        } else if (line.progress <= 0) {
          // Reset line
          line.progress = 1;
          line.breaking = false;
          line.breakPoint = Math.random();
          line.hue = 200 + Math.random() * 40;
        }
      });

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= 0.015;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue + (1 - p.life) * 60}, 80%, 60%, ${p.life})`;
        ctx.fill();
      }

      // Draw central "escape" energy
      const centerX = width / 2;
      const centerY = height / 2;
      const pulseSize = 50 + Math.sin(time * 3) * 20;

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
      gradient.addColorStop(0, `hsla(${(time * 50) % 360}, 80%, 60%, 0.8)`);
      gradient.addColorStop(0.5, `hsla(${(time * 50 + 60) % 360}, 70%, 50%, 0.3)`);
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Emit particles from center
      if (Math.random() < 0.2) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 2,
          hue: (time * 50) % 360,
          life: 1,
          maxLife: 1,
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Set up timeout
    const timeoutId = setTimeout(() => {
      onTimeout?.();
    }, maxDuration);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(timeoutId);
      window.removeEventListener('resize', resize);
    };
  }, [maxDuration, onTimeout]);

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.text}>
        <span className={styles.searching}>Escaping the algorithm</span>
        <span className={styles.dots}>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    </div>
  );
}
