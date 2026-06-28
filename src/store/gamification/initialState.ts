import { AsyncLocalStorage } from '@/utils/localStorage';
import { GamificationState } from '@lobechat/types/gamification';

export interface GamificationStoreState extends GamificationState {
  isStatusInit: boolean;
  statusStorage: AsyncLocalStorage<GamificationState>;
}

export const INITIAL_GAMIFICATION_STATE: GamificationState = {
  xp: 0,
  level: 1,
  settings: {
    soundVolume: 0.7,
    enableAnimations: true,
  },
  activeDailyQuests: [],
  activeWeeklyQuests: [],
  questHistory: {},
  unlockedBadges: [],
  pinnedBadges: [],
  lastBonusQuestsUsed: 0,
  actionCounts: {},
};

export const initialState: GamificationStoreState = {
  ...INITIAL_GAMIFICATION_STATE,
  isStatusInit: false,
  statusStorage: new AsyncLocalStorage('LOBE_GAMIFICATION_STATUS'),
};
