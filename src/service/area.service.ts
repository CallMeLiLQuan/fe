import axiosInstance from '@/util/axiosInstance';
import { Area, AreaResponse, toArea } from '@/model/area.model';
import { Task } from '@/model/task.model';
import { createDefaultCoordinates, toApiCoordinates, DatabaseCoordinates, ApiCoordinates } from "@/model/coordinate.model";
import { AreaClassification } from '@/model/area.model';

export interface CreateAreaDto {
  name: string;
  areaName: string;
  landPlot: string;
  status: 'available' | 'in-use' | 'pending';
  area: number;
  usage: string;
  landId: number;
  coordinates: ApiCoordinates;
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

const BASE_URL = '/areas';

export async function fetchAreas(): Promise<Area[]> {
  try {
    console.log('Fetching areas from:', BASE_URL);
    const response = await axiosInstance.get<AreaResponse[]>(BASE_URL);
    console.log('Areas response:', JSON.stringify(response.data, null, 2));
    return response.data.map(areaResponse => {
      console.log('Processing area:', areaResponse.id);
      console.log('Area coordinates:', JSON.stringify(areaResponse.coordinates, null, 2));
      try {
        return toArea(areaResponse);
      } catch (error) {
        console.error('Error processing area:', areaResponse.id, error);
        // Return a default area with default coordinates
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
  try {
    const response = await axiosInstance.get<AreaResponse>(`${BASE_URL}/${id}`);
    return toArea(response.data);
  } catch (error) {
    console.error(`Error fetching area ${id}:`, error);
    throw error;
  }
}

export async function createArea(createAreaDto: CreateAreaDto): Promise<Area> {
  try {
    const response = await axiosInstance.post<AreaResponse>(BASE_URL, {
      ...createAreaDto,
      coordinates: typeof createAreaDto.coordinates.polygon === 'string' 
        ? createAreaDto.coordinates 
        : toApiCoordinates(createAreaDto.coordinates as unknown as DatabaseCoordinates)
    });
    return toArea(response.data);
  } catch (error) {
    console.error('Error creating area:', error);
    throw error;
  }
}

export const updateArea = async (id: number, payload: UpdateAreaDto): Promise<Area> => {
  try {
    const coordinate = payload.coordinates || createDefaultCoordinates();
    
    const requestPayload = {
      ...payload,
      coordinates: typeof coordinate.polygon === 'string'
        ? coordinate
        : toApiCoordinates(coordinate as unknown as DatabaseCoordinates)
    };

    const response = await axiosInstance.put<AreaResponse>(`${BASE_URL}/${id}`, requestPayload);
    return toArea(response.data);
  } catch (error) {
    console.error(`Error updating area ${id}:`, error);
    throw error;
  }
};

export const deleteArea = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting area ${id}:`, error);
    throw error;
  }
};

export async function getAreasByLandId(landId: number): Promise<Area[]> {
  try {
    const response = await axiosInstance.get<AreaResponse[]>(`${BASE_URL}/land/${landId}`);
    return response.data.map(areaResponse => toArea(areaResponse));
  } catch (error) {
    console.error(`Error fetching areas for land ${landId}:`, error);
    throw error;
  }
}

export const assignEmployeeToArea = async (areaId: number, employeeId: number) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/${areaId}/employees/${employeeId}`, {});
    return response.data;
  } catch (error) {
    console.error(`Error assigning employee ${employeeId} to area ${areaId}:`, error);
    throw error;
  }
};

export const removeEmployeeFromArea = async (areaId: number, employeeId: number) => {
  try {
    await axiosInstance.delete(`${BASE_URL}/${areaId}/employees/${employeeId}`);
  } catch (error) {
    console.error(`Error removing employee ${employeeId} from area ${areaId}:`, error);
    throw error;
  }
};

export const createTask = async (areaId: number, task: Partial<Task>) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/${areaId}/tasks`, task);
    return response.data;
  } catch (error) {
    console.error(`Error creating task for area ${areaId}:`, error);
    throw error;
  }
};

export const deleteTask = async (areaId: number, taskId: number) => {
  try {
    await axiosInstance.delete(`${BASE_URL}/${areaId}/tasks/${taskId}`);
  } catch (error) {
    console.error(`Error deleting task ${taskId} from area ${areaId}:`, error);
    throw error;
  }
};