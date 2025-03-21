import { LatLng } from 'leaflet';

export interface Point {
  lat: number;
  lng: number;
}

export interface DatabasePoint {
  lat: number;
  lng: number;
}

export interface DatabaseCoordinates {
  polygon: [number, number][];  // Array of [lat, lng] pairs
  center: Point;
  zoom: number;
}

export interface ApiCoordinates {
  polygon: string;  // JSON string of [number, number][]
  center: string;   // JSON string of Point
  zoom: number;
}

export interface Coordinates {
  polygon: [number, number][];  // Array of [lat, lng] pairs
  center: Point;
  zoom: number;
}

export interface DrawEvent {
  layer: L.Polygon;
}

export interface PolygonPoint {
  lat: number;
  lng: number;
}

// Helper functions
export const parseCoordinates = (points: [number, number][]): LatLng[] => {
  if (!Array.isArray(points)) {
    console.warn('Invalid points data:', points);
    return [];
  }

  try {
    return points.map(([lat, lng]) => new LatLng(lat, lng));
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return [];
  }
};

export const calculateCenter = (points: LatLng[]): LatLng => {
  if (!points || points.length === 0) {
    return new LatLng(21.0285, 105.8542); // Default center (Hanoi)
  }

  const sum = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng
    }),
    { lat: 0, lng: 0 }
  );

  return new LatLng(
    sum.lat / points.length,
    sum.lng / points.length
  );
};

export const parseCenter = (center: DatabasePoint | [number, number] | string | undefined): LatLng => {
  if (typeof center === 'string') {
    try {
      const parsed = JSON.parse(center);
      if (Array.isArray(parsed) && parsed.length >= 2) {
        return new LatLng(parsed[0], parsed[1]);
      } else if (parsed && typeof parsed === 'object' && 'lat' in parsed && 'lng' in parsed) {
        return new LatLng(parsed.lat, parsed.lng);
      }
    } catch (error) {
      console.error('Error parsing center string:', error);
    }
  }

  if (!center) {
    return new LatLng(21.0285, 105.8542);
  }

  if (Array.isArray(center) && center.length >= 2) {
    return new LatLng(center[0], center[1]);
  } 
  
  if (typeof center === 'object' && center !== null && 'lat' in center && 'lng' in center) {
    return new LatLng(center.lat, center.lng);
  }
  
  return new LatLng(21.0285, 105.8542);
};

export const createDefaultCoordinates = (): DatabaseCoordinates => ({
  polygon: [[21.0235276, 105.8420103]],
  center: { lat: 21.0235276, lng: 105.8420103 },
  zoom: 15
});

export const toApiCoordinates = (coordinates: DatabaseCoordinates): ApiCoordinates => ({
  polygon: JSON.stringify(coordinates.polygon),
  center: JSON.stringify(coordinates.center),
  zoom: coordinates.zoom
});

export const formatForDatabase = (coordinates: LatLng[]): [number, number][] => {
  if (!coordinates || !Array.isArray(coordinates)) {
    return [];
  }

  try {
    // Convert to database format: [lat, lng]
    return coordinates.map(coord => [coord.lat, coord.lng] as [number, number]);
  } catch (error) {
    console.error('Error formatting coordinates for database:', error);
    return [];
  }
};

export const toDatabaseCoordinates = (coordinates: ApiCoordinates): DatabaseCoordinates => {
  try {
    const polygon = JSON.parse(coordinates.polygon) as [number, number][];
    const center = JSON.parse(coordinates.center) as Point;
    
    return {
      polygon,
      center,
      zoom: coordinates.zoom
    };
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return createDefaultCoordinates();
  }
};

export { LatLng };
