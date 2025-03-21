
export interface CreateLandDto {
  name: string;
  address: string;
  area: number;
  price: number;
  location: string;
  areaCount: number;
  properties: LandProperty[];
  coordinate: CreateCoordinateDto;
  areas: unknown[];
  planningMapUrl: string;
  googleMapUrl: string;
  owner: CreateOwnerDto;
  region: CreateRegionDto;
}

export interface LandProperty {
  key: string;
  value: string | number | boolean;
}

export interface CreateCoordinateDto {
  polygon: string; // JSON string of [number, number][]
  center: string; // JSON string of Point
  zoom: number;
}

export interface CreateOwnerDto {
  id: number;
  name: string;
  phone: string;
}

export interface CreateRegionDto {
  id: number;
  name: string;
} 