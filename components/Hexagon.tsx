
import React from 'react';
import { HEX_SIZE } from '../constants';

interface HexagonProps {
  q: number;
  r: number;
  fill: string;
  isPreview?: boolean;
  isPlacing?: boolean;
  isClearing?: boolean;
}

const Hexagon: React.FC<HexagonProps> = ({ q, r, fill, isPreview, isPlacing, isClearing }) => {
  const hexWidth = Math.sqrt(3) * HEX_SIZE;
  const hexHeight = 2 * HEX_SIZE;

  const x = hexWidth * (q + r / 2);
  const y = hexHeight * 3 / 4 * r;

  const points = Array.from({ length: 6 }).map((_, i) => {
    const angle_deg = 60 * i - 30;
    const angle_rad = Math.PI / 180 * angle_deg;
    return `${HEX_SIZE * Math.cos(angle_rad)},${HEX_SIZE * Math.sin(angle_rad)}`;
  }).join(' ');
  
  const animationClass = isPlacing ? 'animate-place' : isClearing ? 'animate-clear' : '';

  return (
    <g transform={`translate(${x}, ${y})`} className={animationClass}>
      <polygon
        points={points}
        fill={fill === 'transparent' ? 'rgba(0,0,0,0.3)' : fill}
        stroke={fill === 'transparent' ? 'rgba(255,255,255,0.1)' : '#1e293b'}
        strokeWidth="2"
        className={`transition-colors duration-150 ${isPreview ? 'opacity-70' : ''}`}
      />
    </g>
  );
};

export default Hexagon;