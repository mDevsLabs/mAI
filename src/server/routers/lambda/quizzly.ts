import { z } from 'zod';
import { router, publicProcedure } from '@/libs/trpc/lambda';
import * as fs from 'fs';
import * as path from 'path';

// Dossier de persistance locale pour la simulation de base de données Quizzly
const DATA_DIR = path.join(process.cwd(), '.gemini', 'quizzly');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

interface ClanMember {
  id: string;
  name: string;
  avatar: string;
  hasPlayedToday: boolean;
  streak: number;
}

interface Clan {
  id: string;
  name: string;
  collectiveStreak: number;
  members: ClanMember[];
  lastStreakIncrementDate?: string;
}

interface QuizzlyServerDB {
  clans: Clan[];
  userClanId: string | null;
  unlockedThemes: string[];
  currentTheme: string;
  userPoints: number;
  userStreak: number;
  lastQuizDate: string;
}

const DEFAULT_DB: QuizzlyServerDB = {
  clans: [
    {
      id: 'clan_einstein',
      name: 'Les Einstein en Herbe 🧠',
      collectiveStreak: 12,
      members: [
        { id: 'm1', name: 'Sophia', avatar: '👩‍🔬', hasPlayedToday: true, streak: 12 },
        { id: 'm2', name: 'Lucas', avatar: '👨‍💻', hasPlayedToday: true, streak: 8 },
        { id: 'm3', name: 'Emma', avatar: '🎨', hasPlayedToday: false, streak: 5 }
      ]
    },
    {
      id: 'clan_gamers',
      name: 'Quiz Gamers 🎮',
      collectiveStreak: 4,
      members: [
        { id: 'g1', name: 'Leo', avatar: '👾', hasPlayedToday: true, streak: 4 },
        { id: 'g2', name: 'Zoe', avatar: '🦊', hasPlayedToday: false, streak: 2 }
      ]
    }
  ],
  userClanId: null,
  unlockedThemes: ['default'],
  currentTheme: 'default',
  userPoints: 200,
  userStreak: 0,
  lastQuizDate: ''
};

// Fallback en mémoire au cas où le système de fichiers est en lecture seule (ex: Vercel)
let memoryDB: QuizzlyServerDB | null = null;

const loadDB = (): QuizzlyServerDB => {
  if (memoryDB) return memoryDB;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    memoryDB = JSON.parse(data);
    return memoryDB!;
  } catch (e) {
    console.warn('Failed to load quizzly db from disk, falling back to memory storage', e);
    memoryDB = memoryDB || { ...DEFAULT_DB };
    return memoryDB;
  }
};

const saveDB = (db: QuizzlyServerDB) => {
  memoryDB = db;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to save quizzly db to disk', e);
  }
};

export const quizzlyRouter = router({
  getQuizzlyState: publicProcedure.query(() => {
    const db = loadDB();
    const currentClan = db.userClanId ? db.clans.find(c => c.id === db.userClanId) || null : null;
    return {
      clan: currentClan,
      availableClans: db.clans.filter(c => c.id !== db.userClanId),
      unlockedThemes: db.unlockedThemes,
      currentTheme: db.currentTheme,
      points: db.userPoints,
      streak: db.userStreak,
      lastQuizDate: db.lastQuizDate
    };
  }),

  createClan: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      const db = loadDB();
      const todayStr = new Date().toISOString().split('T')[0];
      
      const newClan: Clan = {
        id: `clan_${Date.now()}`,
        name: input.name,
        collectiveStreak: 0,
        members: [
          { id: 'user', name: 'Moi (Chef)', avatar: '👑', hasPlayedToday: db.lastQuizDate === todayStr, streak: db.userStreak },
          { id: 'bot_alex', name: 'Alex (IA)', avatar: '🤖', hasPlayedToday: true, streak: 5 },
          { id: 'bot_marie', name: 'Marie (IA)', avatar: '👩‍🎓', hasPlayedToday: true, streak: 3 }
        ]
      };

      db.clans.push(newClan);
      db.userClanId = newClan.id;
      saveDB(db);
      return newClan;
    }),

  joinClan: publicProcedure
    .input(z.object({ clanId: z.string() }))
    .mutation(({ input }) => {
      const db = loadDB();
      const todayStr = new Date().toISOString().split('T')[0];
      const clanIndex = db.clans.findIndex(c => c.id === input.clanId);

      if (clanIndex !== -1) {
        const userMember: ClanMember = {
          id: 'user',
          name: 'Moi',
          avatar: '⚡',
          hasPlayedToday: db.lastQuizDate === todayStr,
          streak: db.userStreak
        };
        
        db.clans[clanIndex].members.push(userMember);
        db.userClanId = input.clanId;
        saveDB(db);
        return db.clans[clanIndex];
      }
      throw new Error('Clan non trouvé');
    }),

  leaveClan: publicProcedure.mutation(() => {
    const db = loadDB();
    if (db.userClanId) {
      const clanIndex = db.clans.findIndex(c => c.id === db.userClanId);
      if (clanIndex !== -1) {
        db.clans[clanIndex].members = db.clans[clanIndex].members.filter(m => m.id !== 'user');
      }
      db.userClanId = null;
      saveDB(db);
    }
    return { success: true };
  }),

  completeQuiz: publicProcedure
    .input(z.object({ questionsCount: z.number(), correctCount: z.number() }))
    .mutation(({ input }) => {
      const db = loadDB();
      const todayStr = new Date().toISOString().split('T')[0];
      
      let newStreak = db.userStreak;
      
      if (db.lastQuizDate === todayStr) {
        // Déjà joué aujourd'hui
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (db.lastQuizDate === yesterdayStr || db.lastQuizDate === '') {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      db.userStreak = newStreak;
      db.lastQuizDate = todayStr;
      db.userPoints += input.correctCount * 10;

      // Mettre à jour l'état du clan si l'utilisateur fait partie d'un clan
      if (db.userClanId) {
        const clanIndex = db.clans.findIndex(c => c.id === db.userClanId);
        if (clanIndex !== -1) {
          const clan = db.clans[clanIndex];
          clan.members = clan.members.map(m => {
            if (m.id === 'user') {
              return { ...m, hasPlayedToday: true, streak: newStreak };
            }
            return m;
          });

          const allPlayed = clan.members.every(m => m.hasPlayedToday);
          if (allPlayed && clan.lastStreakIncrementDate !== todayStr) {
            clan.collectiveStreak += 1;
            clan.members.forEach(m => {
              m.streak += 1;
            });
            clan.lastStreakIncrementDate = todayStr;
            db.userStreak = (clan.members.find(m => m.id === 'user')?.streak) || newStreak;
          }
        }
      }

      saveDB(db);
      return {
        points: db.userPoints,
        streak: db.userStreak,
        lastQuizDate: db.lastQuizDate
      };
    }),

  buyCosmeticTheme: publicProcedure
    .input(z.object({ themeId: z.string(), cost: z.number(), requiredClanStreak: z.number() }))
    .mutation(({ input }) => {
      const db = loadDB();
      const currentClan = db.userClanId ? db.clans.find(c => c.id === db.userClanId) || null : null;
      const clanStreak = currentClan ? currentClan.collectiveStreak : 0;

      if (clanStreak < input.requiredClanStreak) {
        throw new Error(`Série de clan insuffisante ! Requise : ${input.requiredClanStreak} jours.`);
      }

      if (db.userPoints < input.cost) {
        throw new Error('Points insuffisants !');
      }

      if (!db.unlockedThemes.includes(input.themeId)) {
        db.userPoints -= input.cost;
        db.unlockedThemes.push(input.themeId);
        saveDB(db);
      }
      return {
        unlockedThemes: db.unlockedThemes,
        points: db.userPoints
      };
    }),

  selectTheme: publicProcedure
    .input(z.object({ themeId: z.string() }))
    .mutation(({ input }) => {
      const db = loadDB();
      if (db.unlockedThemes.includes(input.themeId)) {
        db.currentTheme = input.themeId;
        saveDB(db);
      }
      return { currentTheme: db.currentTheme };
    }),

  simulateClanActivity: publicProcedure.mutation(() => {
    const db = loadDB();
    if (db.userClanId) {
      const clanIndex = db.clans.findIndex(c => c.id === db.userClanId);
      if (clanIndex !== -1) {
        const clan = db.clans[clanIndex];
        clan.members = clan.members.map(m => {
          if (m.id !== 'user') {
            return { ...m, hasPlayedToday: true };
          }
          return m;
        });

        const todayStr = new Date().toISOString().split('T')[0];
        const allPlayed = clan.members.every(m => m.hasPlayedToday);
        if (allPlayed && clan.lastStreakIncrementDate !== todayStr) {
          clan.collectiveStreak += 1;
          clan.members.forEach(m => {
            m.streak += 1;
          });
          clan.lastStreakIncrementDate = todayStr;
          db.userStreak = (clan.members.find(m => m.id === 'user')?.streak) || db.userStreak;
        }
        saveDB(db);
        return clan;
      }
    }
    throw new Error('Aucun clan actif pour simuler la participation');
  })
});
