export const SEARCH_RADII_KM = [0.8, 1.2, 1.5, 2];

export function haversineDistanceKm(a, b) {
  const radians = value => value * Math.PI / 180;
  const earthRadius = 6371.0088;
  const latitudeDelta = radians(b.latitude - a.latitude);
  const longitudeDelta = radians(b.longitude - a.longitude);
  const latitudeA = radians(a.latitude);
  const latitudeB = radians(b.latitude);
  const value = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function selectNearbyLocations(locations, landmark, minimum = 8, maximum = 24) {
  if (!landmark) return { locations: [], radiusKm: SEARCH_RADII_KM[0] };
  const ranked = locations
    .filter(location => location.mapped && Number.isFinite(location.latitude) && Number.isFinite(location.longitude))
    .map(location => ({ ...location, distanceKm: haversineDistanceKm(landmark, location) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
  let radiusKm = SEARCH_RADII_KM.at(-1);
  for (const radius of SEARCH_RADII_KM) {
    radiusKm = radius;
    if (ranked.filter(location => location.distanceKm <= radius).length >= minimum) break;
  }
  return { locations: ranked.filter(location => location.distanceKm <= radiusKm).slice(0, maximum), radiusKm };
}

export function assignItinerarySlot(itinerary, slot, restaurant) {
  const next = { morning: null, afternoon: null, evening: null, ...itinerary };
  for (const key of Object.keys(next)) if (next[key]?.id === restaurant.id) next[key] = null;
  next[slot] = restaurant;
  return next;
}

export function itinerarySegments(itinerary) {
  const ordered = ['morning', 'afternoon', 'evening']
    .map(slot => ({ slot, restaurant: itinerary[slot] }))
    .filter(entry => entry.restaurant);
  const segments = ordered.slice(1).map((entry, index) => ({
    from: ordered[index],
    to: entry,
    distanceKm: haversineDistanceKm(ordered[index].restaurant, entry.restaurant)
  }));
  return { ordered, segments, totalKm: segments.reduce((sum, segment) => sum + segment.distanceKm, 0) };
}

export const formatDistance = distanceKm => distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`;
