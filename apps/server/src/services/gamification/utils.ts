export const XP_PER_LEVEL = 200;

export const calculateLevelInfo = (totalXp: number) => {
  const currentLevel = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpInCurrentLevel = totalXp % XP_PER_LEVEL;
  const xpRemaining = XP_PER_LEVEL - xpInCurrentLevel;
  const progressPercent = (xpInCurrentLevel / XP_PER_LEVEL) * 100;

  return {
    currentLevel,
    xpInCurrentLevel,
    xpRemaining,
    progressPercent,
  };
};

export const hasLeveledUp = (oldTotalXp: number, newTotalXp: number) => {
  const oldLevel = Math.floor(oldTotalXp / XP_PER_LEVEL) + 1;
  const newLevel = Math.floor(newTotalXp / XP_PER_LEVEL) + 1;
  return newLevel > oldLevel;
};

export const getDateKeyCET = () => {
  // Return date string in YYYY-MM-DD format based on CET/CEST timezone
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('fr-CA', { // fr-CA gives YYYY-MM-DD format
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
};

export const getWeeklyKeyCET = () => {
  // We can use a simple ISO week calculation shifted to Europe/Paris
  const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  const day = (date.getDay() || 7) - 1; // 0 = Monday
  date.setDate(date.getDate() - day + 3);
  const firstThursday = new Date(date.getFullYear(), 0, 4);
  const weekNumber = Math.round(((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + (firstThursday.getDay() || 7)) / 7) + 1;
  return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
};
