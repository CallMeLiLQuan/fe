import { LatLng } from 'leaflet';

export interface DatabasePoint {
  "0": string;
  "1": string;
}

export interface DatabaseCoordinates {
  polygon: string;
  center?: [number, number];
  zoom?: number;
}

export interface Coordinates {
  polygon: LatLng[];
  center: LatLng;
  zoom: number;
}

export const parsePolygonString = (polygonString: string): LatLng[] => {
  try {
    const parsed = JSON.parse(polygonString);
    return parsed.map((point: DatabasePoint) => new LatLng(
      parseFloat(point["1"]),
      parseFloat(point["0"])
    ));
  } catch (error) {
    console.error('Error parsing polygon string:', error);
    return [];
  }
};

export const calculateCenter = (points: LatLng[]): LatLng => {
  if (points.length === 0) {
    // Default center (Hà Nội)
    return new LatLng(21.0285, 105.8542);
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

export const toFrontendCoordinates = (dbCoords: DatabaseCoordinates): Coordinates => {
  const polygon = parsePolygonString(dbCoords.polygon);
  const center = dbCoords.center 
    ? new LatLng(dbCoords.center[1], dbCoords.center[0])
    : calculateCenter(polygon);

  return {
    polygon,
    center,
    zoom: dbCoords.zoom || 15
  };
};

export const formatCoordinatesForDatabase = (coordinates: LatLng[]): string => {
  return JSON.stringify(
    coordinates.map(coord => ({
      "0": coord.lng.toString(),
      "1": coord.lat.toString()
    }))
  );
};

// Hàm tạo format mới đơn giản hơn cho database
export const formatSimpleCoordinates = (coordinates: LatLng[]): string => {
  return JSON.stringify(
    coordinates.map(coord => [coord.lng, coord.lat])
  );
};

// Hàm parse format mới
export const parseSimpleCoordinates = (coordString: string): LatLng[] => {
  try {
    const coords = JSON.parse(coordString) as [number, number][];
    return coords.map(point => new LatLng(point[1], point[0]));
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return [];
  }
};

export const toDatabaseCoordinates = (coords: Coordinates): DatabaseCoordinates => {
  return {
    polygon: formatCoordinatesForDatabase(coords.polygon),
    center: [coords.center.lng, coords.center.lat] as [number, number],
    zoom: coords.zoom
  };
};

export const createDefaultCoordinates = (): DatabaseCoordinates => {
  const defaultCenter = new LatLng(21.0235276, 105.8420103);
  return {
    polygon: '[]',
    center: [defaultCenter.lng, defaultCenter.lat] as [number, number],
    zoom: 15
  };
};

export const isValidCoordinates = (coords: unknown): coords is DatabaseCoordinates => {
  const dbCoords = coords as DatabaseCoordinates;
  return (
    typeof coords === 'object' &&
    coords !== null &&
    'polygon' in coords &&
    'center' in coords &&
    'zoom' in coords &&
    typeof dbCoords.polygon === 'string' &&
    (
      dbCoords.center === undefined ||
      (Array.isArray(dbCoords.center) &&
      dbCoords.center.length === 2 &&
      typeof dbCoords.center[0] === 'number' &&
      typeof dbCoords.center[1] === 'number')
    ) &&
    typeof dbCoords.zoom === 'number'
  );
}; 