import axiosInstance from "@/utils/axiosInstance";
import { Owner } from "@/model/owner.model";

// (Tùy chọn) Lấy token từ localStorage
export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

// Lấy danh sách tất cả Owners
export const fetchOwners = async (): Promise<Owner[]> => {
  const response = await axiosInstance.get("/owner");
  return response.data;
};

// Lấy 1 Owner theo ID
export const getOwnerById = async (id: number): Promise<Owner> => {
  const response = await axiosInstance.get(`/owner/${id}`);
  return response.data;
};

// Tạo mới Owner
export const createOwner = async (
  payload: Omit<Owner, "id" | "created_date" | "landCount">
): Promise<Owner> => {
  // Nếu bạn có dùng token, có thể truyền vào headers:
  const token = getToken();
  const response = await axiosInstance.post("/owner", payload, {});
  return response.data;
};

// Cập nhật Owner theo ID
export const updateOwner = async (
  id: number,
  payload: Partial<Owner>
): Promise<Owner> => {
  const token = getToken();
  const response = await axiosInstance.put(`/owner/${id}`, payload, {});
  return response.data;
};

// Xóa Owner theo ID
export const deleteOwner = async (id: number): Promise<void> => {
  const token = getToken();
  await axiosInstance.delete(`/owner/${id}`, {});
};

// Lấy danh sách lands của 1 Owner (nếu có route tương ứng trên backend)
export const getOwnerLands = async (id: number) => {
  const response = await axiosInstance.get(`/owner/${id}/lands`);
  return response.data;
};
