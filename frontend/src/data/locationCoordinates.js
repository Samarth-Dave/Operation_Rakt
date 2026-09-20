/**
 * Tactical Geospatial Intelligence Coordinate Registry
 * Maps location node names and crime report points of interest to [latitude, longitude].
 */

export const KNOWN_LOCATIONS = {
  // Mumbai Western Suburbs (Extortion & Collection cluster)
  'Agarwal Textile Mills': [19.1197, 72.8468],
  'Andheri West': [19.1197, 72.8468],
  'Andheri West, Mumbai': [19.1197, 72.8468],
  'Shankar Tea Stall Lokhandwala': [19.1415, 72.8315],
  'Lokhandwala': [19.1415, 72.8315],
  'Shaikh Electronics': [19.1362, 72.8595],
  'Jogeshwari East': [19.1362, 72.8595],
  'Jogeshwari East, Mumbai': [19.1362, 72.8595],
  'Royal Hotel Goregaon West': [19.1663, 72.8492],
  'Royal Hotel Goregaon': [19.1663, 72.8492],
  'Goregaon West': [19.1663, 72.8492],
  'Goregaon West, Crime Branch': [19.1663, 72.8492],
  'Verma General Store': [19.1350, 72.8140],
  'Versova': [19.1350, 72.8140],
  'Versova, Mumbai': [19.1350, 72.8140],
  'Thane': [19.2183, 72.9781],
  'Mumbai': [19.0760, 72.8777],

  // Interstate Syndicate Nodes
  'Delhi Syndicate HQ': [28.6304, 77.2177],
  'Delhi': [28.6139, 77.2090],
  'Central Delhi': [28.6304, 77.2177],
};

// Fuzzy keyword search for coordinates
const KEYWORD_MAP = [
  { keyword: 'agarwal', coords: [19.1197, 72.8468] },
  { keyword: 'andheri', coords: [19.1197, 72.8468] },
  { keyword: 'lokhandwala', coords: [19.1415, 72.8315] },
  { keyword: 'tea stall', coords: [19.1415, 72.8315] },
  { keyword: 'jogeshwari', coords: [19.1362, 72.8595] },
  { keyword: 'shaikh', coords: [19.1362, 72.8595] },
  { keyword: 'goregaon', coords: [19.1663, 72.8492] },
  { keyword: 'royal hotel', coords: [19.1663, 72.8492] },
  { keyword: 'versova', coords: [19.1350, 72.8140] },
  { keyword: 'verma', coords: [19.1350, 72.8140] },
  { keyword: 'thane', coords: [19.2183, 72.9781] },
  { keyword: 'mumbai', coords: [19.0760, 72.8777] },
  { keyword: 'delhi', coords: [28.6139, 77.2090] },
];

/**
 * Resolves coordinates for a location string.
 * Uses exact match first, then case-insensitive fuzzy match, and lastly a deterministic hash offset around Mumbai.
 */
export function getLocationCoords(name) {
  if (!name) return null;

  const trimmed = name.trim();
  if (KNOWN_LOCATIONS[trimmed]) {
    return KNOWN_LOCATIONS[trimmed];
  }

  const lower = trimmed.toLowerCase();
  for (const item of KEYWORD_MAP) {
    if (lower.includes(item.keyword)) {
      return item.coords;
    }
  }

  // Fallback: deterministic hash within Mumbai metropolitan region
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash << 5) - hash + trimmed.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 100) / 100 - 0.5) * 0.15;
  const lngOffset = ((Math.abs(hash >> 3) % 100) / 100 - 0.5) * 0.15;

  return [19.12 + latOffset, 72.85 + lngOffset];
}
