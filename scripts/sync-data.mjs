import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCATION_API = 'https://data.cityofnewyork.us/resource/fpeh-f7ci.json';
const BOROUGH_API = 'https://data.cityofnewyork.us/resource/yeji-bk3q.geojson';
const CUISINE_API = 'https://data.cityofnewyork.us/resource/43nn-pn8j.json';
const SELECT = [
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

const distanceToSegmentSq = (point, a, b) => {
  let x = a[0];
  let y = a[1];
  let dx = b[0] - x;
  let dy = b[1] - y;
  if (dx || dy) {
    const t = Math.max(0, Math.min(1, ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy)));
    x += dx * t;
    y += dy * t;
  }
  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
};

const simplifyRing = (ring, tolerance = 0.00018) => {
  if (ring.length <= 8) return ring;
  const points = ring.slice(0, -1);
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  const sqTolerance = tolerance * tolerance;

  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDistance = sqTolerance;
    let index = 0;
    for (let i = first + 1; i < last; i += 1) {
      const distance = distanceToSegmentSq(points[i], points[first], points[last]);
      if (distance > maxDistance) {
        maxDistance = distance;
        index = i;
      }
    }
    if (index) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  const simplified = points.filter((_, index) => keep[index]);
  if (simplified.length < 3) return ring;
  simplified.push([...simplified[0]]);
  return simplified;
};

const simplifyGeometry = geometry => ({
  ...geometry,
  coordinates: geometry.type === 'MultiPolygon'
    ? geometry.coordinates.map(polygon => polygon.map(ring => simplifyRing(ring)))
    : geometry.coordinates.map(ring => simplifyRing(ring))
});

const fetchJson = async url => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
};

const normalizeText = value => (value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
  .replace(/\b(LLC|INC|CORP|LTD|RESTAURANT)\b/g, '').replace(/[^A-Z0-9]/g, '');

const kmBetween = (a, b) => {
  const radians = value => value * Math.PI / 180;
  const dLat = radians(Number(b.latitude) - Number(a.latitude));
  const dLon = radians(Number(b.longitude) - Number(a.longitude));
  const latA = radians(Number(a.latitude));
  const latB = radians(Number(b.latitude));
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(latA) * Math.cos(latB) * Math.sin(dLon / 2) ** 2;
  return 6371.0088 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

const enrichCuisine = (locations, inspections) => {
  const candidatesByName = new Map();
  const unique = new Map();
  inspections.forEach(row => {
    if (!row.dba || !row.cuisine_description) return;
    const key = [row.camis, row.dba, row.building, row.street, row.cuisine_description].join('|');
    unique.set(key, {
      name: row.dba,
      address: [row.building, row.street].filter(Boolean).join(' '),
      borough: row.boro === 'STATEN ISLAND' ? 'Staten Island' : row.boro?.replace(/\b\w/g, value => value.toUpperCase()),
      latitude: Number(row.latitude), longitude: Number(row.longitude), cuisine: row.cuisine_description
    });
  });
  unique.forEach(candidate => {
    const key = normalizeText(candidate.name);
    if (!candidatesByName.has(key)) candidatesByName.set(key, []);
    candidatesByName.get(key).push(candidate);
  });
  const matches = {};
  locations.forEach(row => {
    const names = [row.assumed_name_s, row.business_legal_name].map(normalizeText).filter(Boolean);
    const candidates = names.flatMap(name => candidatesByName.get(name) || []);
    const address = normalizeText(row.street);
    const accepted = candidates.filter(candidate => normalizeText(candidate.address) === address || (
      candidate.borough === row.borough && Number.isFinite(candidate.latitude) && Number.isFinite(candidate.longitude)
      && Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude)) && kmBetween(row, candidate) <= .08
    ));
    const cuisines = [...new Set(accepted.map(candidate => candidate.cuisine))];
    if (cuisines.length === 1) matches[row.row_id] = cuisines[0];
  });
  return matches;
};

const main = async () => {
  const query = new URLSearchParams({
    '$select': SELECT,
    '$limit': '50000'
  });
  const cuisineQuery = new URLSearchParams({
    '$select': 'camis,dba,boro,building,street,cuisine_description,latitude,longitude',
    '$where': "dba is not null AND cuisine_description is not null",
    '$limit': '50000'
  });
  const [locations, boroughs, inspections] = await Promise.all([
    fetchJson(`${LOCATION_API}?${query}`),
    fetchJson(BOROUGH_API),
    fetchJson(`${CUISINE_API}?${cuisineQuery}`)
  ]);

  if (locations.length < 1000) throw new Error(`Unexpected location count: ${locations.length}`);
  const types = new Set(locations.map(row => row.license_type));
  if (!types.has('Sidewalk') || !types.has('Roadway')) throw new Error('Expected both license types.');

  const compactBoroughs = {
    ...boroughs,
    features: boroughs.features.map(feature => ({
      type: 'Feature',
      properties: { boroname: feature.properties.boroname },
      geometry: simplifyGeometry(feature.geometry)
    }))
  };

  const dataDir = path.join(ROOT, 'public', 'data');
  await mkdir(dataDir, { recursive: true });
  await writeFile(path.join(dataDir, 'fallback-locations.json'), JSON.stringify(locations));
  await writeFile(path.join(dataDir, 'boroughs.geojson'), JSON.stringify(compactBoroughs));
  const cuisineMatches = enrichCuisine(locations, inspections);
  await writeFile(path.join(dataDir, 'cuisine-enrichment.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: 'DOHMH Restaurant Inspection Results (43nn-pn8j)',
    matches: cuisineMatches
  }));

  const mapped = locations.filter(row => row.borough && Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude)));
  const byType = Object.groupBy(locations, row => row.license_type);
  const summary = {
    generatedAt: new Date().toISOString(),
    total: locations.length,
    mapped: mapped.length,
    unmapped: locations.length - mapped.length,
    sidewalk: byType.Sidewalk?.length ?? 0,
    roadway: byType.Roadway?.length ?? 0,
    cuisineMatches: Object.keys(cuisineMatches).length
  };
  await writeFile(path.join(dataDir, 'snapshot-meta.json'), JSON.stringify(summary, null, 2));
  console.log(summary);
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
