'use client';

import React, { useEffect, useRef } from 'react';

export const CyberCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Node count based on screen size
    const particleCount = Math.min(60, Math.floor((width * height) / 25000));
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      pulseSpeed: number;
      pulseVal: number;
    }> = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        pulseSpeed: 0.01 + Math.random() * 0.02,
        pulseVal: Math.random() * Math.PI,
      });
    }

    // Mouse position tracking
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 180,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Draw Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle digital background grid (Cyberpunk style)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw nodes and connections
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move particle
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce on boundaries
        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Pulse logic
        p1.pulseVal += p1.pulseSpeed;
        const currentRadius = p1.radius + Math.sin(p1.pulseVal) * 0.8;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, currentRadius, 0, Math.PI * 2);
        // Alternate colors for a glitched digital feel
        if (i % 5 === 0) {
          ctx.fillStyle = 'rgba(255, 0, 85, 0.45)'; // Pink/Magenta
        } else if (i % 8 === 0) {
          ctx.fillStyle = 'rgba(255, 170, 0, 0.45)'; // Amber
        } else {
          ctx.fillStyle = 'rgba(0, 240, 255, 0.45)'; // Cyan
        }
        ctx.fill();

        // Connect to mouse
        const distToMouse = Math.hypot(p1.x - mouse.x, p1.y - mouse.y);
        if (distToMouse < mouse.radius) {
          const alpha = (1 - distToMouse / mouse.radius) * 0.15;
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // Connect to other nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          const maxDist = 120;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.08;
            ctx.strokeStyle = i % 5 === 0 
              ? `rgba(255, 0, 85, ${alpha})` 
              : `rgba(0, 240, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-[#0f111e]"
    />
  );
};
