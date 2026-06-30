import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { GamificationAction, gamificationActionSlice } from './action';
import { GamificationStoreState, initialState } from './initialState';

export interface GamificationStore extends GamificationStoreState, GamificationAction {}

const createStore: StateCreator<GamificationStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...gamificationActionSlice(...parameters),
});

const devtools = createDevtools('gamification');

export const useGamificationStore = createWithEqualityFn<GamificationStore>()(
  subscribeWithSelector(devtools(createStore)),
  shallow,
);
