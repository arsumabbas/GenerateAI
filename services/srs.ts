import { Flashcard, SRSGrade } from '../types';

// Constants
const MIN_EASE = 1.3;
const BONUS_EASE = 0.15; // Bonus for Easy
const PENALTY_EASE = 0.2; // Penalty for Hard/Again

/**
 * Calculates the next state of a flashcard based on the rating.
 * Based on a simplified SM-2 algorithm.
 */
export const calculateNextReview = (card: Flashcard, rating: SRSGrade): Partial<Flashcard> => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  let { ease, interval, repetitions, state } = card;

  // Handle 'Again' (Failure)
  if (rating === 'again') {
    return {
      state: 'learning',
      interval: 0, // Due immediately (or 1 minute in real app, here treated as 0 days)
      repetitions: 0,
      dueDate: now,
      ease: Math.max(MIN_EASE, ease - PENALTY_EASE),
    };
  }

  // Calculate new Ease Factor
  if (rating === 'hard') {
    ease = Math.max(MIN_EASE, ease - 0.15);
  } else if (rating === 'easy') {
    ease += BONUS_EASE;
  }
  // 'good' keeps ease roughly same (in standard SM2 it varies slightly, keeping simple here)

  // Calculate Interval
  if (state === 'new' || state === 'learning') {
    // Graduation from learning
    interval = 1;
    state = 'review';
  } else if (repetitions === 0) {
    interval = 1;
  } else if (repetitions === 1) {
    interval = 6;
  } else {
    // SM-2 Formula: I(n) = I(n-1) * EF
    let modifier = 1;
    if (rating === 'hard') modifier = 1.2;
    if (rating === 'good') modifier = ease;
    if (rating === 'easy') modifier = ease * 1.3;
    
    interval = Math.ceil(interval * modifier);
  }

  return {
    ease,
    interval,
    repetitions: repetitions + 1,
    state,
    dueDate: now + (interval * oneDay),
  };
};

export const getCardsDue = (cards: Flashcard[], deckId?: string): Flashcard[] => {
  const now = Date.now();
  return cards.filter(c => {
    return (!deckId || c.deckId === deckId) && c.dueDate <= now;
  }).sort((a, b) => a.dueDate - b.dueDate);
};

export const getLearningCounts = (cards: Flashcard[], deckId: string) => {
  const deckCards = cards.filter(c => c.deckId === deckId);
  return {
    new: deckCards.filter(c => c.state === 'new').length,
    learning: deckCards.filter(c => c.state === 'learning' || c.state === 'relearning').length,
    review: deckCards.filter(c => c.state === 'review').length,
    total: deckCards.length
  };
};