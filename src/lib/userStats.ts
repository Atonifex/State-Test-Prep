// src/lib/userStats.ts

export const calculateUserLevel = (xp: number): number => {
  // Level formula: every 1000 XP = 1 level
  return Math.floor(xp / 1000) + 1;
};

export const calculateXPForNextLevel = (currentXP: number): number => {
  const currentLevel = calculateUserLevel(currentXP);
  return currentLevel * 1000;
};

export const calculateUserRank = (userPoints: number, allUserPoints: number[]): number => {
  const sorted = allUserPoints.sort((a, b) => b - a);
  return sorted.indexOf(userPoints) + 1;
};

// Helper function to calculate XP gained from question attempts
export const calculateXPFromAttempt = (isCorrect: boolean, difficulty: string, timeSpentMs: number): number => {
  let baseXP = 0;
  
  // Base XP by difficulty
  switch (difficulty) {
    case 'Easy': baseXP = 10; break;
    case 'Medium': baseXP = 20; break;
    case 'Hard': baseXP = 30; break;
    default: baseXP = 15;
  }
  
  // Bonus for correct answers
  if (isCorrect) {
    baseXP *= 2;
  }
  
  // Time bonus (faster = more XP, but cap the bonus)
  const timeBonus = Math.max(0, Math.min(10, 60000 - timeSpentMs) / 6000); // Max 10 XP bonus for under 1 minute
  
  return Math.round(baseXP + timeBonus);
};

// Helper function to calculate points for rewards store
export const calculatePointsFromAttempt = (isCorrect: boolean, difficulty: string, streak: number): number => {
  let basePoints = 0;
  
  // Base points by difficulty
  switch (difficulty) {
    case 'Easy': basePoints = 5; break;
    case 'Medium': basePoints = 10; break;
    case 'Hard': basePoints = 15; break;
    default: basePoints = 8;
  }
  
  // Bonus for correct answers
  if (isCorrect) {
    basePoints *= 2;
  }
  
  // Streak multiplier (max 2x)
  const streakMultiplier = Math.min(2, 1 + (streak * 0.1));
  
  return Math.round(basePoints * streakMultiplier);
};