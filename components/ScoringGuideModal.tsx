
import React from 'react';

interface ScoringGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScoringGuideModal: React.FC<ScoringGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="scoring-guide-title"
    >
      <div 
        className="bg-gradient-to-br from-[#1d2a6a] to-[#3a2f7c] rounded-2xl shadow-2xl p-8 text-left border-2 border-amber-300/50 transform transition-all scale-95 opacity-0 animate-fade-in-scale w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-start mb-6">
          <h2 id="scoring-guide-title" className="font-bungee text-4xl text-amber-300" style={{ textShadow: '2px 2px 0 #a16207' }}>
            Scoring Guide
          </h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors text-4xl font-light leading-none" aria-label="Close scoring guide">&times;</button>
        </div>
        
        <div className="space-y-6 text-white/90">
          <div>
            <h3 className="font-bungee text-xl text-amber-300 mb-2">Placing Pieces</h3>
            <p>You score points for every hexagon tile in a piece you place on the board.</p>
            <p className="mt-2 text-lg"><strong className="font-black text-white">10 points</strong> per hexagon.</p>
          </div>

          <div>
            <h3 className="font-bungee text-xl text-amber-300 mb-2">Clearing Lines</h3>
            <p>Complete a line of hexagons from one edge of the board to the other in any of the 3 directions to clear it and earn bonus points. Clearing multiple lines at once grants a combo bonus!</p>
            <ul className="mt-3 space-y-2 bg-black/20 p-4 rounded-lg list-none">
              <li><strong className="font-bold text-white w-24 inline-block">1 Line:</strong> 100 points</li>
              <li><strong className="font-bold text-white w-24 inline-block">2 Lines:</strong> 300 points</li>
              <li><strong className="font-bold text-white w-24 inline-block">3 Lines:</strong> 600 points</li>
              <li><strong className="font-bold text-white w-24 inline-block">4+ Lines:</strong> Keep going!</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="font-bungee mt-8 w-full bg-amber-400 hover:bg-amber-300 text-slate-800 font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-300/50"
        >
          Got it!
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

export default ScoringGuideModal;
