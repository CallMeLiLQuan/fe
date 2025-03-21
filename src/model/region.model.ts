export interface Region {
  id: number;
  name: string;
  description: string;
  properties?: Record<string, unknown>[];
  lands?: {
    id: number;
    name: string;
    description?: string;
  }[];
  created_date?: string;
  modified_date?: string;
}

export interface RegionFormData {
  name: string;
  description: string;
  properties?: Record<string, unknown>[];
}