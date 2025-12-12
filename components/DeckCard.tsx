import React from 'react';
import { Deck, Flashcard } from '../types';
import { getCardsDue, getLearningCounts } from '../services/srs';
import { MoreVertical, Play } from 'lucide-react';

interface DeckCardProps {
  deck: Deck;
  cards: Flashcard[];
  onSelect: (deck: Deck) => void;
  onReview: (deck: Deck) => void;
  onEdit: (deck: Deck) => void;
  onDelete: (deckId: string) => void;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, cards, onSelect, onReview, onEdit, onDelete }) => {
  const stats = getLearningCounts(cards, deck.id);
  const dueCount = getCardsDue(cards, deck.id).length;
  const progress = stats.total > 0 ? ((stats.total - stats.new) / stats.total) * 100 : 0;

  return (
    <div 
      className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform duration-200 border border-slate-100 relative overflow-hidden group"
      onClick={() => onSelect(deck)}
    >
      {/* Decorative colored background blob */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-10 -mt-10 opacity-20 pointer-events-none transition-opacity group-hover:opacity-30"
        style={{ backgroundColor: deck.color }}
      />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{deck.name}</h3>
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(deck); }}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="flex items-end justify-between relative z-10">
        <div>
          <div className="flex gap-3 text-sm mb-3">
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-brand-600">{dueCount}</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Due</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-slate-700">{stats.new}</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">New</span>
            </div>
             <div className="flex flex-col">
              <span className="text-xl font-semibold text-emerald-600">{stats.review}</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Review</span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onReview(deck); }}
          className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 hover:bg-brand-500 transition-colors"
          disabled={dueCount === 0}
        >
           <Play fill="currentColor" size={20} className="ml-1"/>
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-slate-800 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default DeckCard;