
import React, { useState, useEffect, useRef } from 'react';
import GameBoard from './components/GameBoard';
import PieceTray from './components/PieceTray';
import GameOverModal from './components/GameOverModal';
import DifficultySelector from './components/DifficultySelector';
import ScoringGuideModal from './components/ScoringGuideModal';
import { ParticleProvider, useParticles } from './components/ParticleManager';
import { useGameState } from './hooks/useGameState';
import { Difficulty, Piece, Coord } from './types';
import { music } from './utils/audio';
import { SpeakerOnIcon, SpeakerOffIcon, InformationCircleIcon } from './components/icons';

const AppContent: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const {
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
    restartGame,
  } = useGameState(difficulty);

  const [isMuted, setIsMuted] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);
  const [isScoreAnimating, setIsScoreAnimating] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const prevScoreRef = useRef(score);
  const scoreRef = useRef<HTMLDivElement>(null);
  const particleManager = useParticles();

  useEffect(() => {
    if (score > prevScoreRef.current && particleManager && scoreRef.current) {
      setIsScoreAnimating(true);
      const timer = setTimeout(() => setIsScoreAnimating(false), 400); // Animation duration
      
      const rect = scoreRef.current.getBoundingClientRect();
      particleManager.addParticles({
        count: 20,
        x: rect.left + rect.width / 2,
        y: rect.bottom,
        color: '#fef08a',
        speed: 2,
        gravity: 0.05,
        type: 'shower',
      });

      return () => clearTimeout(timer);
    }
    prevScoreRef.current = score;
  }, [score, particleManager]);

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    music.muted = newMutedState;
    if (!musicStarted) {
      music.play().catch(e => console.warn("Music play failed:", e));
      setMusicStarted(true);
    }
  };

  const customHandleDragStart = (piece: Piece, offset: Coord) => {
    if (!musicStarted) {
      music.play().catch(e => console.warn("Music play failed:", e));
      setMusicStarted(true);
      music.muted = isMuted;
    }
    handleDragStart(piece, offset);
  };

  return (
    <main className="bg-gradient-to-br from-[#0c1a4d] via-[#1d2a6a] to-[#3a2f7c] min-h-screen text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 stardust-bg-animated opacity-20"></div>
      
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        <header className="w-full flex justify-between items-center mb-4 p-4 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
          <div>
            <h1 className="font-bungee text-4xl text-amber-300 tracking-wider" style={{ textShadow: '2px 2px 0 #a16207' }}>
              BlockHive
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-amber-300">SCORE</div>
              <div ref={scoreRef} className={`text-3xl font-black ${isScoreAnimating ? 'animate-score-pop' : ''}`}>{score}</div>
              <div className="text-sm text-amber-200/80 mt-1">High Score: {highScore}</div>
            </div>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="p-2 rounded-full bg-black/20 text-amber-300 hover:bg-black/40 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1d2a6a] focus:ring-amber-300"
              aria-label="Show scoring guide"
            >
              <InformationCircleIcon className="h-6 w-6" />
            </button>
            <button 
              onClick={handleToggleMute} 
              className="p-2 rounded-full bg-black/20 text-amber-300 hover:bg-black/40 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1d2a6a] focus:ring-amber-300" 
              aria-label={isMuted ? "Unmute music" : "Mute music"}
            >
              {isMuted ? <SpeakerOffIcon className="h-6 w-6" /> : <SpeakerOnIcon className="h-6 w-6" />}
            </button>
          </div>
        </header>
        
        <DifficultySelector currentDifficulty={difficulty} onDifficultyChange={setDifficulty} />

        <GameBoard
          board={board}
          preview={preview}
          boardRadius={boardRadius}
          placingCells={placingCells}
          clearingCells={clearingCells}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
        
        <div className="w-full p-4 mt-6 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
          <PieceTray
            pieces={pieces}
            onDragStart={customHandleDragStart}
            onDragEnd={handleDragEnd}
            draggedPieceId={draggedPiece?.piece.id}
            isAnimating={isAnimating}
          />
        </div>

      </div>

      <GameOverModal
        isOpen={isGameOver}
        score={score}
        highScore={highScore}
        onRestart={restartGame}
      />
      <ScoringGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </main>
  );
};


const App: React.FC = () => (
  <ParticleProvider>
    <AppContent />
  </ParticleProvider>
);


export default App;
