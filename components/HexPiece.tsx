
import React from 'react';
import { Piece, Coord } from '../types';

interface HexPieceProps {
  piece: Piece;
  onDragStart: (piece: Piece, offset: Coord) => void;
  onDragEnd: () => void;
}

const PIECE_HEX_SIZE = 16;
const PIECE_HEX_WIDTH = Math.sqrt(3) * PIECE_HEX_SIZE;
const PIECE_HEX_HEIGHT = 2 * PIECE_HEX_SIZE;

const HexagonShape: React.FC<{ fill: string }> = ({ fill }) => {
  const points = Array.from({ length: 6 }).map((_, i) => {
    const angle_deg = 60 * i - 30;
    const angle_rad = Math.PI / 180 * angle_deg;
    return `${PIECE_HEX_SIZE * Math.cos(angle_rad)},${PIECE_HEX_SIZE * Math.sin(angle_rad)}`;
  }).join(' ');

  return (
    <polygon
      points={points}
      fill={fill}
      stroke="#1e293b"
      strokeWidth="2"
    />
  );
};

const HexPiece: React.FC<HexPieceProps> = ({ piece, onDragStart, onDragEnd }) => {
  const { shape, color } = piece;

  const minQ = Math.min(...shape.map(c => c.q));
  const maxQ = Math.max(...shape.map(c => c.q));
  const minR = Math.min(...shape.map(c => c.r));
  const maxR = Math.max(...shape.map(c => c.r));

  const width = (maxQ - minQ + 1) * PIECE_HEX_WIDTH + PIECE_HEX_WIDTH / 2;
  const height = (maxR - minR + 1) * PIECE_HEX_HEIGHT * 3 / 4 + PIECE_HEX_HEIGHT / 4;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Find which hex was clicked
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    let closestHex = shape[0];
    let minDist = Infinity;
    
    shape.forEach(coord => {
        const x = PIECE_HEX_WIDTH * (coord.q - minQ + (coord.r - minR) / 2) + PIECE_HEX_WIDTH / 2;
        const y = PIECE_HEX_HEIGHT * 3/4 * (coord.r - minR) + PIECE_HEX_HEIGHT / 2;
        const dist = Math.sqrt(Math.pow(clickX - x, 2) + Math.pow(clickY - y, 2));
        if (dist < minDist) {
            minDist = dist;
            closestHex = coord;
        }
    });

    onDragStart(piece, closestHex);
    
    // Custom drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.transform = 'scale(1.5)';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, e.clientX-rect.left, e.clientY-rect.top);

    setTimeout(() => document.body.removeChild(dragImage), 0);
  };


  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className="cursor-grab active:cursor-grabbing transition-transform duration-200 hover:scale-110"
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        <g transform={`translate(${PIECE_HEX_WIDTH / 2}, ${PIECE_HEX_HEIGHT / 2})`}>
        {shape.map(({ q, r }) => (
          <g key={`${q},${r}`} transform={`translate(${PIECE_HEX_WIDTH * (q - minQ + (r - minR) / 2)}, ${PIECE_HEX_HEIGHT * 3/4 * (r - minR)})`}>
            <HexagonShape fill={color} />
          </g>
        ))}
        </g>
      </svg>
    </div>
  );
};

export default HexPiece;