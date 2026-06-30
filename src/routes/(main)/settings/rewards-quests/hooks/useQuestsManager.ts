import { useEffect, useMemo } from 'react';
import { useGamificationStore } from '@/store/gamification';
import { useChatStore } from '@/store/chat';
import { useAgentStore } from '@/store/agent';
import dailyQuestsData from '@/const/gamification/dailyQuests.json';
import weeklyQuestsData from '@/const/gamification/weeklyQuests.json';

const tzMap: Record<string, string> = {
  PT: 'America/Los_Angeles',
  MT: 'America/Denver',
  CT: 'America/Chicago',
  ET: 'America/New_York',
  GMT: 'Europe/London',
  CET: 'Europe/Paris',
  EET: 'Europe/Athens',
  MSK: 'Europe/Moscow',
  GST: 'Asia/Dubai',
  IST: 'Asia/Kolkata',
  CST: 'Asia/Shanghai',
  JST: 'Asia/Tokyo',
  AEST: 'Australia/Sydney',
};

const getMidnightInTimezone = (timezone: string) => {
  const ianaTz = tzMap[timezone] || 'Europe/Paris';
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTz,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    
    const dateStr = `${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}T00:00:00`;
    return new Date(dateStr).getTime();
  } catch (e) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
};

const getLastMondayMidnightInTimezone = (timezone: string) => {
  const ianaTz = tzMap[timezone] || 'Europe/Paris';
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTz,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    
    const parts = formatter.formatToParts(now);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '0');
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
    
    const tzDate = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = tzDate.getUTCDay();
    
    const diffDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const mondayDate = new Date(tzDate);
    mondayDate.setUTCDate(tzDate.getUTCDate() - diffDays);
    
    const mYear = mondayDate.getUTCFullYear();
    const mMonth = mondayDate.getUTCMonth() + 1;
    const mDay = mondayDate.getUTCDate();
    
    const dateStr = `${mYear}-${String(mMonth).padStart(2, '0')}-${String(mDay).padStart(2, '0')}T00:00:00`;
    return new Date(dateStr).getTime();
  } catch (e) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).getTime();
  }
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
  const trackAction = useGamificationStore((s) => s.trackAction);
  const rawTimezone = useGamificationStore((s) => s.settings.timezone);

  const timezone = useMemo(() => {
    if (['PT', 'MT', 'CT', 'ET', 'GMT', 'CET', 'EET', 'MSK', 'GST', 'IST', 'CST', 'JST', 'AEST'].includes(rawTimezone)) {
      return rawTimezone;
    }
    if (rawTimezone === 'Europe/Paris') return 'CET';
    if (rawTimezone === 'UTC') return 'GMT';
    return 'CET';
  }, [rawTimezone]);

  // Quest Renewal Reset Logic based on target timezone
  useEffect(() => {
    const midnight = getMidnightInTimezone(timezone);
    const lastDaily = activeDailyQuests[0]?.assignedAt || 0;
    
    if (!activeDailyQuests.length || lastDaily < midnight) {
      const selectedDaily = getRandomQuests(dailyQuestsData, 3);
      refreshDailyQuests(selectedDaily);
    }

    const lastMonday = getLastMondayMidnightInTimezone(timezone);
    const lastWeekly = activeWeeklyQuests[0]?.assignedAt || 0;

    if (!activeWeeklyQuests.length || lastWeekly < lastMonday) {
      const selectedWeekly = getRandomQuests(weeklyQuestsData, 5);
      refreshWeeklyQuests(selectedWeekly);
    }
  }, [activeDailyQuests.length, activeWeeklyQuests.length, refreshDailyQuests, refreshWeeklyQuests, timezone]);

  // Automated Action Tracking Logic
  useEffect(() => {
    let lastUserMessageCount = -1;
    let lastToolMessageCount = -1;
    let lastTopicCount = -1;

    const unsubscribeChat = useChatStore.subscribe((state) => {
      const allMsgs = Object.values(state.messagesMap || {}).flat();
      const userMsgCount = allMsgs.filter((m) => m.role === 'user').length;
      const toolMsgCount = allMsgs.filter((m) => m.role === 'tool' || (m.role === 'assistant' && m.tools)).length;
      const topicCount = Object.keys(state.topicsMap || {}).length;

      // Track messages sent
      if (lastUserMessageCount !== -1 && userMsgCount > lastUserMessageCount) {
        trackAction('message_sent', userMsgCount - lastUserMessageCount);
      }
      lastUserMessageCount = userMsgCount;

      // Track plugins used
      if (lastToolMessageCount !== -1 && toolMsgCount > lastToolMessageCount) {
        trackAction('plugin_used', toolMsgCount - lastToolMessageCount);
      }
      lastToolMessageCount = toolMsgCount;

      // Track active session / topic shared
      if (lastTopicCount !== -1 && topicCount > lastTopicCount) {
        trackAction('topic_shared', topicCount - lastTopicCount);
      }
      lastTopicCount = topicCount;
    });

    let lastAgentCount = -1;
    const unsubscribeAgent = useAgentStore.subscribe((state) => {
      const agentCount = Object.keys(state.agentMap || {}).length;
      if (lastAgentCount !== -1 && agentCount > lastAgentCount) {
        trackAction('agent_created', agentCount - lastAgentCount);
      }
      lastAgentCount = agentCount;
    });

    return () => {
      unsubscribeChat();
      unsubscribeAgent();
    };
  }, [trackAction]);
};
