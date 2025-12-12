export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  ease: number;
  interval: number; // in days
  dueDate: number; // timestamp
  repetitions: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  tags: string[];
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  color: string; // Hex code for pastel bg
  createdAt: number;
  lastReviewed: number;
}

export interface ReviewLog {
  id: string;
  cardId: string;
  rating: 'again' | 'hard' | 'good' | 'easy';
  timestamp: number;
}

export interface DailyStat {
  date: string; // ISO YYYY-MM-DD
  count: number;
}

export interface AppState {
  decks: Deck[];
  cards: Flashcard[];
  logs: ReviewLog[];
  settings: {
    darkMode: boolean;
    dailyTarget: number;
  };
}

export enum View {
  HOME = 'HOME',
  DECK_DETAILS = 'DECK_DETAILS',
  REVIEW = 'REVIEW',
  ADD_CARD = 'ADD_CARD',
  AI_GENERATE = 'AI_GENERATE',
  STATS = 'STATS',
}

export type SRSGrade = 'again' | 'hard' | 'good' | 'easy';