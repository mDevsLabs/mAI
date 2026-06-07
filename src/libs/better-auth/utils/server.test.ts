import { describe, expect, it } from 'vitest';

import { parseSSOProviders } from './server';

describe('parseSSOProviders', () => {
  const defaultProviders = [
    'google',
    'github',
    'canva',
    'twitch',
    'discord',
    'slack',
    'telegram',
    'x',
    'notion',
    'spotify',
    'railway',
    'vercel',
    'monday',
  ];

  it('should return default array when input is undefined', () => {
    expect(parseSSOProviders(undefined)).toEqual(defaultProviders);
  });

  it('should return default array when input is empty string', () => {
    expect(parseSSOProviders('')).toEqual(defaultProviders);
  });

  it('should return default array when input contains only whitespace', () => {
    expect(parseSSOProviders('   ')).toEqual(defaultProviders);
  });

  it('should parse single provider', () => {
    expect(parseSSOProviders('google')).toEqual(['google', 'railway', 'vercel', 'monday']);
  });

  it('should parse multiple providers separated by English comma', () => {
    expect(parseSSOProviders('google,github,microsoft')).toEqual(['google', 'github', 'microsoft', 'railway', 'vercel', 'monday']);
  });

  it('should parse multiple providers separated by Chinese comma', () => {
    expect(parseSSOProviders('google，github，microsoft')).toEqual([
      'google',
      'github',
      'microsoft',
      'railway',
      'vercel',
      'monday',
    ]);
  });

  it('should parse providers with mixed comma separators', () => {
    expect(parseSSOProviders('google,github，microsoft')).toEqual([
      'google',
      'github',
      'microsoft',
      'railway',
      'vercel',
      'monday',
    ]);
  });

  it('should trim whitespace from providers', () => {
    expect(parseSSOProviders(' google , github , microsoft ')).toEqual([
      'google',
      'github',
      'microsoft',
      'railway',
      'vercel',
      'monday',
    ]);
  });

  it('should filter out empty entries', () => {
    expect(parseSSOProviders('google,,github,，,microsoft')).toEqual([
      'google',
      'github',
      'microsoft',
      'railway',
      'vercel',
      'monday',
    ]);
  });

  it('should trim leading and trailing whitespace from input', () => {
    expect(parseSSOProviders('  google,github  ')).toEqual(['google', 'github', 'railway', 'vercel', 'monday']);
  });
});
