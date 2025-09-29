
export interface Coord {
  q: number;
  r: number;
}

export interface Piece {
  id: number;
  shape: Coord[];
  color: string;
}

export type Board = Map<string, string>;

export interface DraggedPieceInfo {
  piece: Piece;
  offset: Coord;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
