
import React from 'react';
import { Piece, Coord } from '../types';
import HexPiece from './HexPiece';

interface PieceTrayProps {
  pieces: (Piece | null)[];
  onDragStart: (piece: Piece, offset: Coord) => void;
  onDragEnd: () => void;
  draggedPieceId?: number;
  isAnimating: boolean;
}

const PieceTray: React.FC<PieceTrayProps> = ({ pieces, onDragStart, onDragEnd, draggedPieceId, isAnimating }) => {
  return (
    <div className={`flex justify-around items-center h-32 ${isAnimating ? 'pointer-events-none' : ''}`}>
      {pieces.map((piece, index) => (
        <div key={piece?.id || `empty-${index}`} className={`transition-opacity duration-300 h-full flex items-center justify-center w-1/3 ${draggedPieceId === piece?.id ? 'opacity-30' : 'opacity-100'}`}>
          {piece && (
            <HexPiece piece={piece} onDragStart={onDragStart} onDragEnd={onDragEnd} />
          )}
        </div>
      ))}
    </div>
  );
};

export default PieceTray;