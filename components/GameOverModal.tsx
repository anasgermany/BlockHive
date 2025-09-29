
import React, { useState, useEffect } from 'react';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, score, highScore, onRestart }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (isOpen) {
      let animationFrameId: number;
      let startTime: number | null = null;
      const duration = 800; // ms

      const animateScore = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        const easedPercentage = 1 - Math.pow(1 - percentage, 3); // easeOutCubic

        const currentScore = Math.floor(easedPercentage * score);
        setDisplayScore(currentScore);

        if (progress < duration) {
          animationFrameId = requestAnimationFrame(animateScore);
        } else {
            setDisplayScore(score); // Ensure it ends on the exact score
        }
      };

      animationFrameId = requestAnimationFrame(animateScore);

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    } else {
        // Reset score for next time modal opens
        setDisplayScore(0);
    }
  }, [isOpen, score]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-gradient-to-br from-[#1d2a6a] to-[#3a2f7c] rounded-2xl shadow-2xl p-8 text-center border-2 border-amber-300/50 transform transition-all scale-95 opacity-0 animate-fade-in-scale">
        <h2 className="font-bungee text-5xl text-amber-300 mb-2" style={{ textShadow: '2px 2px 0 #a16207' }}>Game Over</h2>
        <p className="text-lg text-white/80 mb-6">You couldn't place any more pieces!</p>

        <div className="bg-black/20 rounded-lg p-6 mb-8">
          <div className="mb-4">
            <p className="text-xl font-bold text-amber-300">FINAL SCORE</p>
            <p className="text-6xl font-black">{displayScore}</p>
          </div>
          <div>
            <p className="text-md text-amber-200/80">High Score</p>
            <p className="text-2xl font-bold">{highScore}</p>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="font-bungee bg-amber-400 hover:bg-amber-300 text-slate-800 font-bold py-4 px-10 rounded-lg text-2xl transition-transform transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-300/50"
        >
          Play Again
        </button>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale { animation: fade-in-scale 0.3s forwards cubic-bezier(0.25, 0.46, 0.45, 0.94); }
      `}</style>
    </div>
  );
};

export default GameOverModal;