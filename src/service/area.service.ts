import axiosInstance from '@/util/axiosInstance';
import { Area, AreaResponse, toArea } from '@/model/area.model';
import { Task } from '@/model/task.model';
import { createDefaultCoordinates, DatabaseCoordinates, ApiCoordinates } from "@/model/coordinate.model";
import { AreaClassification } from '@/model/area.model';

export interface CreateAreaDto {
  name: string;
  areaName: string;
  landPlot: string;
  status: 'available' | 'in-use' | 'pending';
  area: number;
  usage: string;
  landId: number;
  coordinates: DatabaseCoordinates;
  classification?: string;
}

export type UpdateAreaDto = Partial<CreateAreaDto>;

export interface Coordinate {
  polygon: string;
  center: string;
  zoom: number;
}

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

const BASE_URL = 'areas';

export async function fetchAreas(): Promise<Area[]> {
  const token = getToken();
  try {
    console.log('Fetching areas from:', BASE_URL);
    const response = await axiosInstance.get<AreaResponse[]>(BASE_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Areas response:', JSON.stringify(response.data, null, 2));
    return response.data.map(areaResponse => {
      console.log('Processing area:', areaResponse.id);
      console.log('Area coordinates:', JSON.stringify(areaResponse.coordinates, null, 2));
      try {
        return toArea(areaResponse);
      } catch (error) {
        console.error('Error processing area:', areaResponse.id, error);
        return {
          ...areaResponse,
          coordinates: createDefaultCoordinates(),
          classification: AreaClassification.PLANT
        } as Area;
      }
    });
  } catch (error) {
    console.error('Error fetching areas:', error);
    throw error;
  }
}

export async function getAreaById(id: number): Promise<Area> {
  const token = getToken();
  try {
    const response = await axiosInstance.get<AreaResponse>(`${BASE_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return toArea(response.data);
  } catch (error) {
    console.error(`Error fetching area ${id}:`, error);
    throw error;
  }
}

interface CreateAreaPayload {
  name: string;
  areaName: string;
  landId: number;
  area: number;
  usage: string;
  status: 'available' | 'in-use' | 'pending';
  classification: AreaClassification;
  coordinates?: DatabaseCoordinates;
  landPlot: string;
}

export const createArea = async (payload: CreateAreaPayload) => {
  const token = getToken();
  try {
    const formattedPayload = {
      ...payload,
      coordinates: payload.coordinates || createDefaultCoordinates()
    };

    console.log('Creating area with payload:', JSON.stringify(formattedPayload, null, 2));
    const response = await axiosInstance.post(BASE_URL, formattedPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Server response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating area:', error);
    throw error;
  }
};

export const updateArea = async (id: number, payload: UpdateAreaDto): Promise<Area> => {
  const token = getToken();
  try {
    const formattedPayload = {
      ...payload,
      coordinates: payload.coordinates || undefined
    };

    console.log('Updating area with payload:', JSON.stringify(formattedPayload, null, 2));
    const response = await axiosInstance.put<AreaResponse>(`${BASE_URL}/${id}`, formattedPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return toArea(response.data);
  } catch (error) {
    console.error(`Error updating area ${id}:`, error);
    throw error;
  }
};

export const deleteArea = async (id: number): Promise<void> => {
  const token = getToken();
  try {
    await axiosInstance.delete(`${BASE_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error(`Error deleting area ${id}:`, error);
    throw error;
  }
};

export async function getAreasByLandId(landId: number): Promise<Area[]> {
  const token = getToken();
  try {
    const response = await axiosInstance.get<AreaResponse[]>(`${BASE_URL}/land/${landId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.map(areaResponse => toArea(areaResponse));
  } catch (error) {
    console.error(`Error fetching areas for land ${landId}:`, error);
    throw error;
  }
}

export const assignEmployeeToArea = async (areaId: number, employeeId: number) => {
  const token = getToken();
  try {
    const response = await axiosInstance.post(`${BASE_URL}/${areaId}/employee/${employeeId}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error assigning employee ${employeeId} to area ${areaId}:`, error);
    throw error;
  }
};

export const removeEmployeeFromArea = async (areaId: number, employeeId: number) => {
  const token = getToken();
  try {
    await axiosInstance.delete(`${BASE_URL}/${areaId}/employee/${employeeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error(`Error removing employee ${employeeId} from area ${areaId}:`, error);
    throw error;
  }
};

export const createTask = async (areaId: number, task: Partial<Task>) => {
  const token = getToken();
  try {
    const response = await axiosInstance.post(`${BASE_URL}/${areaId}/task`, task, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error creating task for area ${areaId}:`, error);
    throw error;
  }
};

export const deleteTask = async (areaId: number, taskId: number) => {
  const token = getToken();
  try {
    await axiosInstance.delete(`${BASE_URL}/${areaId}/task/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error(`Error deleting task ${taskId} from area ${areaId}:`, error);
    throw error;
  }
};