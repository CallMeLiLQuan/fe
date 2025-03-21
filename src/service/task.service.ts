import { Area, Employee, Task } from "@/model/task.model";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosResponse } from "axios";
import { getToken } from "./area.service";

// Các interface cho Task, Employee và Area

// TASK API

// Lấy danh sách task (endpoint: GET /task)
export const fetchTasks = async (): Promise<Task[]> => {
  const response: AxiosResponse<Task[]> = await axiosInstance.get("/task");
  return response.data;
};

// Tạo mới task (endpoint: POST /task/create)
export const createTask = async (taskData: Task): Promise<Task> => {
  const token = getToken();
  const response: AxiosResponse<Task> = await axiosInstance.post(
    "/task",
    taskData,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Cập nhật task (endpoint: PUT /task/:id)
export const updateTask = async (id: number, taskData: Task): Promise<Task> => {
  const token = getToken();
  const response: AxiosResponse<Task> = await axiosInstance.put(
    `/task/${id}`,
    taskData,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Xoá task (endpoint: DELETE /task/:id)
export const deleteTask = async (id: number): Promise<void> => {
  const token = getToken();
  await axiosInstance.delete(`/task/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// Upload file đính kèm cho task (endpoint: POST /task-documents/upload)
export const uploadTaskDocument = async (file: File): Promise<unknown> => {
  const formData = new FormData();
  formData.append("file", file);
  const response: AxiosResponse<unknown> = await axiosInstance.post(
    "/task-documents/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

// EMPLOYEE API

// Lấy danh sách nhân viên (endpoint: GET /employee/employees)
export const fetchEmployees = async (): Promise<Employee[]> => {
  const response: AxiosResponse<Employee[]> = await axiosInstance.get(
    "/employee/employees"
  );
  return response.data;
};

// AREA API

// Lấy danh sách khu vực (endpoint: GET /area)
export const fetchAreas = async (): Promise<Area[]> => {
  const response: AxiosResponse<Area[]> = await axiosInstance.get("/area");
  return response.data;
};
