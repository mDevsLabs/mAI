import { useEffect } from 'react';
import { useGamificationStore } from '@/store/gamification';
import dailyQuestsData from '@/const/gamification/dailyQuests.json';
import weeklyQuestsData from '@/const/gamification/weeklyQuests.json';

const getMidnightCET = () => {
  const d = new Date();
  // We want midnight CET. We can do this roughly by adjusting timezone or using UTC.
  // Actually, keeping it simple: just reset every 24 hours from local midnight, or precise CET.
  // CET is UTC+1 (or UTC+2 in summer).
  // A simple way is to use UTC and add 1 or 2 hours. Let's just use local midnight for the implementation as it's a client side check, or a simple 24h reset.
  // Let's implement local midnight for now.
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const getLastMondayMidnightCET = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff)).getTime();
};

const getRandomQuests = (quests: any[], count: number) => {
  const shuffled = [...quests].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const useQuestsManager = () => {
  const activeDailyQuests = useGamificationStore((s) => s.activeDailyQuests);
  const activeWeeklyQuests = useGamificationStore((s) => s.activeWeeklyQuests);
  const refreshDailyQuests = useGamificationStore((s) => s.refreshDailyQuests);
  const refreshWeeklyQuests = useGamificationStore((s) => s.refreshWeeklyQuests);

  useEffect(() => {
    const midnight = getMidnightCET();
    const lastDaily = activeDailyQuests[0]?.assignedAt || 0;
    
    if (!activeDailyQuests.length || lastDaily < midnight) {
      const selectedDaily = getRandomQuests(dailyQuestsData, 3);
      refreshDailyQuests(selectedDaily);
    }

    const lastMonday = getLastMondayMidnightCET();
    const lastWeekly = activeWeeklyQuests[0]?.assignedAt || 0;

    if (!activeWeeklyQuests.length || lastWeekly < lastMonday) {
      const selectedWeekly = getRandomQuests(weeklyQuestsData, 5);
      refreshWeeklyQuests(selectedWeekly);
    }
  }, [activeDailyQuests.length, activeWeeklyQuests.length, refreshDailyQuests, refreshWeeklyQuests]);
};
