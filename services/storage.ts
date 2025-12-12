import { AppState, Deck, Flashcard, ReviewLog } from '../types';

const STORAGE_KEY = 'flashmind_db_v1';

const INITIAL_STATE: AppState = {
  decks: [
    {
      id: 'default-deck-1',
      name: 'General Knowledge',
      description: 'A starter deck with general facts.',
      color: '#E0F2FE',
      createdAt: Date.now(),
      lastReviewed: 0
    }
  ],
  cards: [
    {
      id: 'c1',
      deckId: 'default-deck-1',
      front: 'What is the capital of France?',
      back: 'Paris',
      ease: 2.5,
      interval: 0,
      dueDate: Date.now(),
      repetitions: 0,
      state: 'new',
      tags: ['geography']
    }
  ],
  logs: [],
  settings: {
    darkMode: false,
    dailyTarget: 20
  }
};

export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load state', e);
    return INITIAL_STATE;
  }
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
};

export const exportData = (state: AppState) => {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flashmind_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};