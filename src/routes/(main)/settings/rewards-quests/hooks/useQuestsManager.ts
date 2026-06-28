import { useEffect } from 'react';
import { useGamificationStore } from '@/store/gamification';
import { useChatStore } from '@/store/chat';
import { useAgentStore } from '@/store/agent';
import dailyQuestsData from '@/const/gamification/dailyQuests.json';
import weeklyQuestsData from '@/const/gamification/weeklyQuests.json';

const getMidnightCET = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const getLastMondayMidnightCET = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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
  const trackAction = useGamificationStore((s) => s.trackAction);

  // Quest Renewal Reset Logic
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
