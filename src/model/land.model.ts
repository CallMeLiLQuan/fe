import { Area, AreaResponse } from "./area.model";
import { DatabaseCoordinates } from "./coordinate.model";

export interface Land {
  id: number;
  name: string;
  address: string;
  area: number;
  price: number;
  location: string;
  areaCount: number;
  properties: {
    key: string;
    value: string | number | boolean;
  }[];
  coordinate: DatabaseCoordinates;
  areas: Area[];
  planningMapUrl?: string;
  googleMapUrl?: string;
  created_date?: string;
  modified_date?: string;
  owner: {
    id: number;
    name: string;
    phone: string;
  };
  region: {
    id: number;
    name: string;
  };
}

export interface LandResponse {
  id: number;
  name: string;
  address: string;
  area: number;
  price: number;
  location: string;
  areaCount: number;
  properties?: { key: string; value: string | number | boolean }[];
  coordinate: {
    polygon: string;
    center: string;
    zoom?: number;
  };
  areas?: AreaResponse[];
  planningMapUrl?: string;
  googleMapUrl?: string;
  owner: {
    id: number;
    name?: string;
    phone?: string;
  };
  region: {
    id: number;
    name?: string;
  };
  created_date?: string;
  modified_date?: string;
}

export const toLand = (response: LandResponse): Land => {
  if (!response) {
    throw new Error('No response data received');
  }

  const defaultCoordinate: DatabaseCoordinates = {
    polygon: [[21.0235276, 105.8420103]],
    center: { lat: 21.0235276, lng: 105.8420103 },
    zoom: 15
  };

  let coordinate: DatabaseCoordinates;
  try {
    if (!response.coordinate) {
      coordinate = defaultCoordinate;
    } else {
      const polygon = typeof response.coordinate.polygon === 'string' 
        ? JSON.parse(response.coordinate.polygon)
        : response.coordinate.polygon;

      const center = typeof response.coordinate.center === 'string'
        ? JSON.parse(response.coordinate.center)
        : response.coordinate.center;

      coordinate = {
        polygon: polygon,
        center: center,
        zoom: response.coordinate.zoom || 15
      };
    }
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    coordinate = defaultCoordinate;
  }

  const areas = (response.areas || []).map(area => {
    let areaCoordinates: DatabaseCoordinates;
    try {
      if (!area.coordinates) {
        areaCoordinates = defaultCoordinate;
      } else {
        const polygon = typeof area.coordinates.polygon === 'string'
          ? JSON.parse(area.coordinates.polygon)
          : area.coordinates.polygon;

        const center = typeof area.coordinates.center === 'string'
          ? JSON.parse(area.coordinates.center)
          : area.coordinates.center;

        areaCoordinates = {
          polygon: polygon,
          center: center,
          zoom: area.coordinates.zoom || 15
        };
      }
    } catch (error) {
      console.error('Error parsing area coordinates:', error);
      areaCoordinates = defaultCoordinate;
    }

    return {
      ...area,
      coordinates: areaCoordinates
    } as Area;
  });

  return {
    ...response,
    properties: response.properties || [],
    coordinate,
    areas,
    owner: {
      id: response.owner.id,
      name: response.owner.name || '',
      phone: response.owner.phone || ''
    },
    region: {
      id: response.region.id,
      name: response.region.name || ''
    }
  };
};