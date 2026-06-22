import { describe, expect, it } from 'vitest';

import { useGlobalStore } from '@/store/global';
import { getStableNavigate } from './stableNavigate';
import type { NavigateFunction } from 'react-router';

describe('getStableNavigate', () => {
  it('should return null initially', () => {
    // Ensure initial state is clean
    useGlobalStore.setState({
      navigationRef: { current: null },
    });
    expect(getStableNavigate()).toBeNull();
  });

  it('should return the navigate function when it is set in the store', () => {
    const mockNavigate = (() => {}) as unknown as NavigateFunction;

    useGlobalStore.setState({
      navigationRef: { current: mockNavigate },
    });

    expect(getStableNavigate()).toBe(mockNavigate);
  });
});
