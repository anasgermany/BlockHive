
import React, { useMemo, useState, useCallback } from 'react';
import { Board, Coord } from '../types';
import Hexagon from './Hexagon';
import { HEX_SIZE } from '../constants';

interface GameBoardProps {
  board: Board;
  preview: Map<string, string>;
  boardRadius: number;
  placingCells: Set<string>;
  clearingCells: Set<string>;
  onDragOver: (coord: Coord | null) => void;
  onDrop: (coord: Coord) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, preview, boardRadius, placingCells, clearingCells, onDragOver, onDrop }) => {
  const [boardCoords, setBoardCoords] = useState<Coord[]>([]);
  
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

  const pixelToHex = useCallback((x: number, y: number): Coord => {
    const q = (Math.sqrt(3)/3 * x - 1/3 * y) / HEX_SIZE;
    const r = (2/3 * y) / HEX_SIZE;
    return hexRound({q, r});
  }, []);

  const hexRound = (frac: {q: number, r: number}): Coord => {
    const q = Math.round(frac.q);
    const r = Math.round(frac.r);
    const s = Math.round(-frac.q - frac.r);

    const q_diff = Math.abs(q - frac.q);
    const r_diff = Math.abs(r - frac.r);
    const s_diff = Math.abs(s - (-frac.q - frac.r));

    if (q_diff > r_diff && q_diff > s_diff) {
        return { q: -r -s, r: r };
    } else if (r_diff > s_diff) {
        return { q: q, r: -q -s };
    } else {
        return { q: q, r: r };
    }
  };

  const handleDragOver = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault();
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const transformed = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const hexCoord = pixelToHex(transformed.x - boardWidth/2, transformed.y - boardHeight/2);
    onDragOver(hexCoord);
  };
  
  const handleDrop = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault();
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const transformed = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const hexCoord = pixelToHex(transformed.x - boardWidth/2, transformed.y - boardHeight/2);
    onDrop(hexCoord);
  };

  return (
    <div className="flex justify-center items-center my-4">
      <svg
        width={boardWidth}
        height={boardHeight}
        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={() => onDragOver(null)}
        className="drop-shadow-lg"
      >
        <g transform={`translate(${boardWidth / 2}, ${boardHeight / 2})`}>
          {boardCoords.map(({ q, r }) => {
            const key = `${q},${r}`;
            const color = preview.get(key) || board.get(key) || 'transparent';
            const isPreview = preview.has(key);
            const isPlacing = placingCells.has(key);
            const isClearing = clearingCells.has(key);

            return (
              <Hexagon
                key={key}
                q={q}
                r={r}
                fill={color}
                isPreview={isPreview}
                isPlacing={isPlacing}
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