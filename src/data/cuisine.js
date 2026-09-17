import { haversineDistanceKm } from './nearby';

export const normalizeMatchText = value => (value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase()
  .replace(/\b(LLC|INC|CORP|LTD|RESTAURANT)\b/g, '')
  .replace(/[^A-Z0-9]/g, '');

export function matchCuisine(location, candidates) {
  const name = normalizeMatchText(location.name);
  const legalName = normalizeMatchText(location.legalName);
  const address = normalizeMatchText(location.address.split(',')[0]);
  const matches = candidates.filter(candidate => {
    const candidateName = normalizeMatchText(candidate.name);
    const namesMatch = candidateName === name || candidateName === legalName;
    if (!namesMatch) return false;
    const addressMatches = normalizeMatchText(candidate.address) === address;
    const nearby = candidate.borough === location.borough && Number.isFinite(candidate.latitude) && Number.isFinite(candidate.longitude)
      && haversineDistanceKm(location, candidate) <= .08;
    return addressMatches || nearby;
  });
  const cuisines = [...new Set(matches.map(candidate => candidate.cuisine).filter(Boolean))];
  return cuisines.length === 1 ? cuisines[0] : null;
}
