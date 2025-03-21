// employee.service.ts
import axiosInstance from "@/utils/axiosInstance";
import { AxiosResponse } from "axios";
import { Employee } from "@/model/employee.model";

// Lấy danh sách nhân viên (endpoint: GET /employee/employees)
export const fetchEmployees = async (): Promise<Employee[]> => {
  const response: AxiosResponse<Employee[]> = await axiosInstance.get(
    "/employee/employees"
  );
  return response.data;
};

// Lấy danh sách khu vực (endpoint: GET /area)
export const fetchAreas = async (): Promise<any[]> => {
  const response: AxiosResponse<any[]> = await axiosInstance.get("/area");
  return response.data;
};

// Tạo mới nhân viên đồng thời tạo tài khoản user với roleId được chọn
export const createEmployee = async (employeeData: any): Promise<Employee> => {
  const payload = {
    ...employeeData,
    user: {
      username: employeeData.username || employeeData.email,
      password: employeeData.password || "defaultPassword",
      // Chọn roleId từ form, backend có thể chuyển thành mảng hoặc xử lý theo logic riêng
      roleIds: [employeeData.roleId],
    },
  };

  const response: AxiosResponse<Employee> = await axiosInstance.post(
    "/employee/create",
    payload
  );
  return response.data;
};

// Cập nhật nhân viên (endpoint: PUT /employee/update/:id)
// Cập nhật nhân viên (endpoint: PUT /employee/update/:id)
export const updateEmployee = async (
  id: number,
  employeeData: any
): Promise<Employee> => {
  const response: AxiosResponse<Employee> = await axiosInstance.put(
    `/employee/update/${id}`,
    employeeData
  );
  return response.data;
};

// Xoá nhân viên (endpoint: DELETE /employee/delete/:id)
export const deleteEmployee = async (id: number): Promise<void> => {
  console.log("delete emp");
  await axiosInstance.delete(`/employee/delete/${id}`);
};
