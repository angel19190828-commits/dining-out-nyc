import { describe, expect, it } from 'vitest';
import { matchCuisine } from './cuisine';

const location = { name: 'Cafe Example LLC', legalName: '', address: '12 Main St, New York', borough: 'Manhattan', latitude: 40.75, longitude: -73.98 };

describe('cuisine matching', () => {
  it('accepts a normalized name and address match', () => {
    expect(matchCuisine(location, [{ name: 'Cafe Example', address: '12 Main St', borough: 'Manhattan', cuisine: 'French' }])).toBe('French');
  });
  it('rejects conflicting cuisine candidates', () => {
    expect(matchCuisine(location, [
      { name: 'Cafe Example', address: '12 Main St', borough: 'Manhattan', cuisine: 'French' },
      { name: 'Cafe Example', address: '12 Main St', borough: 'Manhattan', cuisine: 'Italian' }
    ])).toBeNull();
  });
});
