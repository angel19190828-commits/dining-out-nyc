import { describe, expect, it } from 'vitest';
import { assignItinerarySlot, haversineDistanceKm, itinerarySegments, selectNearbyLocations } from './nearby';

const landmark = { latitude: 40.758, longitude: -73.9855 };
const atDistance = (id, latitudeDelta) => ({ id, mapped: true, latitude: landmark.latitude + latitudeDelta, longitude: landmark.longitude });

describe('nearby dining', () => {
  it('uses haversine distance and expands the radius until enough records exist', () => {
    const locations = Array.from({ length: 10 }, (_, index) => atDistance(String(index), .002 + index * .0008));
    const result = selectNearbyLocations(locations, landmark, 8, 24);
    expect(result.locations).toHaveLength(10);
    expect(result.radiusKm).toBe(1.2);
    expect(result.locations[0].distanceKm).toBeLessThan(result.locations[9].distanceKm);
  });

  it('moves a restaurant instead of duplicating it in the itinerary', () => {
    const restaurant = atDistance('a', .002);
    const morning = assignItinerarySlot({}, 'morning', restaurant);
    const evening = assignItinerarySlot(morning, 'evening', restaurant);
    expect(evening.morning).toBeNull();
    expect(evening.evening.id).toBe('a');
  });

  it('reports only straight-line itinerary distance', () => {
    const itinerary = { morning: atDistance('a', 0), afternoon: atDistance('b', .01), evening: null };
    const route = itinerarySegments(itinerary);
    expect(route.segments).toHaveLength(1);
    expect(route.totalKm).toBeCloseTo(haversineDistanceKm(itinerary.morning, itinerary.afternoon));
  });
});
