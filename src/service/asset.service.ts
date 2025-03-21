import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from 'axios';

export interface Asset {
  id: number;
  name: string;
  description?: string;
  type: string;
  status: string;
  location?: string;
  purchaseDate?: string;
  value?: number;
  category: string;
  quantity: number;
  properties?: any[];
  landName?: string;
  areaName?: string;
  area?: {
    id: number;
    name: string;
  };
}

export const fetchAssets = async (): Promise<Asset[]> => {
  try {
    console.log('Bắt đầu gọi API lấy danh sách tài sản');
    const response = await axiosInstance.get<Asset[]>('/asset');
    console.log('Kết quả API:', response);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Lỗi khi lấy danh sách tài sản:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data
    });
    throw error;
  }
};

export const fetchAssetsByCategory = async (category: string) => {
  try {
    const response = await axiosInstance.get(`asset/by-category/${category}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API fetchAssetsByCategory:", error);
    throw error;
  }
};

export const getAssetById = async (id: number) => {
  try {
    const response = await axiosInstance.get(`asset/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API getAssetById:", error);
    throw error;
  }
};

export const createAsset = async (asset: Omit<Asset, "id">): Promise<Asset> => {
  try {
    console.log('Bắt đầu gọi API tạo tài sản mới:', asset);
    const response = await axiosInstance.post<Asset>('/asset/create', {
      ...asset,
      value: Number(asset.value) || 0,
      quantity: Number(asset.quantity) || 1,
      status: asset.status || 'available',
      type: asset.type || 'equipment',
      category: asset.category || 'other'
    });
    console.log('Kết quả API tạo tài sản:', response);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Lỗi khi tạo tài sản:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      config: {
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        data: axiosError.config?.data
      }
    });
    throw error;
  }
};

export const updateAsset = async (id: number, asset: Partial<Asset>): Promise<Asset> => {
  try {
    console.log(`Bắt đầu gọi API cập nhật tài sản ID ${id}:`, asset);
    const response = await axiosInstance.put<Asset>(`/asset/${id}`, asset);
    console.log('Kết quả API cập nhật tài sản:', response);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Lỗi khi cập nhật tài sản:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data
    });
    throw error;
  }
};

export const deleteAsset = async (id: number): Promise<void> => {
  try {
    console.log(`Bắt đầu gọi API xóa tài sản ID ${id}`);
    await axiosInstance.delete(`/asset/${id}`);
    console.log('Xóa tài sản thành công');
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Lỗi khi xóa tài sản:', {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data
    });
    throw error;
  }
};