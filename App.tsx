import React, { useState, useEffect } from 'react';
import { AppState, Deck, Flashcard, View, SRSGrade } from './types';
import { loadState, saveState, exportData } from './services/storage';
import { getCardsDue } from './services/srs';
import DeckCard from './components/DeckCard';
import ReviewSession from './components/ReviewSession';
import StatsView from './components/StatsView';
import AIGenerator from './components/AIGenerator';
import { Plus, BarChart2, Settings, Home, ArrowLeft, Download, Trash2, BrainCircuit, Key } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [view, setView] = useState<View>(View.HOME);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  // Persist state on change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleCreateDeck = () => {
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name: 'New Deck',
      description: 'Tap to edit description',
      color: ['#E0F2FE', '#DCFCE7', '#F3E8FF', '#FCE7F3', '#FEF9C3'][Math.floor(Math.random() * 5)],
      createdAt: Date.now(),
      lastReviewed: 0
    };
    setState(prev => ({ ...prev, decks: [...prev.decks, newDeck] }));
  };

  const handleDeleteDeck = (id: string) => {
    if (confirm('Are you sure you want to delete this deck?')) {
      setState(prev => ({
        ...prev,
        decks: prev.decks.filter(d => d.id !== id),
        cards: prev.cards.filter(c => c.deckId !== id)
      }));
    }
  };

  const handleUpdateCard = (updatedCard: Flashcard, log: any) => {
    setState(prev => ({
      ...prev,
      cards: prev.cards.map(c => c.id === updatedCard.id ? updatedCard : c),
      logs: [...prev.logs, log]
    }));
  };

  const handleAddCards = (newCards: any[]) => {
    if (!activeDeck) return;
    const flashcards: Flashcard[] = newCards.map(nc => ({
      id: crypto.randomUUID(),
      deckId: activeDeck.id,
      front: nc.front,
      back: nc.back,
      ease: 2.5,
      interval: 0,
      dueDate: Date.now(),
      repetitions: 0,
      state: 'new',
      tags: nc.tags || []
    }));
    
    setState(prev => ({
      ...prev,
      cards: [...prev.cards, ...flashcards]
    }));
    setView(View.HOME); // Or Deck Details
  };

  const renderContent = () => {
    switch (view) {
      case View.HOME:
        return (
          <div className="p-6 pb-24 space-y-6 animate-in fade-in duration-300">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Decks</h1>
                <p className="text-slate-500 text-sm">You have {getCardsDue(state.cards).length} cards due today.</p>
              </div>
              <button onClick={() => setShowApiKeyModal(true)} className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-brand-600 shadow-sm">
                <Settings size={20} />
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.decks.map(deck => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  cards={state.cards}
                  onSelect={(d) => { setActiveDeck(d); /* Usually go to details, simplified here */ }}
                  onReview={(d) => { setActiveDeck(d); setView(View.REVIEW); }}
                  onEdit={(d) => { /* Implement edit deck name */ }}
                  onDelete={() => handleDeleteDeck(deck.id)}
                />
              ))}
              
              <button 
                onClick={handleCreateDeck}
                className="min-h-[160px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-brand-100 flex items-center justify-center mb-3 transition-colors">
                  <Plus size={24} className="group-hover:text-brand-600"/>
                </div>
                <span className="font-medium">Create New Deck</span>
              </button>
            </div>
          </div>
        );

      case View.REVIEW:
        if (!activeDeck) return null;
        const due = getCardsDue(state.cards, activeDeck.id);
        return (
          <ReviewSession
            deck={activeDeck}
            dueCards={due}
            onComplete={() => setView(View.HOME)}
            onUpdateCard={handleUpdateCard}
          />
        );

      case View.STATS:
        return <StatsView logs={state.logs} cards={state.cards} />;

      case View.AI_GENERATE:
        if (!activeDeck) return null;
        return (
          <AIGenerator 
             apiKey={process.env.API_KEY || ''} // In real app, prompt user or use env
             onSave={handleAddCards} 
             onCancel={() => setView(View.HOME)} 
          />
        );

      default:
        return <div>View not implemented</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 max-w-7xl mx-auto shadow-2xl overflow-hidden relative">
      
      {/* Main Content Area */}
      <main className="h-screen overflow-y-auto no-scrollbar pb-20">
        {renderContent()}
      </main>

      {/* Floating Action Button (FAB) for AI */}
      {view === View.HOME && activeDeck && (
          <button
            onClick={() => setView(View.AI_GENERATE)}
            className="fixed bottom-24 right-6 bg-gradient-to-tr from-brand-600 to-indigo-500 text-white p-4 rounded-2xl shadow-xl shadow-brand-500/40 hover:scale-110 active:scale-95 transition-all z-40 flex items-center gap-2"
          >
            <BrainCircuit size={24} />
            <span className="font-bold pr-1">AI Create</span>
          </button>
      )}

      {/* Bottom Navigation */}
      {view !== View.REVIEW && view !== View.AI_GENERATE && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex justify-around items-center z-50 max-w-7xl mx-auto">
          <button 
            onClick={() => setView(View.HOME)}
            className={`flex flex-col items-center gap-1 ${view === View.HOME ? 'text-brand-600' : 'text-slate-400'}`}
          >
            <Home size={24} strokeWidth={view === View.HOME ? 3 : 2} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => setView(View.STATS)}
            className={`flex flex-col items-center gap-1 ${view === View.STATS ? 'text-brand-600' : 'text-slate-400'}`}
          >
            <BarChart2 size={24} strokeWidth={view === View.STATS ? 3 : 2}/>
             <span className="text-[10px] font-medium">Stats</span>
          </button>

          <button 
            onClick={() => exportData(state)}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600"
          >
            <Download size={24} />
             <span className="text-[10px] font-medium">Backup</span>
          </button>
        </nav>
      )}

      {/* API Key Modal (Mock) */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Settings</h3>
            <p className="text-sm text-slate-500 mb-4">
              To use AI features, please ensure the API Key is set in your environment variables or deployment settings.
            </p>
            <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono text-slate-600 mb-6 break-all">
                API_KEY: {process.env.API_KEY ? '••••••••' + process.env.API_KEY.slice(-4) : 'Not Set'}
            </div>
            <button 
              onClick={() => setShowApiKeyModal(false)}
              className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;