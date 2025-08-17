// In a new file: src/lib/userStats.ts
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