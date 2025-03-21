export interface Asset {
  id: number;
  name: string;
  type: string;
  quantity: number;
  properties?: Record<string, any>[];
  landId?: number;
  areaId?: number;
  landName: string;
  areaName: string;
  plantInfo?: {
    age: number;
    wateringSchedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      amount: number;
      description: string;
    };
  };
}