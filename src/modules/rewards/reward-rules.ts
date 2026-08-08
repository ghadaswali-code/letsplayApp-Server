export const DAILY_REWARDS = [
  { dayIndex: 1, stars: 100 },
  { dayIndex: 2, stars: 150 },
  { dayIndex: 3, stars: 200 },
  { dayIndex: 4, chest: 'mystery' },
  { dayIndex: 5, stars: 250 },
  { dayIndex: 6, stars: 300 },
  { dayIndex: 7, chest: 'legendary' },
] as const;

export const STREAK_REWARDS = new Map<
  number,
  { stars?: number; itemKey?: string }
>([
  [3, { stars: 100 }],
  [7, { itemKey: 'chest:streak-7' }],
  [14, { itemKey: 'avatar:accessory:streak-14' }],
  [30, { itemKey: 'avatar:rare-character:streak-30' }],
  [100, { itemKey: 'badge:legendary-streak-100' }],
]);

export const TREASURE_CHEST_REWARD = {
  stars: 150,
  energy: 2,
};
