export const PRESET_COLORS = [
  { name: 'Azure', value: '#0073EC' },
  { name: 'Turtle', value: '#00CAAA' },
  { name: 'Tangerine', value: '#F59D00' },
  { name: 'Prince', value: '#A644E5' },
  { name: 'Coral', value: '#FF4A48' },
  { name: 'Sunflower', value: '#FFDA00' },
];

export const DRAWING_MODES = {
  RADIUS: 'radius',
  POLYGON: 'polygon',
  MULTI_ZONE: 'multi-zone',
};

export const DEFAULT_CENTER = [39.8283, -98.5795]; // Center of US
export const DEFAULT_ZOOM = 4;
export const CITY_ZOOM = 12;

export const MILES_TO_METERS = 1609.344;

export const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CartoDB</a>';

export const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
