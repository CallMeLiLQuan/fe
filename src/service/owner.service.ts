import axios from 'axios';
import { Owner, OwnerResponse, toOwner } from '@/model/owner.model';

// Update the API_URL to point directly to the backend API
const API_URL = 'http://localhost:3004/api';

// (Tùy chọn) Lấy token từ localStorage
export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

// Lấy danh sách tất cả Owners
export const fetchOwners = async (): Promise<Owner[]> => {
  try {
    const token = localStorage.getItem('access_token');
    console.log('Fetching owners from:', `${API_URL}/owner`);
    const response = await axios.get(`${API_URL}/owner`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Fetched owners response:', response);
    console.log('Fetched owners data:', response.data);
    
    // Check if response.data is an array
    if (Array.isArray(response.data)) {
      return response.data.map(toOwner);
    } else if (response.data && typeof response.data === 'object') {
      // If it's an object with a data property that is an array
      if (Array.isArray(response.data.data)) {
        return response.data.data.map(toOwner);
      }
      // If it's a single owner object
      if (response.data.id !== undefined) {
        return [toOwner(response.data)];
      }
    }
    
    // If we can't process the response, return empty array
    console.error('Unexpected response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching owners:', error);
    throw error;
  }
};

// Lấy 1 Owner theo ID
export const getOwnerById = async (id: string): Promise<Owner> => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get<OwnerResponse>(`${API_URL}/owner/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Fetched owner:', response.data);
    return toOwner(response.data);
  } catch (error) {
    console.error('Error fetching owner:', error);
    throw error;
  }
};

// Tạo mới Owner
export const createOwner = async (owner: Partial<Owner>): Promise<Owner> => {
  try {
    const token = localStorage.getItem('access_token');
    console.log('Creating owner with payload:', owner);
    const response = await axios.post<OwnerResponse>(`${API_URL}/owner`, owner, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Created owner:', response.data);
    return toOwner(response.data);
  } catch (error) {
    console.error('Error creating owner:', error);
    throw error;
  }
};

// Cập nhật Owner theo ID
export const updateOwner = async (
  id: string,
  owner: Partial<Owner>
): Promise<Owner> => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.patch<OwnerResponse>(`${API_URL}/owner/${id}`, owner, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Updated owner:', response.data);
    return toOwner(response.data);
  } catch (error) {
    console.error('Error updating owner:', error);
    throw error;
  }
};

// Xóa Owner theo ID
export const deleteOwner = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('access_token');
    await axios.delete(`${API_URL}/owner/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Deleted owner:', id);
  } catch (error) {
    console.error('Error deleting owner:', error);
    throw error;
  }
};

// Lấy danh sách lands của 1 Owner (nếu có route tương ứng trên backend)
export const getOwnerLands = async (id: number) => {
  const response = await axios.get(`${API_URL}/owner/${id}/lands`);
  return response.data;
};

export const refreshOwnerLandCount = async (id: string): Promise<Owner> => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.post<OwnerResponse>(
      `${API_URL}/owner/${id}/refresh-land-count`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('Refreshed owner land count:', response.data);
    return toOwner(response.data);
  } catch (error) {
    console.error('Error refreshing owner land count:', error);
    throw error;
  }
};
