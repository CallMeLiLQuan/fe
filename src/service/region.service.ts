import axiosInstance from "@/utils/axiosInstance";
import { Region } from "../model/region.model";
import axios from "axios";

export const fetchRegions = async () => {
  try {
    console.log('Fetching regions...');
    const response = await axiosInstance.get<Region[]>("/region");
    console.log('Regions response:', response.data);
    
    if (!response.data) {
      console.error('No data received from API');
      return [];
    }

    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching regions:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const getRegionById = async (id: number) => {
  try {
    const response = await axiosInstance.get<Region>(`/region/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching region ${id}:`, error);
    throw error;
  }
};

export const createRegion = async (payload: Partial<Region>) => {
  try {
    const response = await axiosInstance.post<Region>("/region", payload);
    return response.data;
  } catch (error) {
    console.error('Error creating region:', error);
    throw error;
  }
};

export const updateRegion = async (id: number, payload: Partial<Region>) => {
  try {
    const response = await axiosInstance.put<Region>(`/region/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating region ${id}:`, error);
    throw error;
  }
};

export const deleteRegion = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/region/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting region ${id}:`, error);
    throw error;
  }
};