import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuizzlyState {
  points: number;
  apiKey: string;
  unlockedAvatars: string[];
  unlockedThemes: string[];
  currentAvatar: string;
  addPoints: (amount: number) => void;
  setApiKey: (key: string) => void;
  unlockAvatar: (avatarId: string, cost: number) => boolean;
  setCurrentAvatar: (avatarId: string) => void;
}

export const useQuizzlyStore = create<QuizzlyState>()(
  persist(
    (set, get) => ({
      points: 0,
      apiKey: '',
      unlockedAvatars: ['default'],
      unlockedThemes: ['default'],
      currentAvatar: 'default',
      
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
      }
    }),
    {
      name: 'quizzly-storage',
    }
  )
);
