import { publicUrl } from '@/publicUrl';

const DATASET_URL = 'https://data.cityofnewyork.us/Transportation/Dining-Out-NYC-Locations/fpeh-f7ci/about_data';
const API_URL = 'https://data.cityofnewyork.us/resource/fpeh-f7ci.json';
const VALID_BOROUGHS = new Set(['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']);

const SELECT_FIELDS = [
  ':id as row_id',
  'business_legal_name',
  'assumed_name_s',
  'street',
  'city',
  'borough',
  'postcode',
  'license_type',
  'license_status',
  'license_issue_date',
  'license_expiration_date',
  'latitude',
  'longitude'
].join(',');

/** @typedef {'Sidewalk' | 'Roadway'} LicenseType */
/** @typedef {'all' | 'sidewalk' | 'roadway'} DiningFilter */
/** @typedef {'intro'|'intro-exit'|'text-reveal'|'landmark-enter'|'landmark'|'nearby-enter'|'nearby'|'detail'|'plan'|'source'} ScenePhase */

/**
 * @typedef {Object} DiningLocation
 * @property {string} id
 * @property {string} name
 * @property {string} legalName
 * @property {string} address
 * @property {string} locality
 * @property {string|null} borough
 * @property {LicenseType} licenseType
 * @property {string} status
 * @property {string|null} issuedAt
 * @property {string|null} expiresAt
 * @property {number} latitude
 * @property {number} longitude
 * @property {string|null} cuisine
 */

export { DATASET_URL };

export const normalizeLocation = row => {
  const latitude = Number(row.latitude);
  const longitude = Number(row.longitude);
  return {
    id: row.row_id || [row.business_legal_name, row.license_type, row.latitude, row.longitude].join('|'),
    name: row.assumed_name_s?.trim() || row.business_legal_name?.trim() || 'Unnamed establishment',
    legalName: row.business_legal_name?.trim() || '',
    address: [row.street, row.city, row.postcode].filter(Boolean).join(', '),
    locality: row.city?.trim() || 'New York City',
    borough: VALID_BOROUGHS.has(row.borough) ? row.borough : null,
    licenseType: row.license_type === 'Roadway' ? 'Roadway' : 'Sidewalk',
    status: row.license_status?.trim() || 'Unknown',
    issuedAt: row.license_issue_date || null,
    expiresAt: row.license_expiration_date || null,
    latitude,
    longitude,
    cuisine: row.cuisine || null,
    mapped: VALID_BOROUGHS.has(row.borough) && Number.isFinite(latitude) && Number.isFinite(longitude)
  };
};

const fetchJson = async (url, timeout = 9000) => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
};

export const buildApiUrl = () => {
  const params = new URLSearchParams({ '$select': SELECT_FIELDS, '$limit': '50000' });
  return `${API_URL}?${params}`;
};

export const summarizeLocations = (locations, filter = 'all') => {
  const matches = location => filter === 'all' || location.licenseType.toLowerCase() === filter;
  const filtered = locations.filter(matches);
  const mapped = filtered.filter(location => location.mapped);
  const boroughs = Object.fromEntries([...VALID_BOROUGHS].map(name => [name, 0]));
  mapped.forEach(location => { boroughs[location.borough] += 1; });
  return {
    total: filtered.length,
    mapped: mapped.length,
    unmapped: filtered.length - mapped.length,
    sidewalk: filtered.filter(location => location.licenseType === 'Sidewalk').length,
    roadway: filtered.filter(location => location.licenseType === 'Roadway').length,
    boroughs
  };
};

export const formatDate = value => {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? 'Not available'
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

export const loadStoryData = async () => {
  const [boroughs, snapshotMeta, cuisineEnrichment] = await Promise.all([
    fetchJson(publicUrl('data/boroughs.geojson')),
    fetchJson(publicUrl('data/snapshot-meta.json')),
    fetchJson(publicUrl('data/cuisine-enrichment.json')).catch(() => ({ matches: {}, generatedAt: null }))
  ]);

  let source = 'live';
  let rawLocations;
  try {
    rawLocations = await fetchJson(buildApiUrl());
  } catch (error) {
    source = 'snapshot';
    rawLocations = await fetchJson(publicUrl('data/fallback-locations.json'));
    console.info('Using the bundled NYC Open Data snapshot.', error);
  }

  const locations = rawLocations.map(row => {
    const location = normalizeLocation(row);
    return { ...location, cuisine: cuisineEnrichment.matches?.[location.id] || null };
  });
  return {
    locations,
    boroughs,
    source,
    updatedAt: source === 'live' ? new Date().toISOString() : snapshotMeta.generatedAt,
    snapshotMeta,
    cuisineMeta: { generatedAt: cuisineEnrichment.generatedAt, source: cuisineEnrichment.source }
  };
};
