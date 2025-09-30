import { useState, useEffect, useCallback } from 'react';
import { Board, Piece, Coord, DraggedPieceInfo, Difficulty } from '../types';
import { DIFFICULTY_SETTINGS, getNewPiece, POINTS_PER_HEX, POINTS_PER_LINE } from '../constants';
import { playPlaceSound, playLineClearSound, playGameOverSound } from '../utils/audio';

const coordToString = (c: Coord) => `${c.q},${c.r}`;

const stringToCoord = (s: string): Coord => {
  const [q, r] = s.split(',').map(Number);
  return { q, r };
};

const createEmptyBoard = (radius: number): Board => {
  const newBoard: Board = new Map();
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const s = -q - r;
      if (s >= -radius && s <= radius) {
        newBoard.set(coordToString({ q, r }), '');
      }
    }
  }
  return newBoard;
};

const checkForLineClears = (currentBoard: Board, radius: number): { linesToClear: number, cellsToClear: Set<string> } => {
    const lines = new Map<string, Coord[]>();
    for (let r = -radius; r <= radius; r++) lines.set(`r${r}`, []);
    for (let q = -radius; q <= radius; q++) lines.set(`q${q}`, []);
    for (let qrSum = -radius; qrSum <= radius; qrSum++) lines.set(`s${qrSum}`, []);
    
    for (const coordStr of currentBoard.keys()){
        if (currentBoard.get(coordStr) !== ''){
            const c = stringToCoord(coordStr);
            lines.get(`r${c.r}`)?.push(c);
            lines.get(`q${c.q}`)?.push(c);
            lines.get(`s${c.q + c.r}`)?.push(c);
        }
    }

    const cellsToClear = new Set<string>();
    let linesCleared = 0;
    
    for(const [key, coords] of lines.entries()){
        let lineLength;
        if(key.startsWith('r')){
            const r = parseInt(key.substring(1));
            lineLength = 2 * radius + 1 - Math.abs(r);
        } else if(key.startsWith('q')){
            const q = parseInt(key.substring(1));
            lineLength = 2 * radius + 1 - Math.abs(q);
        } else {
            const qrSum = parseInt(key.substring(1));
            lineLength = 2 * radius + 1 - Math.abs(qrSum);
        }

        if (coords.length === lineLength) {
            linesCleared++;
            coords.forEach(c => cellsToClear.add(coordToString(c)));
        }
    }
    return { linesToClear: linesCleared, cellsToClear };
};


export const useGameState = (difficulty: Difficulty) => {
  const { boardRadius, shapes } = DIFFICULTY_SETTINGS[difficulty];

  const [board, setBoard] = useState<Board>(() => createEmptyBoard(boardRadius));
  const [pieces, setPieces] = useState<(Piece | null)[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('blockhive_highscore') || '0'));
  const [isGameOver, setIsGameOver] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<DraggedPieceInfo | null>(null);
  const [preview, setPreview] = useState<Map<string, string>>(new Map());
  const [placingCells, setPlacingCells] = useState<Map<string, number>>(new Map());
  const [clearingCells, setClearingCells] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  const canPlacePiece = useCallback((currentBoard: Board, piece: Piece, anchor: Coord): boolean => {
    for (const cell of piece.shape) {
      const targetCoord = coordToString({ q: anchor.q + cell.q, r: anchor.r + cell.r });
      if (!currentBoard.has(targetCoord) || currentBoard.get(targetCoord) !== '') {
        return false;
      }
    }
    return true;
  }, []);

  const checkForGameOver = useCallback((currentBoard: Board, currentPieces: (Piece | null)[]): boolean => {
    const availablePieces = currentPieces.filter((p): p is Piece => p !== null);
    if (availablePieces.length === 0) return false;

    for (const piece of availablePieces) {
      if (!piece) continue;
      for (const key of currentBoard.keys()) {
        if (currentBoard.get(key) === '') {
          const coord = stringToCoord(key);
          if (canPlacePiece(currentBoard, piece, coord)) {
            return false;
          }
        }
      }
    }
    return true;
  }, [canPlacePiece]);
  
  const restartGame = useCallback(() => {
    setBoard(createEmptyBoard(boardRadius));
    setPieces([getNewPiece(1, shapes), getNewPiece(2, shapes), getNewPiece(3, shapes)]);
    setScore(0);
    setIsGameOver(false);
    setIsAnimating(false);
    setPlacingCells(new Map());
    setClearingCells(new Set());
  }, [boardRadius, shapes]);

  useEffect(() => {
    restartGame();
  }, [difficulty, restartGame]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('blockhive_highscore', String(score));
    }
  }, [score, highScore]);
  
  const placePiece = useCallback((pieceToPlace: Piece, anchor: Coord) => {
    if (!canPlacePiece(board, pieceToPlace, anchor)) {
      return;
    }

    setIsAnimating(true);
    // FIX: Explicitly type `newBoard` as `Board` to help TypeScript's type inference.
    const newBoard: Board = new Map(board);
    const placedCoords = new Map<string, number>();

    pieceToPlace.shape.forEach((cell, index) => {
      const targetCoordStr = coordToString({ q: anchor.q + cell.q, r: anchor.r + cell.r });
      newBoard.set(targetCoordStr, pieceToPlace.color);
      placedCoords.set(targetCoordStr, index);
    });

    setBoard(newBoard);
    setPlacingCells(placedCoords);
    setScore(prev => prev + pieceToPlace.shape.length * POINTS_PER_HEX);
    setPieces(prevPieces => prevPieces.map(p => p?.id === pieceToPlace.id ? null : p));

    setTimeout(() => {
      setPlacingCells(new Map());
      const { linesToClear, cellsToClear } = checkForLineClears(newBoard, boardRadius);

      if (cellsToClear.size > 0) {
        playLineClearSound();
        setClearingCells(cellsToClear);
        setTimeout(() => {
          // FIX: Explicitly type `boardAfterClear` as `Board` to help TypeScript's type inference.
          const boardAfterClear: Board = new Map(newBoard);
          cellsToClear.forEach(coordStr => boardAfterClear.set(coordStr, ''));
          setBoard(boardAfterClear);
          setClearingCells(new Set());

          setScore(prev => prev + Math.floor(linesToClear * POINTS_PER_LINE * (1 + (linesToClear - 1) * 0.5)));
          
          setPieces(prevPieces => {
            const allPiecesUsed = prevPieces.every(p => p === null);
            let nextPieces = prevPieces;
            if (allPiecesUsed) {
                nextPieces = [getNewPiece(1, shapes), getNewPiece(2, shapes), getNewPiece(3, shapes)];
            }

            if (checkForGameOver(boardAfterClear, nextPieces)) {
              playGameOverSound();
              setIsGameOver(true);
            }
            return nextPieces;
          });
          
          setIsAnimating(false);
        }, 500); // clear animation duration
      } else {
        playPlaceSound();
        setPieces(prevPieces => {
            const allPiecesUsed = prevPieces.every(p => p === null);
            let nextPieces = prevPieces;
            if (allPiecesUsed) {
                nextPieces = [getNewPiece(1, shapes), getNewPiece(2, shapes), getNewPiece(3, shapes)];
            }
           if (checkForGameOver(newBoard, nextPieces)) {
            playGameOverSound();
            setIsGameOver(true);
          }
          return nextPieces;
        });
        setIsAnimating(false);
      }
    }, 400); // place animation duration

  }, [board, canPlacePiece, checkForGameOver, boardRadius, shapes]);

  const handleDragStart = useCallback((piece: Piece, offset: Coord) => {
    setDraggedPiece({ piece, offset });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedPiece(null);
    setPreview(new Map());
  }, []);

  const handleDragOver = useCallback((hoverCoord: Coord | null) => {
    if (!draggedPiece || !hoverCoord) {
      setPreview(new Map());
      return;
    }

    const { piece, offset } = draggedPiece;
    const anchorCoord = {
      q: hoverCoord.q - offset.q,
      r: hoverCoord.r - offset.r
    };

    const newPreview = new Map<string, string>();
    const canPlace = canPlacePiece(board, piece, anchorCoord);

    for (const cell of piece.shape) {
      const key = coordToString({ q: anchorCoord.q + cell.q, r: anchorCoord.r + cell.r });
      newPreview.set(key, canPlace ? piece.color : 'rgba(239, 68, 68, 0.7)');
    }
    setPreview(newPreview);
  }, [draggedPiece, board, canPlacePiece]);

  const handleDrop = useCallback((dropCoord: Coord) => {
    if (!draggedPiece || isAnimating) return;

    const { piece, offset } = draggedPiece;
    const anchorCoord = {
      q: dropCoord.q - offset.q,
      r: dropCoord.r - offset.r
    };
    
    placePiece(piece, anchorCoord);
    setDraggedPiece(null);
    setPreview(new Map());
  }, [draggedPiece, placePiece, isAnimating]);

  return {
    board,
    pieces,
    score,
    highScore,
    isGameOver,
    draggedPiece,
    preview,
    boardRadius,
    placingCells,
    clearingCells,
    isAnimating,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    restartGame
  };
};