import { Land } from "./land.model";
import { Employee } from "./employee.model";
import { Task } from "./task.model";
import { DatabaseCoordinates, Point } from "./coordinate.model";

export enum AreaClassification {
  PLANT = 'plant',
  OTHER = 'other'
}

export interface Area {
  id: number;
  name: string;
  areaName: string;
  landPlot: string;
  status: 'available' | 'in-use' | 'pending';
  area: number;
  usage: string;
  coordinates: DatabaseCoordinates;
  classification: AreaClassification;
  employees: Employee[];
  tasks: Task[];
  created_date?: string;
  modified_date?: string;
  land?: Land;
}

export interface AreaResponse {
  id: number;
  name: string;
  areaName: string;
  landPlot: string;
  status: 'available' | 'in-use' | 'pending';
  area: number;
  usage: string;
  coordinates: {
    polygon: string;
    center: string;
    zoom: number;
  };
  classification: string;
  employees: Employee[];
  tasks: Task[];
  created_date?: string;
  modified_date?: string;
  land?: Land;
}

export const toArea = (response: AreaResponse): Area => {
  if (!response) {
    throw new Error('No response data received');
  }

  // Default coordinate values
  const defaultCoordinate: DatabaseCoordinates = {
    polygon: [[21.0235276, 105.8420103]],
    center: { lat: 21.0235276, lng: 105.8420103 },
    zoom: 15
  };

  try {
    let coordinates = defaultCoordinate;

    if (response.coordinates) {
      try {
        // Try to parse polygon
        let polygon: [number, number][] = defaultCoordinate.polygon;
        if (response.coordinates.polygon) {
          if (typeof response.coordinates.polygon === 'string') {
            polygon = JSON.parse(response.coordinates.polygon);
          } else if (Array.isArray(response.coordinates.polygon)) {
            polygon = response.coordinates.polygon;
          }
        }

        // Try to parse center
        let center: Point = defaultCoordinate.center;
        if (response.coordinates.center) {
          if (typeof response.coordinates.center === 'string') {
            center = JSON.parse(response.coordinates.center);
          } else if (typeof response.coordinates.center === 'object') {
            center = response.coordinates.center as Point;
          }
        }

        coordinates = {
          polygon,
          center,
          zoom: response.coordinates.zoom || defaultCoordinate.zoom
        };
      } catch (parseError) {
        console.error('Error parsing coordinates:', parseError);
        coordinates = defaultCoordinate;
      }
    }

    return {
      ...response,
      coordinates,
      classification: response.classification as AreaClassification
    };
  } catch (error) {
    console.error('Error converting area:', error);
    return {
      ...response,
      coordinates: defaultCoordinate,
      classification: AreaClassification.PLANT
    };
  }
};

export const toAreaResponse = (area: Area): AreaResponse => {
  return {
    ...area,
    coordinates: {
      polygon: JSON.stringify(area.coordinates.polygon),
      center: JSON.stringify(area.coordinates.center),
      zoom: area.coordinates.zoom
    },
    classification: area.classification
  };
};