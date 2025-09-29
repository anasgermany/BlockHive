
import { Coord, Difficulty } from './types';

export const HEX_SIZE = 24;

export const PIECE_COLORS: { [key: string]: string } = {
  YELLOW: 'gold',
  BLUE: '#3b82f6',
  RED: '#ef4444',
  GREEN: '#22c55e',
  PURPLE: '#a855f7',
  ORANGE: '#f97316',
  TEAL: '#14b8a6',
};

const colors = Object.values(PIECE_COLORS);

const SHAPES_BY_COMPLEXITY: Coord[][] = [
  // Tier 1 (Easy)
  [{ q: 0, r: 0 }], // Single
  [{ q: 0, r: 0 }, { q: 1, r: 0 }], // Double
  [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: -1, r: 0 }], // Triple (line)
  [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }], // Triple (L)
  
  // Tier 2 (Medium)
  [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: -1, r: 0 }, { q: 2, r: 0 }], // Four (line)
  [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }, { q: 1, r: 1 }], // Four (square)
  [{ q: 0, r: 0 }, { q: -1, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }], // Four (T)

  // Tier 3 (Hard)
  [{ q: 0, r: 0 }, { q: 0, r: 1 }, { q: 0, r: 2 }, { q: 1, r: 2 }], // Big L
  [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 }], // S-shape
  [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, { q: 0, r: 1 }, { q: 1, r: 1 }, { q: 0, r: 2 }], // Large triangle
  [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }], // Chevron
];


export const DIFFICULTY_SETTINGS: Record<Difficulty, { boardRadius: number; shapes: Coord[][] }> = {
  easy: {
    boardRadius: 3,
    shapes: SHAPES_BY_COMPLEXITY.slice(0, 4), // Tier 1
  },
  medium: {
    boardRadius: 4,
    shapes: SHAPES_BY_COMPLEXITY.slice(0, 7), // Tiers 1 & 2
  },
  hard: {
    boardRadius: 5,
    shapes: SHAPES_BY_COMPLEXITY.slice(4, 11), // Tiers 2 & 3
  },
};


export const getNewPiece = (id: number, shapes: Coord[][]) => {
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return { id, shape, color };
};

export const POINTS_PER_HEX = 10;
export const POINTS_PER_LINE = 100;
