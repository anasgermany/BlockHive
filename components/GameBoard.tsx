import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Board, Coord } from '../types';
import Hexagon from './Hexagon';
import { HEX_SIZE } from '../constants';
import { useParticles } from './ParticleManager';

interface GameBoardProps {
  board: Board;
  preview: Map<string, string>;
  boardRadius: number;
  placingCells: Map<string, number>;
  clearingCells: Set<string>;
  onDragOver: (coord: Coord | null) => void;
  onDrop: (coord: Coord) => void;
}

const stringToCoord = (s: string): Coord => {
  const [q, r] = s.split(',').map(Number);
  return { q, r };
};

const GameBoard: React.FC<GameBoardProps> = ({ board, preview, boardRadius, placingCells, clearingCells, onDragOver, onDrop }) => {
  const [boardCoords, setBoardCoords] = useState<Coord[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const particleManager = useParticles();
  
  const hexWidth = Math.sqrt(3) * HEX_SIZE;
  const hexHeight = 2 * HEX_SIZE;
  const boardWidth = (2 * boardRadius + 1.5) * hexWidth;
  const boardHeight = (2 * boardRadius + 1.5) * (hexHeight * 3 / 4);

  useMemo(() => {
    const coords: Coord[] = [];
    for (let q = -boardRadius; q <= boardRadius; q++) {
      for (let r = -boardRadius; r <= boardRadius; r++) {
        if (-q - r >= -boardRadius && -q - r <= boardRadius) {
          coords.push({ q, r });
        }
      }
    }
    setBoardCoords(coords);
  }, [boardRadius]);

  const getCoordFromMouseEvent = useCallback((e: React.MouseEvent): Coord | null => {
    if (!svgRef.current) return null;

    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;

    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return null;
    
    const transformedPoint = svgPoint.matrixTransform(ctm.inverse());
    const { x, y } = transformedPoint;
    
    // Convert pixel to axial coordinates (q, r)
    const q_frac = (Math.sqrt(3)/3 * (x - boardWidth/2) - 1/3 * (y - boardHeight/2)) / HEX_SIZE;
    const r_frac = (2/3 * (y - boardHeight/2)) / HEX_SIZE;
    const s_frac = -q_frac - r_frac;

    let q = Math.round(q_frac);
    let r = Math.round(r_frac);
    let s = Math.round(s_frac);

    const q_diff = Math.abs(q - q_frac);
    const r_diff = Math.abs(r - r_frac);
    const s_diff = Math.abs(s - s_frac);

    if (q_diff > r_diff && q_diff > s_diff) {
      q = -r - s;
    } else if (r_diff > s_diff) {
      r = -q - s;
    } else {
      s = -q - r;
    }
    
    return { q, r };
  }, [boardWidth, boardHeight]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const coord = getCoordFromMouseEvent(e);
    onDragOver(coord);
  }, [getCoordFromMouseEvent, onDragOver]);

  const handleDrop = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const coord = getCoordFromMouseEvent(e);
    if (coord) {
      onDrop(coord);
    }
  }, [getCoordFromMouseEvent, onDrop]);
  
  const handleDragLeave = () => {
    onDragOver(null);
  };
  
  useEffect(() => {
    if (clearingCells.size > 0 && particleManager && svgRef.current) {
        const svgRect = svgRef.current.getBoundingClientRect();
        clearingCells.forEach(cellStr => {
            const { q, r } = stringToCoord(cellStr);
            const x = hexWidth * (q + r / 2) + boardWidth / 2 + svgRect.left;
            const y = hexHeight * 3 / 4 * r + boardHeight / 2 + svgRect.top;

            particleManager.addParticles({
                count: 5,
                x: x,
                y: y,
                color: '#fef08a',
            });
        });
    }
  }, [clearingCells, particleManager, hexWidth, hexHeight, boardWidth, boardHeight]);

  return (
    <div 
      className="relative w-full aspect-square my-2"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
        className="absolute inset-0 w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleDragLeave}
      >
        <g transform={`translate(${boardWidth / 2}, ${boardHeight / 2})`}>
          {boardCoords.map(({ q, r }) => {
            const key = `${q},${r}`;
            const isPlacing = placingCells.has(key);
            const placingIndex = placingCells.get(key);
            const isClearing = clearingCells.has(key);
            let fill = board.get(key) || 'transparent';
            if (preview.has(key)) {
                fill = preview.get(key)!;
            }

            return (
              <Hexagon
                key={key}
                q={q}
                r={r}
                fill={fill}
                isPreview={preview.has(key)}
                isPlacing={isPlacing}
                placingIndex={placingIndex}
                isClearing={isClearing}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default GameBoard;