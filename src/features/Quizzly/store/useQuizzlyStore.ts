import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { lambdaClient } from '@/libs/trpc/client';

export interface ClanMember {
  id: string;
  name: string;
  avatar: string;
  hasPlayedToday: boolean;
  streak: number;
}

export interface Clan {
  id: string;
  name: string;
  collectiveStreak: number;
  members: ClanMember[];
  lastStreakIncrementDate?: string;
}

export interface QuizzlyState {
  version: string;
  points: number;
  apiKey: string;
  unlockedAvatars: string[];
  unlockedThemes: string[];
  currentAvatar: string;
  currentTheme: string;
  
  // Streaks & Stats
  streak: number;
  lastQuizDate: string;
  streakShields: number;
  pointMultipliers: number;
  activeMultiplier: boolean;
  hints: number;
  quizzesPlayed: number;
  totalQuestions: number;
  correctAnswers: number;
  
  // Clan Info
  clan: Clan | null;
  availableClans: Clan[];
  
  // Actions de synchronisation serveur
  syncWithServer: () => Promise<void>;
  
  // Actions
  addPoints: (amount: number) => void;
  setApiKey: (key: string) => void;
  unlockAvatar: (avatarId: string, cost: number) => boolean;
  setCurrentAvatar: (avatarId: string) => void;
  buyItem: (itemId: string, cost: number) => boolean;
  useHint: () => boolean;
  completeQuiz: (questionsCount: number, correctCount: number) => Promise<void>;
  
  // Clan Actions
  createClan: (name: string) => Promise<void>;
  joinClan: (clanId: string) => Promise<void>;
  leaveClan: () => Promise<void>;
  simulateClanActivity: () => Promise<void>;
  buyTheme: (themeId: string, cost: number, requiredClanStreak: number) => Promise<boolean>;
  selectTheme: (themeId: string) => Promise<void>;
}

export const useQuizzlyStore = create<QuizzlyState>()(
  persist(
    (set, get) => ({
      version: '0.0.9',
      points: 200,
      apiKey: '',
      unlockedAvatars: ['default'],
      unlockedThemes: ['default'],
      currentAvatar: 'default',
      currentTheme: 'default',
      
      streak: 0,
      lastQuizDate: '',
      streakShields: 0,
      pointMultipliers: 0,
      activeMultiplier: false,
      hints: 0,
      quizzesPlayed: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      
      clan: null,
      availableClans: [],
      
      syncWithServer: async () => {
        try {
          const state = await lambdaClient.quizzly.getQuizzlyState.query();
          set({
            clan: state.clan,
            availableClans: state.availableClans,
            unlockedThemes: state.unlockedThemes,
            currentTheme: state.currentTheme,
            points: state.points,
            streak: state.streak,
            lastQuizDate: state.lastQuizDate
          });
        } catch (e) {
          console.error('Failed to sync with quizzly backend', e);
        }
      },
      
      addPoints: (amount) => set((state) => ({ points: state.points + amount })),
      
      setApiKey: (key) => set({ apiKey: key }),
      
      unlockAvatar: (avatarId, cost) => {
        const { points, unlockedAvatars } = get();
        if (points >= cost && !unlockedAvatars.includes(avatarId)) {
          set({ 
            points: points - cost,
            unlockedAvatars: [...unlockedAvatars, avatarId]
          });
          return true;
        }
        return false;
      },
      
      setCurrentAvatar: (avatarId) => {
        if (get().unlockedAvatars.includes(avatarId)) {
          set({ currentAvatar: avatarId });
        }
      },
      
      buyItem: (itemId, cost) => {
        const { points } = get();
        if (points < cost) return false;
        
        const updates: Partial<QuizzlyState> = { points: points - cost };
        if (itemId === 'item_shield') {
          updates.streakShields = (get().streakShields || 0) + 1;
        } else if (itemId === 'item_multiplier') {
          updates.pointMultipliers = (get().pointMultipliers || 0) + 1;
        } else if (itemId === 'item_hint') {
          updates.hints = (get().hints || 0) + 1;
        } else {
          return false;
        }
        
        // Mettre à jour en local puis synchroniser le solde de points avec le serveur
        set(updates);
        return true;
      },
      
      useHint: () => {
        const { hints } = get();
        if (hints > 0) {
          set({ hints: hints - 1 });
          return true;
        }
        return false;
      },
      
      completeQuiz: async (questionsCount, correctCount) => {
        try {
          const res = await lambdaClient.quizzly.completeQuiz.mutate({
            questionsCount,
            correctCount
          });
          
          set((state) => ({
            quizzesPlayed: state.quizzesPlayed + 1,
            totalQuestions: state.totalQuestions + questionsCount,
            correctAnswers: state.correctAnswers + correctCount,
            points: res.points,
            streak: res.streak,
            lastQuizDate: res.lastQuizDate,
            activeMultiplier: false
          }));
          
          // Rafraîchir l'état du clan
          await get().syncWithServer();
        } catch (e) {
          console.error('Failed to register quiz completion', e);
        }
      },
      
      createClan: async (name) => {
        try {
          const newClan = await lambdaClient.quizzly.createClan.mutate({ name });
          set({ clan: newClan });
          await get().syncWithServer();
        } catch (e) {
          console.error('Failed to create clan', e);
        }
      },
      
      joinClan: async (clanId) => {
        try {
          const updatedClan = await lambdaClient.quizzly.joinClan.mutate({ clanId });
          set({ clan: updatedClan });
          await get().syncWithServer();
        } catch (e) {
          console.error('Failed to join clan', e);
        }
      },
      
      leaveClan: async () => {
        try {
          await lambdaClient.quizzly.leaveClan.mutate();
          set({ clan: null });
          await get().syncWithServer();
        } catch (e) {
          console.error('Failed to leave clan', e);
        }
      },
      
      simulateClanActivity: async () => {
        try {
          const updatedClan = await lambdaClient.quizzly.simulateClanActivity.mutate();
          set({ clan: updatedClan });
          await get().syncWithServer();
        } catch (e) {
          console.error('Failed to simulate clan activity', e);
        }
      },

      buyTheme: async (themeId, cost, requiredClanStreak) => {
        try {
          const res = await lambdaClient.quizzly.buyTheme.mutate({
            themeId,
            cost,
            requiredClanStreak
          });
          set({
            unlockedThemes: res.unlockedThemes,
            points: res.points
          });
          return true;
        } catch (e) {
          console.error('Failed to buy theme', e);
          return false;
        }
      },

      selectTheme: async (themeId) => {
        try {
          const res = await lambdaClient.quizzly.selectTheme.mutate({ themeId });
          set({ currentTheme: res.currentTheme });
        } catch (e) {
          console.error('Failed to select theme', e);
        }
      }
    }),
    {
      name: 'quizzly-storage-v0.0.9-sync',
    }
  )
);
