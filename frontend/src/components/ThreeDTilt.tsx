'use client';

import React, { useState, useRef, MouseEvent } from 'react';

interface ThreeDTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt angle in degrees
  perspective?: number; // 3D Perspective value in px
}

export const ThreeDTilt: React.FC<ThreeDTiltProps> = ({
  children,
  className = '',
  maxTilt = 10,
  perspective = 1000,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [glowX, setGlowX] = useState(50);
  const [glowY, setGlowY] = useState(50);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to card center (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    // Calculate tilt angles (X tilt depends on Y mouse position, Y tilt depends on X mouse position)
    const tiltX = -mouseY * maxTilt;
    const tiltY = mouseX * maxTilt;

    setRotateX(tiltX);
    setRotateY(tiltY);
    setScale(1.02);

    // Calculate mouse position as percentage for glow effect background position
    const percentX = ((e.clientX - rect.left) / width) * 100;
    const percentY = ((e.clientY - rect.top) / height) * 100;
    setGlowX(percentX);
    setGlowY(percentY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-all duration-200 ease-out ${className}`}
      style={{
        transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Dynamic light refraction glow overlay on hover */}
      {scale > 1 && (
        <div
          className="absolute inset-0 pointer-events-none rounded-inherit z-30 transition-opacity duration-300 opacity-25"
          style={{
            background: `radial-gradient(circle 200px at ${glowX}% ${glowY}%, rgba(0, 240, 255, 0.4) 0%, transparent 80%)`,
            mixBlendMode: 'screen',
          }}
        />
      )}
      <div style={{ transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  );
};
