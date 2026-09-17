/** @typedef {'Manhattan'|'Brooklyn'|'Queens'|'Bronx'|'Staten Island'} BoroughName */

/**
 * @typedef {Object} LandmarkMedia
 * @property {'placeholder'|'image'|'video'} type
 * @property {string|null} src
 * @property {string} caption
 * @property {string} credit
 */

/**
 * @typedef {Object} Landmark
 * @property {string} id
 * @property {string} name
 * @property {BoroughName} borough
 * @property {string} district
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} description
 * @property {string} modelKey
 * @property {[number, number, number]} stagePosition
 * @property {LandmarkMedia} media
 */

const placeholder = caption => ({ type: 'placeholder', src: null, caption, credit: 'Media pending verification' });

/** @type {Landmark[]} */
export const LANDMARKS = [
  { id: 'central-park', name: 'Central Park', borough: 'Manhattan', district: 'Upper Manhattan', latitude: 40.7829, longitude: -73.9654, description: 'Lake edges, lawns and a dense canopy in the center of Manhattan.', modelKey: 'central-park', stagePosition: [-5.7, 0, -3.1], media: placeholder('A verified real-world view will be added here.') },
  { id: 'times-square', name: 'Times Square', borough: 'Manhattan', district: 'Midtown', latitude: 40.758, longitude: -73.9855, description: 'Billboard towers and crossing streets at the center of Midtown.', modelKey: 'times-square', stagePosition: [-1.8, 0, -2.35], media: placeholder('A verified real-world view will be added here.') },
  { id: 'high-line', name: 'High Line', borough: 'Manhattan', district: 'Chelsea', latitude: 40.748, longitude: -74.0048, description: 'An elevated rail garden above the West Side streets.', modelKey: 'high-line', stagePosition: [1.55, 0, -3.6], media: placeholder('A verified real-world view will be added here.') },
  { id: 'washington-square', name: 'Washington Square Park', borough: 'Manhattan', district: 'Greenwich Village', latitude: 40.7308, longitude: -73.9973, description: 'The marble arch, fountain and tree-lined Village plaza.', modelKey: 'washington-square', stagePosition: [5.35, 0, -1.9], media: placeholder('A verified real-world view will be added here.') },
  { id: 'brooklyn-bridge-park', name: 'Brooklyn Bridge Park', borough: 'Brooklyn', district: 'Brooklyn Heights', latitude: 40.7003, longitude: -73.9967, description: 'Bridge towers, piers and a long East River edge.', modelKey: 'brooklyn-bridge', stagePosition: [-4.45, 0, -.15], media: placeholder('A verified real-world view will be added here.') },
  { id: 'dumbo', name: 'DUMBO Waterfront', borough: 'Brooklyn', district: 'DUMBO', latitude: 40.7033, longitude: -73.9888, description: 'Brick streets framed by bridge steel and waterfront.', modelKey: 'dumbo', stagePosition: [-.65, 0, .75], media: placeholder('A verified real-world view will be added here.') },
  { id: 'prospect-park', name: 'Prospect Park', borough: 'Brooklyn', district: 'Park Slope', latitude: 40.6602, longitude: -73.969, description: 'Open meadow, lake and wooded park edge.', modelKey: 'prospect-park', stagePosition: [3.1, 0, -.2], media: placeholder('A verified real-world view will be added here.') },
  { id: 'gantry-plaza', name: 'Gantry Plaza State Park', borough: 'Queens', district: 'Long Island City', latitude: 40.7475, longitude: -73.959, description: 'Industrial gantries on a broad riverside promenade.', modelKey: 'gantry', stagePosition: [6.25, 0, 1.05], media: placeholder('A verified real-world view will be added here.') },
  { id: 'flushing-meadows', name: 'Flushing Meadows–Corona Park', borough: 'Queens', district: 'Flushing Meadows', latitude: 40.7498, longitude: -73.8408, description: 'The Unisphere and radial paths of the World’s Fair grounds.', modelKey: 'unisphere', stagePosition: [-5.25, 0, 3.75], media: placeholder('A verified real-world view will be added here.') },
  { id: 'yankee-stadium', name: 'Yankee Stadium Area', borough: 'Bronx', district: 'Concourse', latitude: 40.8296, longitude: -73.9262, description: 'A stadium bowl, light towers and neighborhood blocks.', modelKey: 'stadium', stagePosition: [-2.15, 0, 4.45], media: placeholder('A verified real-world view will be added here.') },
  { id: 'nybg', name: 'New York Botanical Garden', borough: 'Bronx', district: 'Fordham', latitude: 40.8623, longitude: -73.8772, description: 'Conservatory domes set within a garden canopy.', modelKey: 'botanical', stagePosition: [1.5, 0, 3.25], media: placeholder('A verified real-world view will be added here.') },
  { id: 'st-george', name: 'St. George Waterfront', borough: 'Staten Island', district: 'St. George', latitude: 40.6437, longitude: -74.0736, description: 'Ferry terminal, harbor edge and the Manhattan crossing.', modelKey: 'ferry', stagePosition: [5.05, 0, 4.55], media: placeholder('A verified real-world view will be added here.') }
];

export const LANDMARK_BY_ID = Object.fromEntries(LANDMARKS.map(landmark => [landmark.id, landmark]));
