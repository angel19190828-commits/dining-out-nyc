import { describe, expect, it } from 'vitest';
import { buildApiUrl, formatDate, normalizeLocation, summarizeLocations } from './dining';

const row = {
  row_id: 'row-a',
  business_legal_name: 'LEGAL NAME LLC',
  assumed_name_s: 'Neighborhood Table',
  street: '10 TEST STREET',
  city: 'NEW YORK',
  postcode: '10001',
  borough: 'Manhattan',
  license_type: 'Sidewalk',
  license_status: 'Issued',
  license_issue_date: '2026-01-02T12:00:00',
  license_expiration_date: '2030-01-02T23:59:59',
  latitude: '40.75',
  longitude: '-73.99'
};

describe('Dining Out data', () => {
  it('normalizes public rows and favors the assumed restaurant name', () => {
    const location = normalizeLocation(row);
    expect(location).toMatchObject({
      id: 'row-a',
      name: 'Neighborhood Table',
      legalName: 'LEGAL NAME LLC',
      borough: 'Manhattan',
      licenseType: 'Sidewalk',
      mapped: true
    });
    expect(location.address).toBe('10 TEST STREET, NEW YORK, 10001');
  });

  it('keeps malformed borough rows in totals but excludes them from map counts', () => {
    const valid = normalizeLocation(row);
    const invalid = normalizeLocation({ ...row, row_id: 'row-b', borough: undefined, license_type: 'Roadway' });
    const summary = summarizeLocations([valid, invalid]);
    expect(summary).toMatchObject({ total: 2, mapped: 1, unmapped: 1, sidewalk: 1, roadway: 1 });
    expect(summary.boroughs.Manhattan).toBe(1);
  });

  it('updates total and mapped counts with the type filter', () => {
    const locations = [
      normalizeLocation(row),
      normalizeLocation({ ...row, row_id: 'row-b', borough: 'Brooklyn', license_type: 'Roadway' }),
      normalizeLocation({ ...row, row_id: 'row-c', borough: null, license_type: 'Sidewalk' })
    ];
    expect(summarizeLocations(locations, 'sidewalk')).toMatchObject({ total: 2, mapped: 1, unmapped: 1 });
    expect(summarizeLocations(locations, 'roadway')).toMatchObject({ total: 1, mapped: 1, unmapped: 0 });
  });

  it('requests stable row ids and all fields needed by the receipt', () => {
    const url = decodeURIComponent(buildApiUrl()).replaceAll('+', ' ');
    expect(url).toContain(':id as row_id');
    expect(url).toContain('license_expiration_date');
    expect(url).toContain('$limit=50000');
  });

  it('formats official timestamps for readers', () => {
    expect(formatDate('2026-01-02T12:00:00')).toMatch(/Jan 2, 2026/);
    expect(formatDate(null)).toBe('Not available');
  });
});
