import type { LobeChatDatabase } from '../type';
import { getDBInstance } from './web-server';

/**
 * Lazy-load database instance
 * Avoid initializing the database every time the module is imported
 */
let cachedDB: LobeChatDatabase | null = null;

const getLazyDB = (): LobeChatDatabase => {
  if (cachedDB) return cachedDB;
  cachedDB = getDBInstance();
  return cachedDB;
};

export const getServerDB = async (): Promise<LobeChatDatabase> => {
  return getLazyDB();
};

export const serverDB = new Proxy({} as LobeChatDatabase, {
  get(target, prop) {
    const db = getLazyDB();
    const value = Reflect.get(db, prop);
    if (typeof value === 'function') {
      return value.bind(db);
    }
    return value;
  },
  set(target, prop, value) {
    const db = getLazyDB();
    return Reflect.set(db, prop, value);
  },
  has(target, prop) {
    const db = getLazyDB();
    return Reflect.has(db, prop);
  },
  ownKeys(target) {
    const db = getLazyDB();
    return Reflect.ownKeys(db);
  },
  getOwnPropertyDescriptor(target, prop) {
    const db = getLazyDB();
    return Reflect.getOwnPropertyDescriptor(db, prop);
  },
  getPrototypeOf(target) {
    const db = getLazyDB();
    return Reflect.getPrototypeOf(db);
  }
});
