import axiosInstance from "@/utils/axiosInstance";
import { AxiosResponse } from "axios";

export interface TaskDocument {
  id: number;
  fileName: string;
  filePath?: string; // Đường dẫn lưu file trên server (hoặc fileUrl nếu dùng)
  description?: string;
  taskId: number;
  createdAt?: string;
}

/**
 * Upload file cho Task Document.
 * @param file File cần upload
 * @param additionalData (Tuỳ chọn) Các thông tin bổ sung, ví dụ: taskId, description, ...
 * @returns Promise chứa thông tin TaskDocument vừa tạo
 */
export const uploadTaskDocument = async (
  file: File,
  additionalData?: Partial<TaskDocument>
): Promise<TaskDocument> => {
  const formData = new FormData();
  formData.append("file", file);
  // Nếu có thêm dữ liệu, gắn vào formData
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
  }
  const response: AxiosResponse<TaskDocument> = await axiosInstance.post(
    "/task-documents/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

/**
 * Lấy danh sách tất cả Task Document.
 */
export const fetchTaskDocuments = async (): Promise<TaskDocument[]> => {
  const response: AxiosResponse<TaskDocument[]> = await axiosInstance.get(
    "/task-documents"
  );
  return response.data;
};

/**
 * Lấy thông tin một Task Document theo id.
 * @param id ID của Task Document
 */
export const fetchTaskDocument = async (id: number): Promise<TaskDocument> => {
  const response: AxiosResponse<TaskDocument> = await axiosInstance.get(
    `/task-documents/${id}`
  );
  return response.data;
};

/**
 * Cập nhật thông tin của một Task Document.
 * @param id ID của Task Document cần cập nhật
 * @param data Các trường dữ liệu cần cập nhật (có thể là Partial<TaskDocument>)
 */
export const updateTaskDocument = async (
  id: number,
  data: Partial<TaskDocument>
): Promise<TaskDocument> => {
  const response: AxiosResponse<TaskDocument> = await axiosInstance.patch(
    `/task-documents/${id}`,
    data
  );
  return response.data;
};

/**
 * Xoá một Task Document theo id.
 * @param id ID của Task Document cần xoá
 */
export const deleteTaskDocument = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/task-documents/${id}`);
};
