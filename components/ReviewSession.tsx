import React, { useState, useEffect } from 'react';
import { Flashcard, Deck, SRSGrade } from '../types';
import { calculateNextReview } from '../services/srs';
import { X, RotateCcw, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ReviewSessionProps {
  deck: Deck;
  dueCards: Flashcard[];
  onComplete: () => void;
  onUpdateCard: (card: Flashcard, log: any) => void;
}

const ReviewSession: React.FC<ReviewSessionProps> = ({ deck, dueCards, onComplete, onUpdateCard }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionQueue, setSessionQueue] = useState<Flashcard[]>(dueCards);
  const [doneCount, setDoneCount] = useState(0);

  const currentCard = sessionQueue[currentIndex];

  useEffect(() => {
    if (sessionQueue.length === 0) {
      // Session finished
    }
  }, [sessionQueue]);

  const handleRate = (rating: SRSGrade) => {
    const card = sessionQueue[currentIndex];
    const updates = calculateNextReview(card, rating);
    
    const updatedCard = { ...card, ...updates };
    
    // Log entry
    const log = {
      id: crypto.randomUUID(),
      cardId: card.id,
      rating,
      timestamp: Date.now()
    };

    onUpdateCard(updatedCard, log);

    // If 'again', requeue card at end of session (Noji style often does this for daily learning)
    // For simplicity, we just mark progress.
    // If interval is 0 (learning step), we might want to see it again today.
    
    let newQueue = [...sessionQueue];
    if (updates.interval === 0 && rating === 'again') {
        newQueue.push(updatedCard); // Add to back of queue
    }

    setDoneCount(prev => prev + 1);
    
    if (currentIndex + 1 >= sessionQueue.length) {
       onComplete();
    } else {
       setIsFlipped(false);
       setCurrentIndex(prev => prev + 1);
    }
  };

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">All caught up!</h2>
        <p className="text-slate-500 mb-8">You have no more cards due for this deck.</p>
        <button 
          onClick={onComplete}
          className="px-8 py-3 bg-brand-600 text-white rounded-xl font-medium shadow-lg hover:bg-brand-700 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-4 flex items-center justify-between bg-white shadow-sm z-10">
        <button onClick={onComplete} className="p-2 -ml-2 text-slate-400 hover:text-slate-700">
           <X size={24} />
        </button>
        <div className="flex flex-col items-center">
            <span className="text-sm font-semibold text-slate-700">{deck.name}</span>
            <span className="text-xs text-slate-400">{currentIndex + 1} / {sessionQueue.length}</span>
        </div>
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-200">
        <div 
            className="h-full bg-brand-500 transition-all duration-300" 
            style={{ width: `${((currentIndex) / sessionQueue.length) * 100}%` }} 
        />
      </div>

      {/* Card Area */}
      <div className="flex-1 flex items-center justify-center p-6 relative perspective-1000">
        <div 
          className="w-full max-w-md aspect-[4/5] bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] relative cursor-pointer transition-transform duration-500 transform-style-3d border border-slate-100"
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ 
             transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
             transformStyle: 'preserve-3d',
             perspective: '1000px'
          }}
        >
            {/* Front */}
            <div 
                className="absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
            >
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Front</div>
                <div className="text-2xl text-center font-medium text-slate-800 prose">
                    {currentCard.front}
                </div>
            </div>

            {/* Back */}
            <div 
                className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl"
                style={{ 
                    backfaceVisibility: 'hidden', 
                    transform: 'rotateY(180deg)' 
                }}
            >
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Back</div>
                <div className="text-2xl text-center font-medium text-slate-800 prose">
                    {currentCard.back}
                </div>
            </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white px-6 py-6 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        {!isFlipped ? (
            <button 
                onClick={() => setIsFlipped(true)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold shadow-lg active:scale-[0.98] transition-transform"
            >
                Show Answer
            </button>
        ) : (
            <div className="grid grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                     <button 
                        onClick={() => handleRate('again')}
                        className="py-3 bg-rose-100 text-rose-700 rounded-xl font-semibold hover:bg-rose-200 transition-colors border border-rose-200"
                    >
                        Again
                    </button>
                    <span className="text-[10px] text-center text-slate-400 font-medium">1m</span>
                </div>
                
                <div className="flex flex-col gap-1">
                    <button 
                        onClick={() => handleRate('hard')}
                        className="py-3 bg-orange-100 text-orange-700 rounded-xl font-semibold hover:bg-orange-200 transition-colors border border-orange-200"
                    >
                        Hard
                    </button>
                    <span className="text-[10px] text-center text-slate-400 font-medium">2d</span>
                </div>

                <div className="flex flex-col gap-1">
                     <button 
                        onClick={() => handleRate('good')}
                        className="py-3 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-colors border border-blue-200"
                    >
                        Good
                    </button>
                    <span className="text-[10px] text-center text-slate-400 font-medium">4d</span>
                </div>

                <div className="flex flex-col gap-1">
                    <button 
                        onClick={() => handleRate('easy')}
                        className="py-3 bg-emerald-100 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-200 transition-colors border border-emerald-200"
                    >
                        Easy
                    </button>
                    <span className="text-[10px] text-center text-slate-400 font-medium">7d</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSession;