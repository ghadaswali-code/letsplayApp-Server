export const ACHIEVEMENT_RULES = [
  {
    id: 'first-letter-mastered',
    name: 'First Letter Mastered',
    description: 'Master one Arabic letter.',
    reward: { stars: 100, badgeKey: 'badge:first-letter-mastered' },
  },
  {
    id: 'alphabet-explorer',
    name: 'Alphabet Explorer',
    description: 'Master five Arabic letters.',
    reward: { stars: 250, badgeKey: 'badge:alphabet-explorer' },
  },
  {
    id: 'perfect-lesson',
    name: 'No Mistakes',
    description: 'Complete a lesson with a 3-star rating.',
    reward: { stars: 150, badgeKey: 'badge:no-mistakes' },
  },
] as const;
