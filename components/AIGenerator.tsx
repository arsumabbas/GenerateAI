import React, { useState } from 'react';
import { generateFlashcards, GeneratedCard } from '../services/geminiService';
import { Sparkles, Loader2, Save, X, FileText } from 'lucide-react';

interface AIGeneratorProps {
  onSave: (cards: GeneratedCard[]) => void;
  onCancel: () => void;
  apiKey: string;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onSave, onCancel, apiKey }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewCards, setPreviewCards] = useState<GeneratedCard[]>([]);
  const [mode, setMode] = useState<'input' | 'preview'>('input');
  const [cardCount, setCardCount] = useState(5);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      // In a real app, apiKey should be safely managed. Here we use prop/env.
      // Assuming env is passed or user inputs it (omitted for brevity in UI, but required by logic)
      const cards = await generateFlashcards(process.env.API_KEY || apiKey, inputText, cardCount);
      setPreviewCards(cards);
      setMode('preview');
    } catch (e) {
      alert("Failed to generate cards. Check API Key or connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-8 animate-in fade-in">
        <div className="relative">
             <div className="absolute inset-0 bg-brand-200 rounded-full blur-xl animate-pulse"></div>
             <Loader2 size={48} className="text-brand-600 animate-spin relative z-10" />
        </div>
        <h3 className="mt-8 text-xl font-bold text-slate-800">Gemini is thinking...</h3>
        <p className="text-slate-500 text-center mt-2 max-w-xs">Analyzing your text and crafting high-quality flashcards.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles size={20} className="text-brand-500"/> AI Generator
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-slate-50 rounded-full">
            <X size={20} className="text-slate-400"/>
        </button>
      </div>

      {mode === 'input' ? (
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Source Content</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".txt,.md,.json" />
                <FileText size={32} className="text-slate-300 mb-2"/>
                <p className="text-sm font-medium text-slate-600">Drop a text file or click to upload</p>
                <p className="text-xs text-slate-400 mt-1">Supports .txt, .md</p>
            </div>
            <div className="mt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Or paste text</span>
                <textarea 
                    className="w-full mt-2 h-40 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none text-sm"
                    placeholder="Paste your notes, article, or summary here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Number of Cards</label>
             <div className="flex gap-2">
                {[5, 10, 15, 20].map(num => (
                    <button 
                        key={num}
                        onClick={() => setCardCount(num)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border ${cardCount === num ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}
                    >
                        {num} Cards
                    </button>
                ))}
             </div>
          </div>

          <div className="mt-auto">
            <button 
                onClick={handleGenerate}
                disabled={!inputText.trim()}
                className="w-full py-4 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-[1.02]"
            >
                Generate with Gemini
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-brand-50 border-b border-brand-100">
                <p className="text-brand-800 text-sm font-medium text-center">
                    ✨ Generated {previewCards.length} cards successfully!
                </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {previewCards.map((card, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div className="mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Q</span>
                            <p className="text-slate-800 font-medium">{card.front}</p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase">A</span>
                            <p className="text-slate-600">{card.back}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-3">
                 <button 
                    onClick={() => setMode('input')}
                    className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl"
                >
                    Discard
                </button>
                <button 
                    onClick={() => onSave(previewCards)}
                    className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 hover:bg-brand-700"
                >
                    <Save size={18} /> Save to Deck
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AIGenerator;