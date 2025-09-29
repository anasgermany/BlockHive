
import React from 'react';
import { Difficulty, DIFFICULTIES } from '../types';

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ currentDifficulty, onDifficultyChange }) => {
  return (
    <div className="flex justify-center items-center gap-2 mb-4 p-2 rounded-lg bg-black/20 backdrop-blur-sm w-full">
      {DIFFICULTIES.map((difficulty) => (
        <button
          key={difficulty}
          onClick={() => onDifficultyChange(difficulty)}
          className={`w-full capitalize font-bold py-2 px-4 rounded-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1d2a6a] focus:ring-amber-300 ${
            currentDifficulty === difficulty
              ? 'bg-amber-400 text-slate-800 shadow-lg'
              : 'bg-slate-700/50 hover:bg-slate-600/50 text-white/70'
          }`}
          aria-pressed={currentDifficulty === difficulty}
        >
          {difficulty}
        </button>
      ))}
    </div>
  );
};

export default DifficultySelector;
